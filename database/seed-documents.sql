-- SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

-- Seed database with document metadata from src/seed-data PDFs
-- This script creates document metadata entries for all 30 real PDF files

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(255) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    s3_key VARCHAR(500) NOT NULL,
    upload_status VARCHAR(50) NOT NULL DEFAULT 'seeded',
    text_extracted BOOLEAN NOT NULL DEFAULT FALSE,
    text_length INTEGER,
    pdf_metadata JSONB DEFAULT '{}',
    processing_metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_document_id ON documents(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
CREATE INDEX IF NOT EXISTS idx_documents_upload_status ON documents(upload_status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);

-- Create document_metadata table for Strands service compatibility
CREATE TABLE IF NOT EXISTS document_metadata (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id VARCHAR(255) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    s3_key VARCHAR(500) NOT NULL UNIQUE,
    upload_status VARCHAR(50) NOT NULL DEFAULT 'seeded',
    text_extracted BOOLEAN NOT NULL DEFAULT FALSE,
    text_length INTEGER,
    pdf_metadata JSONB DEFAULT '{}',
    processing_metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for document_metadata table
CREATE INDEX IF NOT EXISTS idx_document_metadata_document_id ON document_metadata(document_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_filename ON document_metadata(filename);
CREATE INDEX IF NOT EXISTS idx_document_metadata_upload_status ON document_metadata(upload_status);
CREATE INDEX IF NOT EXISTS idx_document_metadata_uploaded_at ON document_metadata(uploaded_at);

-- Insert seed document metadata (30 real PDF files from src/seed-data)
INSERT INTO documents (document_id, filename, original_filename, file_size, s3_key, pdf_metadata, processing_metadata) VALUES
-- Baecher Joseph proposals
('d1f8a239-27c0-4a38-a333-ea4e82533d1b', 'baecher_joseph_2023_d1f8a239-27c0-4a38-a333-ea4e82533d1b_PROPOSAL_1.pdf', 'baecher_joseph_2023_PROPOSAL_1.pdf', 1024000, 'seed-data/baecher_joseph_2023_d1f8a239-27c0-4a38-a333-ea4e82533d1b_PROPOSAL_1.pdf', '{"author": "Joseph Baecher", "year": 2023, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),
('c6f0ae22-48ba-4044-a44c-d860f9b8d17f', 'baecher_joseph_2024_c6f0ae22-48ba-4044-a44c-d860f9b8d17f_PROPOSAL_1.pdf', 'baecher_joseph_2024_PROPOSAL_1.pdf', 1024000, 'seed-data/baecher_joseph_2024_c6f0ae22-48ba-4044-a44c-d860f9b8d17f_PROPOSAL_1.pdf', '{"author": "Joseph Baecher", "year": 2024, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Barker Michelle proposal
('1b5d2213-4c72-4da8-a7b8-bece5b27d280', 'barker_michelle_2020_1b5d2213-4c72-4da8-a7b8-bece5b27d280_PROPOSAL_1.pdf', 'barker_michelle_2020_PROPOSAL_1.pdf', 1024000, 'seed-data/barker_michelle_2020_1b5d2213-4c72-4da8-a7b8-bece5b27d280_PROPOSAL_1.pdf', '{"author": "Michelle Barker", "year": 2020, "funder": "Wellcome Trust", "program": "Discretionary", "title": "FAIR for Research Software projects"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Bertolet Brittnil proposal
('9d34d838-4fd8-4fbd-b94e-766d1dd82d23', 'bertolet_brittnil_2021_9d34d838-4fd8-4fbd-b94e-766d1dd82d23_PROPOSAL_1.pdf', 'bertolet_brittnil_2021_PROPOSAL_1.pdf', 1024000, 'seed-data/bertolet_brittnil_2021_9d34d838-4fd8-4fbd-b94e-766d1dd82d23_PROPOSAL_1.pdf', '{"author": "Brittnil Bertolet", "year": 2021, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Brown Ctitus proposal
('afd7eaff-7bea-45d0-be3e-33188b448cd1', 'brown_ctitus_2014_afd7eaff-7bea-45d0-be3e-33188b448cd1_PROPOSAL_1.pdf', 'brown_ctitus_2014_PROPOSAL_1.pdf', 1024000, 'seed-data/brown_ctitus_2014_afd7eaff-7bea-45d0-be3e-33188b448cd1_PROPOSAL_1.pdf', '{"author": "Ctitus Brown", "year": 2014, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Burnette Elizabeth proposal
('c2106ced-aa31-4c18-befb-9309a38122bc', 'burnette_elizabeth_2020_c2106ced-aa31-4c18-befb-9309a38122bc_PROPOSAL_1.pdf', 'burnette_elizabeth_2020_PROPOSAL_1.pdf', 1024000, 'seed-data/burnette_elizabeth_2020_c2106ced-aa31-4c18-befb-9309a38122bc_PROPOSAL_1.pdf', '{"author": "Elizabeth Burnette", "year": 2020, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Dasari Mauna proposal
('4a81a377-e0e9-43b6-b301-7a3058b0d012', 'dasari_mauna_2021_4a81a377-e0e9-43b6-b301-7a3058b0d012_PROPOSAL_1.pdf', 'dasari_mauna_2021_PROPOSAL_1.pdf', 1024000, 'seed-data/dasari_mauna_2021_4a81a377-e0e9-43b6-b301-7a3058b0d012_PROPOSAL_1.pdf', '{"author": "Mauna Dasari", "year": 2021, "funder": "U.S. National Science Foundation (NSF)", "program": "Postdoctoral Research Fellowship in Biology (Area: Rules of Life)", "title": "Using metacommunity theory to assess the impact of multi-species interactions on gut microbial assembly"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Dumitrescu Adna proposal
('73405efc-b6bc-4787-ae90-005cc7c970e1', 'dumitrescu_adna_2020_73405efc-b6bc-4787-ae90-005cc7c970e1_PROPOSAL_1.pdf', 'dumitrescu_adna_2020_PROPOSAL_1.pdf', 1024000, 'seed-data/dumitrescu_adna_2020_73405efc-b6bc-4787-ae90-005cc7c970e1_PROPOSAL_1.pdf', '{"author": "Adna Dumitrescu", "year": 2020, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Durvasula Arun proposals (3 documents)
('a6181fb8-a808-4808-abe9-627b5249b5ba-1', 'durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_1.pdf', 'durvasula_arun_2018_PROPOSAL_1.pdf', 1024000, 'seed-data/durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_1.pdf', '{"author": "Arun Durvasula", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 1}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),
('a6181fb8-a808-4808-abe9-627b5249b5ba-2', 'durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_2.pdf', 'durvasula_arun_2018_PROPOSAL_2.pdf', 1024000, 'seed-data/durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_2.pdf', '{"author": "Arun Durvasula", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 2}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),
('a6181fb8-a808-4808-abe9-627b5249b5ba-3', 'durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_3.pdf', 'durvasula_arun_2018_PROPOSAL_3.pdf', 1024000, 'seed-data/durvasula_arun_2018_a6181fb8-a808-4808-abe9-627b5249b5ba_PROPOSAL_3.pdf', '{"author": "Arun Durvasula", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 3}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Frazer Ryane proposal
('74f22e94-b364-482e-a2c1-0892b705f0c6', 'frazer_ryane_2019_74f22e94-b364-482e-a2c1-0892b705f0c6_PROPOSAL_1.pdf', 'frazer_ryane_2019_PROPOSAL_1.pdf', 1024000, 'seed-data/frazer_ryane_2019_74f22e94-b364-482e-a2c1-0892b705f0c6_PROPOSAL_1.pdf', '{"author": "Ryane Frazer", "year": 2019, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Gregory Samantha proposal
('7f2475c4-2fad-498f-beac-e3044183b996', 'gregory_samantha_2018_7f2475c4-2fad-498f-beac-e3044183b996_PROPOSAL_1.pdf', 'gregory_samantha_2018_PROPOSAL_1.pdf', 1024000, 'seed-data/gregory_samantha_2018_7f2475c4-2fad-498f-beac-e3044183b996_PROPOSAL_1.pdf', '{"author": "Samantha Gregory", "year": 2018, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Howard Cody proposal
('7df74802-fd8e-4625-b65a-ea403b5b90eb', 'howard_cody_2018_7df74802-fd8e-4625-b65a-ea403b5b90eb_PROPOSAL_1.pdf', 'howard_cody_2018_PROPOSAL_1.pdf', 1024000, 'seed-data/howard_cody_2018_7df74802-fd8e-4625-b65a-ea403b5b90eb_PROPOSAL_1.pdf', '{"author": "Cody Howard", "year": 2018, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Huber Felix proposal
('83149f42-7406-48f8-996a-6936727b3dca', 'huber_felix_2017_83149f42-7406-48f8-996a-6936727b3dca_PROPOSAL_1.pdf', 'huber_felix_2017_PROPOSAL_1.pdf', 1024000, 'seed-data/huber_felix_2017_83149f42-7406-48f8-996a-6936727b3dca_PROPOSAL_1.pdf', '{"author": "Felix Huber", "year": 2017, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Jensen Jan proposal
('02ecd4f0-ac84-4cf4-8d10-1aed8faa6767', 'jensen_jan_2015_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767_PROPOSAL_1.pdf', 'jensen_jan_2015_PROPOSAL_1.pdf', 1024000, 'seed-data/jensen_jan_2015_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767_PROPOSAL_1.pdf', '{"author": "Jan Jensen", "year": 2015, "funder": "Danish National Science Foundation", "program": "Chemical Physics", "title": "High Throughput pKa Prediction Using Semi Empirical Methods"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Komarov Ilya proposal
('a5b26dc5-0ee9-40c8-84fd-0e3cede9b81b', 'komarov_ilya_2020_a5b26dc5-0ee9-40c8-84fd-0e3cede9b81b_PROPOSAL_1.pdf', 'komarov_ilya_2020_PROPOSAL_1.pdf', 1024000, 'seed-data/komarov_ilya_2020_a5b26dc5-0ee9-40c8-84fd-0e3cede9b81b_PROPOSAL_1.pdf', '{"author": "Ilya Komarov", "year": 2020, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Miller Henrye proposal
('63807985-2a63-463b-afea-fae710d3fe6c', 'miller_henrye_2020_63807985-2a63-463b-afea-fae710d3fe6c_PROPOSAL_1.pdf', 'miller_henrye_2020_PROPOSAL_1.pdf', 1024000, 'seed-data/miller_henrye_2020_63807985-2a63-463b-afea-fae710d3fe6c_PROPOSAL_1.pdf', '{"author": "Henrye Miller", "year": 2020, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Nell Lucas proposal
('6306262d-9317-4f58-aadc-caf26325862d', 'nell_lucas_2022_6306262d-9317-4f58-aadc-caf26325862d_PROPOSAL_1.pdf', 'nell_lucas_2022_PROPOSAL_1.pdf', 1024000, 'seed-data/nell_lucas_2022_6306262d-9317-4f58-aadc-caf26325862d_PROPOSAL_1.pdf', '{"author": "Lucas Nell", "year": 2022, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Polino Alexander proposal
('f990c0ee-e9e0-4f31-b050-9ed3a0b4c2e5', 'polino_alexander_2017_f990c0ee-e9e0-4f31-b050-9ed3a0b4c2e5_PROPOSAL_1.pdf', 'polino_alexander_2017_PROPOSAL_1.pdf', 1024000, 'seed-data/polino_alexander_2017_f990c0ee-e9e0-4f31-b050-9ed3a0b4c2e5_PROPOSAL_1.pdf', '{"author": "Alexander Polino", "year": 2017, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Rick Jessica proposal
('7c82d464-e242-4d87-a885-5cf34776edba', 'rick_jessica_2021_7c82d464-e242-4d87-a885-5cf34776edba_PROPOSAL_1.pdf', 'rick_jessica_2021_PROPOSAL_1.pdf', 1024000, 'seed-data/rick_jessica_2021_7c82d464-e242-4d87-a885-5cf34776edba_PROPOSAL_1.pdf', '{"author": "Jessica Rick", "year": 2021, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Ross-Ibarra Jeff proposal
('4b7df1c7-1b2a-4453-b28b-8155e538092a', 'ross-ibarra_jeff_2015_4b7df1c7-1b2a-4453-b28b-8155e538092a_PROPOSAL_1.pdf', 'ross-ibarra_jeff_2015_PROPOSAL_1.pdf', 1024000, 'seed-data/ross-ibarra_jeff_2015_4b7df1c7-1b2a-4453-b28b-8155e538092a_PROPOSAL_1.pdf', '{"author": "Jeff Ross-Ibarra", "year": 2015, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Scott Catherine proposal
('b2f9e87e-691f-4d7b-9562-bc5d41940d68', 'scott_catherine_2015_b2f9e87e-691f-4d7b-9562-bc5d41940d68_PROPOSAL_1.pdf', 'scott_catherine_2015_PROPOSAL_1.pdf', 1024000, 'seed-data/scott_catherine_2015_b2f9e87e-691f-4d7b-9562-bc5d41940d68_PROPOSAL_1.pdf', '{"author": "Catherine Scott", "year": 2015, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Sinclair Alyssa proposal
('84088593-1546-4a1b-994e-1f15232324a8', 'sinclair_alyssa_2019_84088593-1546-4a1b-994e-1f15232324a8_PROPOSAL_1.pdf', 'sinclair_alyssa_2019_PROPOSAL_1.pdf', 1024000, 'seed-data/sinclair_alyssa_2019_84088593-1546-4a1b-994e-1f15232324a8_PROPOSAL_1.pdf', '{"author": "Alyssa Sinclair", "year": 2019, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Tollerud Erik proposal
('f1e5a9f7-aec3-4aae-b573-9c60a6e4b367', 'tollerud_erik_2019_f1e5a9f7-aec3-4aae-b573-9c60a6e4b367_PROPOSAL_1.pdf', 'tollerud_erik_2019_PROPOSAL_1.pdf', 1024000, 'seed-data/tollerud_erik_2019_f1e5a9f7-aec3-4aae-b573-9c60a6e4b367_PROPOSAL_1.pdf', '{"author": "Erik Tollerud", "year": 2019, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Whitehead Andrew proposal
('e537db5c-8e90-4844-b560-c355a5445c0b', 'whitehead_andrew_2021_e537db5c-8e90-4844-b560-c355a5445c0b_PROPOSAL_1.pdf', 'whitehead_andrew_2021_PROPOSAL_1.pdf', 1024000, 'seed-data/whitehead_andrew_2021_e537db5c-8e90-4844-b560-c355a5445c0b_PROPOSAL_1.pdf', '{"author": "Andrew Whitehead", "year": 2021, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Zhu Rebecca proposal
('4ba83e42-2b3d-4b9c-9eda-2e12fc44be69', 'zhu_rebecca_2018_4ba83e42-2b3d-4b9c-9eda-2e12fc44be69_PROPOSAL_1.pdf', 'zhu_rebecca_2018_PROPOSAL_1.pdf', 1024000, 'seed-data/zhu_rebecca_2018_4ba83e42-2b3d-4b9c-9eda-2e12fc44be69_PROPOSAL_1.pdf', '{"author": "Rebecca Zhu", "year": 2018, "funder": "NSF", "program": "Research Grant"}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),

-- Zorowitz Sam proposals (3 documents)
('6e80b3f1-69ca-4e67-af69-00857dc48952-1', 'zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_1.pdf', 'zorowitz_sam_2018_PROPOSAL_1.pdf', 1024000, 'seed-data/zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_1.pdf', '{"author": "Sam Zorowitz", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 1}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),
('6e80b3f1-69ca-4e67-af69-00857dc48952-2', 'zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_2.pdf', 'zorowitz_sam_2018_PROPOSAL_2.pdf', 1024000, 'seed-data/zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_2.pdf', '{"author": "Sam Zorowitz", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 2}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}'),
('6e80b3f1-69ca-4e67-af69-00857dc48952-3', 'zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_3.pdf', 'zorowitz_sam_2018_PROPOSAL_3.pdf', 1024000, 'seed-data/zorowitz_sam_2018_6e80b3f1-69ca-4e67-af69-00857dc48952_PROPOSAL_3.pdf', '{"author": "Sam Zorowitz", "year": 2018, "funder": "NSF", "program": "Research Grant", "proposal_number": 3}', '{"source": "seed_data", "seeded_at": "2025-01-01T00:00:00Z"}')

ON CONFLICT (document_id) DO NOTHING;

-- Also insert into document_metadata table for Strands service compatibility
INSERT INTO document_metadata (document_id, filename, original_filename, file_size, s3_key, pdf_metadata, processing_metadata) 
SELECT document_id, filename, original_filename, file_size, s3_key, pdf_metadata, processing_metadata 
FROM documents
ON CONFLICT (document_id) DO NOTHING;

-- Create a function to get document count for verification
CREATE OR REPLACE FUNCTION get_seeded_document_count() RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM documents WHERE upload_status = 'seeded');
END;
$$ LANGUAGE plpgsql;

-- Log seeding completion
DO $$
DECLARE
    doc_count INTEGER;
BEGIN
    SELECT get_seeded_document_count() INTO doc_count;
    RAISE NOTICE 'Database seeding completed. Seeded % documents from src/seed-data/', doc_count;
END $$;