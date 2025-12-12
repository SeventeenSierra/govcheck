"""
SQLAlchemy database models for the Strands service.

This module defines the database schema for analysis sessions,
compliance results, and related entities using SQLAlchemy ORM.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Text, Boolean, 
    ForeignKey, JSON, Enum, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
import enum

from database import Base


class AnalysisStatus(str, enum.Enum):
    """Enumeration for analysis session status."""
    QUEUED = "queued"
    EXTRACTING = "extracting"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class ComplianceStatus(str, enum.Enum):
    """Enumeration for compliance analysis results."""
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"


class IssueSeverity(str, enum.Enum):
    """Enumeration for compliance issue severity levels."""
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class AnalysisSessionDB(Base):
    """
    Database model for analysis sessions.
    
    Tracks the state and progress of document analysis requests.
    """
    __tablename__ = "analysis_sessions"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Document information
    document_id = Column(String, nullable=False, index=True)
    filename = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    
    # Analysis configuration
    analysis_type = Column(String, nullable=False, default="compliance")
    priority = Column(String, nullable=False, default="normal")
    callback_url = Column(String, nullable=True)
    
    # Status and progress tracking
    status = Column(Enum(AnalysisStatus), nullable=False, default=AnalysisStatus.QUEUED, index=True)
    progress = Column(Float, nullable=False, default=0.0)
    current_step = Column(String, nullable=False, default="Initializing analysis")
    
    # Timing information
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    estimated_completion = Column(DateTime, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)
    
    # Metadata (using different column name to avoid SQLAlchemy conflict)
    session_metadata = Column("metadata", JSONB, nullable=True, default=dict)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    results = relationship("ComplianceResultsDB", back_populates="session", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_analysis_sessions_document_id', 'document_id'),
        Index('idx_analysis_sessions_status', 'status'),
        Index('idx_analysis_sessions_started_at', 'started_at'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for API responses."""
        return {
            "session_id": self.id,
            "document_id": self.document_id,
            "filename": self.filename,
            "s3_key": self.s3_key,
            "analysis_type": self.analysis_type,
            "priority": self.priority,
            "callback_url": self.callback_url,
            "status": self.status.value,
            "progress": self.progress,
            "current_step": self.current_step,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "estimated_completion": self.estimated_completion,
            "error_message": self.error_message,
            "retry_count": self.retry_count,
            "metadata": self.session_metadata or {},
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }


