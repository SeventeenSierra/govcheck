"""
Basic test for database integration functionality.

This test verifies that the database models and operations work correctly
without requiring a full database connection.
"""

import pytest
from datetime import datetime
from models import (
    AnalysisStartRequest, ComplianceResults, ComplianceIssue, 
    ComplianceSummary, RegulatoryReference
)
from db_models import AnalysisSessionDB, ComplianceResultsDB, ComplianceIssueDB, AnalysisStatus, ComplianceStatus, IssueSeverity


def test_analysis_session_model_creation():
    """Test that AnalysisSessionDB model can be created with valid data."""
    session = AnalysisSessionDB(
        document_id="test-doc-123",
        filename="test.pdf",
        s3_key="documents/test.pdf",
        analysis_type="compliance",
        priority="normal",
        progress=0.0,
        retry_count=0,
        status=AnalysisStatus.QUEUED,
        current_step="Initializing analysis"
    )
    
    assert session.document_id == "test-doc-123"
    assert session.filename == "test.pdf"
    assert session.s3_key == "documents/test.pdf"
    assert session.analysis_type == "compliance"
    assert session.priority == "normal"
    assert session.progress == 0.0
    assert session.retry_count == 0
    assert session.status == AnalysisStatus.QUEUED


def test_analysis_session_to_dict():
    """Test that AnalysisSessionDB.to_dict() works correctly."""
    session = AnalysisSessionDB(
        document_id="test-doc-123",
        filename="test.pdf",
        s3_key="documents/test.pdf",
        analysis_type="compliance",
        priority="normal",
        progress=0.0,
        retry_count=0,
        status=AnalysisStatus.QUEUED,
        current_step="Initializing analysis"
    )
    
    session_dict = session.to_dict()
    
    assert session_dict["document_id"] == "test-doc-123"
    assert session_dict["filename"] == "test.pdf"
    assert session_dict["s3_key"] == "documents/test.pdf"
    assert session_dict["analysis_type"] == "compliance"
    assert session_dict["priority"] == "normal"
    assert session_dict["progress"] == 0.0
    assert session_dict["retry_count"] == 0
    assert session_dict["status"] == "queued"
    assert "metadata" in session_dict
    assert isinstance(session_dict["metadata"], dict)


def test_compliance_results_model_creation():
    """Test that ComplianceResultsDB model can be created with valid data."""
    results = ComplianceResultsDB(
        session_id="session-123",
        document_id="doc-123",
        status=ComplianceStatus.PASS,
        ai_model="test-model",
        processing_time=1.5,
        total_issues=2,
        critical_count=0,
        warning_count=1,
        info_count=1,
        overall_score=85.0
    )
    
    assert results.session_id == "session-123"
    assert results.document_id == "doc-123"
    assert results.ai_model == "test-model"
    assert results.processing_time == 1.5
    assert results.total_issues == 2
    assert results.overall_score == 85.0


def test_compliance_issue_model_creation():
    """Test that ComplianceIssueDB model can be created with valid data."""
    issue = ComplianceIssueDB(
        results_id="results-123",
        severity=IssueSeverity.WARNING,
        title="Test Issue",
        description="This is a test compliance issue",
        confidence=0.85,
        regulation_name="FAR",
        regulation_section="52.204-21",
        regulation_title="Basic Safeguarding of Covered Contractor Information Systems"
    )
    
    assert issue.results_id == "results-123"
    assert issue.severity.value == "warning"
    assert issue.title == "Test Issue"
    assert issue.confidence == 0.85
    assert issue.regulation_name == "FAR"
    assert issue.regulation_section == "52.204-21"


def test_analysis_start_request_validation():
    """Test that AnalysisStartRequest validates correctly."""
    request = AnalysisStartRequest(
        document_id="test-doc-123",
        filename="test.pdf",
        s3_key="documents/test.pdf"
    )
    
    assert request.document_id == "test-doc-123"
    assert request.filename == "test.pdf"
    assert request.s3_key == "documents/test.pdf"
    assert request.analysis_type == "compliance"  # default value
    assert request.priority == "normal"  # default value


def test_compliance_results_pydantic_model():
    """Test that ComplianceResults Pydantic model works correctly."""
    summary = ComplianceSummary(
        total_issues=1,
        critical_count=0,
        warning_count=1,
        info_count=0,
        overall_score=85.0
    )
    
    regulation = RegulatoryReference(
        regulation="FAR",
        section="52.204-21",
        title="Basic Safeguarding of Covered Contractor Information Systems"
    )
    
    issue = ComplianceIssue(
        id="issue-123",
        severity="warning",
        title="Test Issue",
        description="This is a test issue",
        regulation=regulation,
        confidence=0.85
    )
    
    results = ComplianceResults(
        id="results-123",
        session_id="session-123",
        document_id="doc-123",
        status="pass",
        issues=[issue],
        summary=summary,
        generated_at=datetime.utcnow(),
        ai_model="test-model",
        processing_time=1.5
    )
    
    assert results.session_id == "session-123"
    assert results.document_id == "doc-123"
    assert results.status == "pass"
    assert len(results.issues) == 1
    assert results.issues[0].severity == "warning"
    assert results.summary.total_issues == 1
    assert results.ai_model == "test-model"


if __name__ == "__main__":
    # Run basic tests without pytest
    print("Running database integration tests...")
    
    try:
        test_analysis_session_model_creation()
        print("✓ AnalysisSessionDB model creation test passed")
        
        test_analysis_session_to_dict()
        print("✓ AnalysisSessionDB to_dict test passed")
        
        test_compliance_results_model_creation()
        print("✓ ComplianceResultsDB model creation test passed")
        
        test_compliance_issue_model_creation()
        print("✓ ComplianceIssueDB model creation test passed")
        
        test_analysis_start_request_validation()
        print("✓ AnalysisStartRequest validation test passed")
        
        test_compliance_results_pydantic_model()
        print("✓ ComplianceResults Pydantic model test passed")
        
        print("\nAll database integration tests passed! ✅")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()