"""
Test AWS Bedrock integration functionality.

This test verifies that the AWS Bedrock integration works correctly,
including fallback behavior when AWS services are unavailable.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock

from aws_bedrock import BedrockClient, get_bedrock_client
from pdf_processor import PDFProcessor, get_pdf_processor
from fallback_analysis import FallbackAnalysisService, get_fallback_service
from models import ComplianceResults


class TestAWSBedrockIntegration:
    """Test AWS Bedrock integration functionality."""
    
    def test_bedrock_client_initialization(self):
        """Test that Bedrock client initializes without errors."""
        client = BedrockClient()
        assert client is not None
        assert client.model_id is not None
        assert client.region is not None
    
    def test_bedrock_client_singleton(self):
        """Test that get_bedrock_client returns the same instance."""
        client1 = get_bedrock_client()
        client2 = get_bedrock_client()
        assert client1 is client2
    
    @pytest.mark.asyncio
    async def test_bedrock_analyze_document_fallback(self):
        """Test document analysis with fallback when Bedrock is unavailable."""
        client = BedrockClient()
        
        # Mock unavailable client
        client._client = None
        
        sample_text = "This is a sample proposal document for testing compliance analysis."
        
        with pytest.raises(Exception) as exc_info:
            await client.analyze_document(
                document_text=sample_text,
                filename="test_proposal.pdf",
                document_id="test_doc_123"
            )
        
        assert "Bedrock client not initialized" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_fallback_analysis_service(self):
        """Test fallback analysis service generates valid results."""
        service = get_fallback_service()
        
        sample_text = "This is a sample proposal document for testing compliance analysis. It contains technical specifications and cost information."
        
        results = await service.generate_mock_analysis(
            document_text=sample_text,
            filename="test_proposal.pdf",
            document_id="test_doc_123",
            session_id="test_session_456"
        )
        
        # Verify results structure
        assert isinstance(results, ComplianceResults)
        assert results.session_id == "test_session_456"
        assert results.document_id == "test_doc_123"
        assert results.status in ["pass", "fail", "warning"]
        assert results.ai_model == "mock-fallback-service"
        assert len(results.issues) >= 0
        assert results.summary.total_issues == len(results.issues)
        assert results.metadata["mock_analysis"] is True


class TestPDFProcessor:
    """Test PDF processing functionality."""
    
    def test_pdf_processor_initialization(self):
        """Test that PDF processor initializes without errors."""
        processor = PDFProcessor()
        assert processor is not None
    
    def test_pdf_processor_singleton(self):
        """Test that get_pdf_processor returns the same instance."""
        processor1 = get_pdf_processor()
        processor2 = get_pdf_processor()
        assert processor1 is processor2
    
    def test_clean_extracted_text(self):
        """Test text cleaning functionality."""
        processor = PDFProcessor()
        
        raw_text = """
        
        This is a    test document.
        
        
        It has   multiple   spaces.
        
        
        """
        
        cleaned = processor._clean_extracted_text(raw_text)
        
        assert "This is a test document." in cleaned
        assert "It has multiple spaces." in cleaned
        assert "\n\n\n" not in cleaned  # No triple newlines


class TestIntegrationWorkflow:
    """Test the complete integration workflow."""
    
    @pytest.mark.asyncio
    async def test_complete_analysis_workflow_with_fallback(self):
        """Test complete analysis workflow using fallback service."""
        # This test simulates the complete workflow when AWS Bedrock is unavailable
        
        # Mock PDF processor to return sample text
        pdf_processor = get_pdf_processor()
        
        # Mock the S3 extraction to return sample data
        sample_text = """
        PROPOSAL FOR GOVERNMENT CONTRACT
        
        1. TECHNICAL APPROACH
        Our technical approach includes comprehensive methodology for delivering the required services.
        
        2. COST INFORMATION
        Total project cost: $500,000
        Labor: $300,000
        Materials: $150,000
        Overhead: $50,000
        
        3. PAST PERFORMANCE
        We have successfully completed similar contracts for government agencies.
        """
        
        sample_metadata = {
            "page_count": 3,
            "text_length": len(sample_text),
            "extraction_successful": True
        }
        
        # Mock S3 extraction
        with patch.object(pdf_processor, 'extract_text_from_s3', new_callable=AsyncMock) as mock_extract:
            mock_extract.return_value = (sample_text, sample_metadata)
            
            # Get fallback service
            fallback_service = get_fallback_service()
            
            # Run analysis
            results = await fallback_service.generate_mock_analysis(
                document_text=sample_text,
                filename="test_proposal.pdf",
                document_id="test_doc_123",
                session_id="test_session_456"
            )
            
            # Verify results
            assert isinstance(results, ComplianceResults)
            assert results.session_id == "test_session_456"
            assert results.document_id == "test_doc_123"
            assert results.processing_time > 0
            assert results.metadata["mock_analysis"] is True
            
            # Verify issues structure
            for issue in results.issues:
                assert issue.severity in ["critical", "warning", "info"]
                assert len(issue.title) > 0
                assert len(issue.description) > 0
                assert issue.regulation.regulation in ["FAR", "DFARS"]
                assert 0.0 <= issue.confidence <= 1.0


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])