class ComplianceResultsDB(Base):
    """
    Database model for compliance analysis results.
    
    Stores the complete results of document compliance analysis.
    """
    __tablename__ = "compliance_results"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key to analysis session
    session_id = Column(String, ForeignKey("analysis_sessions.id"), nullable=False, index=True)
    
    # Document information
    document_id = Column(String, nullable=False, index=True)
    
    # Analysis results
    status = Column(Enum(ComplianceStatus), nullable=False, index=True)
    ai_model = Column(String, nullable=False)
    processing_time = Column(Float, nullable=False)
    
    # Summary statistics
    total_issues = Column(Integer, nullable=False, default=0)
    critical_count = Column(Integer, nullable=False, default=0)
    warning_count = Column(Integer, nullable=False, default=0)
    info_count = Column(Integer, nullable=False, default=0)
    overall_score = Column(Float, nullable=False, default=0.0)
    pass_threshold = Column(Float, nullable=False, default=80.0)
    
    # Metadata and timestamps
    results_metadata = Column("metadata", JSONB, nullable=True, default=dict)
    generated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    session = relationship("AnalysisSessionDB", back_populates="results")
    issues = relationship("ComplianceIssueDB", back_populates="results", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_compliance_results_session_id', 'session_id'),
        Index('idx_compliance_results_document_id', 'document_id'),
        Index('idx_compliance_results_status', 'status'),
        Index('idx_compliance_results_generated_at', 'generated_at'),
        UniqueConstraint('session_id', name='uq_compliance_results_session_id'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "session_id": self.session_id,
            "document_id": self.document_id,
            "status": self.status.value,
            "ai_model": self.ai_model,
            "processing_time": self.processing_time,
            "summary": {
                "total_issues": self.total_issues,
                "critical_count": self.critical_count,
                "warning_count": self.warning_count,
                "info_count": self.info_count,
                "overall_score": self.overall_score,
                "pass_threshold": self.pass_threshold
            },
            "metadata": self.results_metadata or {},
            "generated_at": self.generated_at,
            "created_at": self.created_at,
            "issues": [issue.to_dict() for issue in self.issues] if self.issues else []
        }


class ComplianceIssueDB(Base):
    """
    Database model for individual compliance issues.
    
    Stores detailed information about specific compliance violations found.
    """
    __tablename__ = "compliance_issues"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key to compliance results
    results_id = Column(String, ForeignKey("compliance_results.id"), nullable=False, index=True)
    
    # Issue details
    severity = Column(Enum(IssueSeverity), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    remediation = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False)
    
    # Regulatory reference
    regulation_name = Column(String, nullable=False)
    regulation_section = Column(String, nullable=False)
    regulation_title = Column(String, nullable=False)
    regulation_url = Column(String, nullable=True)
    
    # Document location (optional)
    location_page = Column(Integer, nullable=True)
    location_section = Column(String, nullable=True)
    location_line = Column(Integer, nullable=True)
    location_context = Column(Text, nullable=True)
    
    # Metadata and timestamps
    issue_metadata = Column("metadata", JSONB, nullable=True, default=dict)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    results = relationship("ComplianceResultsDB", back_populates="issues")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_compliance_issues_results_id', 'results_id'),
        Index('idx_compliance_issues_severity', 'severity'),
        Index('idx_compliance_issues_regulation', 'regulation_name', 'regulation_section'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for API responses."""
        issue_dict = {
            "id": self.id,
            "severity": self.severity.value,
            "title": self.title,
            "description": self.description,
            "remediation": self.remediation,
            "confidence": self.confidence,
            "regulation": {
                "regulation": self.regulation_name,
                "section": self.regulation_section,
                "title": self.regulation_title,
                "url": self.regulation_url
            },
            "metadata": self.issue_metadata or {},
            "created_at": self.created_at
        }
        
        # Add location if available
        if any([self.location_page, self.location_section, self.location_line, self.location_context]):
            issue_dict["location"] = {
                "page": self.location_page,
                "section": self.location_section,
                "line": self.location_line,
                "context": self.location_context
            }
        
        return issue_dict


class DocumentMetadataDB(Base):
    """
    Database model for document metadata and processing history.
    
    Tracks document uploads, processing status, and metadata.
    """
    __tablename__ = "document_metadata"
    
    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Document identification
    document_id = Column(String, nullable=False, unique=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    
    # File information
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    s3_key = Column(String, nullable=False, unique=True)
    
    # Processing status
    upload_status = Column(String, nullable=False, default="uploaded")
    text_extracted = Column(Boolean, nullable=False, default=False)
    text_length = Column(Integer, nullable=True)
    
    # Metadata
    pdf_metadata = Column(JSONB, nullable=True, default=dict)
    processing_metadata = Column(JSONB, nullable=True, default=dict)
    
    # Timestamps
    uploaded_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_document_metadata_document_id', 'document_id'),
        Index('idx_document_metadata_filename', 'filename'),
        Index('idx_document_metadata_uploaded_at', 'uploaded_at'),
        Index('idx_document_metadata_upload_status', 'upload_status'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "document_id": self.document_id,
            "filename": self.filename,
            "original_filename": self.original_filename,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "s3_key": self.s3_key,
            "upload_status": self.upload_status,
            "text_extracted": self.text_extracted,
            "text_length": self.text_length,
            "pdf_metadata": self.pdf_metadata or {},
            "processing_metadata": self.processing_metadata or {},
            "uploaded_at": self.uploaded_at,
            "last_processed_at": self.last_processed_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }