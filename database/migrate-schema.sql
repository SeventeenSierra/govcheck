-- SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

-- Migration script to ensure database schema compatibility between web and Strands services
-- This script creates or updates tables to support both services

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create analysis_sessions table for Strands service
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    analysis_type VARCHAR(50) NOT NULL DEFAULT 'compliance',
    priority VARCHAR(50) NOT NULL DEFAULT 'normal',
    callback_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    progress FLOAT NOT NULL DEFAULT 0.0,
    current_step VARCHAR(255) NOT NULL DEFAULT 'Initializing analysis',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for analysis_sessions
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_document_id ON analysis_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_started_at ON analysis_sessions(started_at);

-- Create compliance_results table for Strands service
CREATE TABLE IF NOT EXISTS compliance_results (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id VARCHAR(255) NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    document_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    ai_model VARCHAR(100) NOT NULL,
    processing_time FLOAT NOT NULL,
    total_issues INTEGER NOT NULL DEFAULT 0,
    critical_count INTEGER NOT NULL DEFAULT 0,
    warning_count INTEGER NOT NULL DEFAULT 0,
    info_count INTEGER NOT NULL DEFAULT 0,
    overall_score FLOAT NOT NULL DEFAULT 0.0,
    pass_threshold FLOAT NOT NULL DEFAULT 80.0,
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(session_id)
);

-- Create indexes for compliance_results
CREATE INDEX IF NOT EXISTS idx_compliance_results_session_id ON compliance_results(session_id);
CREATE INDEX IF NOT EXISTS idx_compliance_results_document_id ON compliance_results(document_id);
CREATE INDEX IF NOT EXISTS idx_compliance_results_status ON compliance_results(status);
CREATE INDEX IF NOT EXISTS idx_compliance_results_generated_at ON compliance_results(generated_at);

-- Create compliance_issues table for Strands service
CREATE TABLE IF NOT EXISTS compliance_issues (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    results_id VARCHAR(255) NOT NULL REFERENCES compliance_results(id) ON DELETE CASCADE,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    remediation TEXT,
    confidence FLOAT NOT NULL,
    regulation_name VARCHAR(100) NOT NULL,
    regulation_section VARCHAR(100) NOT NULL,
    regulation_title VARCHAR(255) NOT NULL,
    regulation_url VARCHAR(500),
    location_page INTEGER,
    location_section VARCHAR(255),
    location_line INTEGER,
    location_context TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for compliance_issues
CREATE INDEX IF NOT EXISTS idx_compliance_issues_results_id ON compliance_issues(results_id);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_severity ON compliance_issues(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_regulation ON compliance_issues(regulation_name, regulation_section);

-- Update existing proposals table to be compatible with document_metadata
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS document_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) DEFAULT 'application/pdf',
ADD COLUMN IF NOT EXISTS s3_key VARCHAR(500),
ADD COLUMN IF NOT EXISTS upload_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS pdf_metadata JSONB DEFAULT '{}';

-- Create unique index on document_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_proposals_document_id') THEN
        CREATE INDEX idx_proposals_document_id ON proposals(document_id);
    END IF;
END $$;

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_analysis_sessions_updated_at ON analysis_sessions;
CREATE TRIGGER update_analysis_sessions_updated_at 
    BEFORE UPDATE ON analysis_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view to unify document access across services
CREATE OR REPLACE VIEW unified_documents AS
SELECT 
    COALESCE(dm.document_id, p.document_id) as document_id,
    COALESCE(dm.filename, p.filename) as filename,
    COALESCE(dm.original_filename, p.title) as original_filename,
    COALESCE(dm.file_size, p.file_size) as file_size,
    COALESCE(dm.mime_type, p.mime_type, 'application/pdf') as mime_type,
    COALESCE(dm.s3_key, p.s3_key) as s3_key,
    COALESCE(dm.upload_status, p.upload_status, p.status) as upload_status,
    COALESCE(dm.pdf_metadata, p.pdf_metadata, '{}') as pdf_metadata,
    COALESCE(dm.uploaded_at, p.created_at) as uploaded_at,
    COALESCE(dm.created_at, p.created_at) as created_at,
    COALESCE(dm.updated_at, p.updated_at) as updated_at,
    'document_metadata' as source_table
FROM document_metadata dm
FULL OUTER JOIN proposals p ON dm.document_id = p.document_id
WHERE dm.document_id IS NOT NULL OR p.document_id IS NOT NULL;

-- Create function to get document count by status
CREATE OR REPLACE FUNCTION get_document_count_by_status(status_filter VARCHAR DEFAULT NULL)
RETURNS TABLE(status VARCHAR, count BIGINT) AS $$
BEGIN
    IF status_filter IS NULL THEN
        RETURN QUERY
        SELECT 
            ud.upload_status::VARCHAR as status,
            COUNT(*)::BIGINT as count
        FROM unified_documents ud
        GROUP BY ud.upload_status
        ORDER BY ud.upload_status;
    ELSE
        RETURN QUERY
        SELECT 
            status_filter::VARCHAR as status,
            COUNT(*)::BIGINT as count
        FROM unified_documents ud
        WHERE ud.upload_status = status_filter;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to check seeding completeness
CREATE OR REPLACE FUNCTION check_seeding_completeness()
RETURNS TABLE(
    total_expected INTEGER,
    seeded_count BIGINT,
    completion_percentage NUMERIC
) AS $$
DECLARE
    expected_count INTEGER := 30; -- Expected number of seed documents
BEGIN
    RETURN QUERY
    SELECT 
        expected_count as total_expected,
        COUNT(*)::BIGINT as seeded_count,
        ROUND((COUNT(*)::NUMERIC / expected_count::NUMERIC) * 100, 2) as completion_percentage
    FROM unified_documents ud
    WHERE ud.upload_status = 'seeded';
END;
$$ LANGUAGE plpgsql;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Database schema migration completed successfully';
    RAISE NOTICE 'Created tables: analysis_sessions, compliance_results, compliance_issues';
    RAISE NOTICE 'Updated proposals table with document metadata columns';
    RAISE NOTICE 'Created unified_documents view for cross-service compatibility';
END $$;