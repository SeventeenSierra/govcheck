# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

"""
Pydantic models for API request/response validation.

This module defines the data models used for API endpoints,
ensuring type safety and validation for all requests and responses.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from uuid import UUID
from pydantic import BaseModel, Field, validator


class DocumentLocation(BaseModel):
    """Location information within a document."""
    page: Optional[int] = Field(None, description="Page number where issue was found")
    section: Optional[str] = Field(None, description="Document section identifier")
    line: Optional[int] = Field(None, description="Line number within the page")
    context: Optional[str] = Field(None, description="Surrounding text context")


class RegulatoryReference(BaseModel):
    """Reference to specific regulatory requirements."""
    regulation: str = Field(..., description="Regulation name (e.g., FAR, DFARS)")
    section: str = Field(..., description="Specific section reference")
    title: str = Field(..., description="Human-readable title of the requirement")
    url: Optional[str] = Field(None, description="URL to the full regulation text")


class ComplianceIssue(BaseModel):
    """Individual compliance issue found during analysis."""
    id: str = Field(..., description="Unique identifier for this issue")
    severity: Literal["critical", "warning", "info"] = Field(..., description="Issue severity level")
    title: str = Field(..., description="Brief title describing the issue")
    description: str = Field(..., description="Detailed description of the compliance issue")
    regulation: RegulatoryReference = Field(..., description="Related regulatory requirement")
    location: Optional[DocumentLocation] = Field(None, description="Location within document")
    remediation: Optional[str] = Field(None, description="Suggested remediation steps")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI confidence score (0-1)")


class ComplianceSummary(BaseModel):
    """Summary of compliance analysis results."""
    total_issues: int = Field(..., ge=0, description="Total number of issues found")
    critical_count: int = Field(..., ge=0, description="Number of critical issues")
    warning_count: int = Field(..., ge=0, description="Number of warning issues")
    info_count: int = Field(..., ge=0, description="Number of informational issues")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall compliance score (0-100)")
    pass_threshold: float = Field(default=80.0, description="Minimum score for passing compliance")
    
    @validator('critical_count', 'warning_count', 'info_count')
    def validate_counts(cls, v, values):
        """Ensure individual counts don't exceed total."""
        if 'total_issues' in values and v > values['total_issues']:
            raise ValueError('Individual count cannot exceed total issues')
        return v


class AnalysisStartRequest(BaseModel):
    """Request model for starting document analysis."""
    document_id: str = Field(..., description="Unique identifier for the document")
    filename: str = Field(..., description="Original filename of the document")
    s3_key: str = Field(..., description="S3 object key for the document")
    analysis_type: Literal["compliance", "full"] = Field(default="compliance", description="Type of analysis to perform")
    priority: Literal["low", "normal", "high"] = Field(default="normal", description="Analysis priority level")
    callback_url: Optional[str] = Field(None, description="URL to notify when analysis completes")


class AnalysisStartResponse(BaseModel):
    """Response model for analysis start request."""
    success: bool = Field(..., description="Whether the request was successful")
    session_id: str = Field(..., description="Unique session identifier for tracking")
    status: Literal["queued", "started"] = Field(..., description="Initial status of the analysis")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    message: str = Field(..., description="Human-readable status message")


class AnalysisStatusResponse(BaseModel):
    """Response model for analysis status requests."""
    success: bool = Field(..., description="Whether the request was successful")
    session_id: str = Field(..., description="Session identifier")
    status: Literal["queued", "extracting", "analyzing", "completed", "failed"] = Field(..., description="Current analysis status")
    progress: float = Field(..., ge=0.0, le=100.0, description="Progress percentage (0-100)")
    current_step: str = Field(..., description="Description of current processing step")
    started_at: datetime = Field(..., description="When analysis started")
    completed_at: Optional[datetime] = Field(None, description="When analysis completed")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    error_message: Optional[str] = Field(None, description="Error message if analysis failed")


class ComplianceResults(BaseModel):
    """Complete compliance analysis results."""
    id: str = Field(..., description="Unique identifier for these results")
    session_id: str = Field(..., description="Associated analysis session ID")
    document_id: str = Field(..., description="Document that was analyzed")
    status: Literal["pass", "fail", "warning"] = Field(..., description="Overall compliance status")
    issues: List[ComplianceIssue] = Field(default_factory=list, description="List of compliance issues found")
    summary: ComplianceSummary = Field(..., description="Summary statistics")
    generated_at: datetime = Field(..., description="When results were generated")
    ai_model: str = Field(..., description="AI model used for analysis")
    processing_time: float = Field(..., ge=0.0, description="Processing time in seconds")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class AnalysisResultsResponse(BaseModel):
    """Response model for analysis results requests."""
    success: bool = Field(..., description="Whether the request was successful")
    results: Optional[ComplianceResults] = Field(None, description="Analysis results if available")
    message: str = Field(..., description="Human-readable status message")


class ErrorResponse(BaseModel):
    """Standard error response model."""
    success: bool = Field(default=False, description="Always false for error responses")
    error: str = Field(..., description="Error message")
    code: str = Field(..., description="Error code for programmatic handling")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When error occurred")
    service: str = Field(default="strands", description="Service that generated the error")
    request_id: str = Field(..., description="Unique request identifier for tracing")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class HealthCheckResponse(BaseModel):
    """Health check response model."""
    status: Literal["healthy", "degraded", "unhealthy"] = Field(..., description="Overall service status")
    service: str = Field(default="strands", description="Service name")
    version: str = Field(..., description="Service version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Health check timestamp")
    environment: str = Field(..., description="Deployment environment")
    checks: Dict[str, Any] = Field(..., description="Individual component health status")


class ProcessingStatusResponse(BaseModel):
    """Processing status response model."""
    success: bool = Field(..., description="Whether the request was successful")
    status: Dict[str, Any] = Field(..., description="Processing queue and worker status")
    timestamp: datetime = Field(..., description="Status timestamp")


class CancelAnalysisResponse(BaseModel):
    """Cancel analysis response model."""
    success: bool = Field(..., description="Whether cancellation was successful")
    message: str = Field(..., description="Human-readable status message")