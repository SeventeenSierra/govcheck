# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

"""
AWS Bedrock integration for AI-powered document analysis.

This module provides the interface to AWS Bedrock for compliance analysis
using Claude 3 Sonnet for document processing and regulatory compliance checking.
"""

import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

import boto3
from botocore.exceptions import ClientError, NoCredentialsError, BotoCoreError

from config import get_settings
from models import ComplianceResults, ComplianceIssue, ComplianceSummary, RegulatoryReference

logger = logging.getLogger(__name__)
settings = get_settings()


class BedrockClient:
    """AWS Bedrock client for AI-powered compliance analysis."""
    
    def __init__(self):
        """Initialize the Bedrock client with AWS configuration."""
        self.model_id = settings.bedrock_model_id
        self.region = settings.aws_region
        self._client = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize the AWS Bedrock client with proper configuration."""
        try:
            # Configure AWS session
            session_kwargs = {
                'region_name': self.region
            }
            
            # Add credentials if provided (for local development)
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                session_kwargs.update({
                    'aws_access_key_id': settings.aws_access_key_id,
                    'aws_secret_access_key': settings.aws_secret_access_key
                })
            
            session = boto3.Session(**session_kwargs)
            self._client = session.client('bedrock-runtime')
            
            logger.info(f"Initialized Bedrock client for region {self.region}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Bedrock client: {e}")
            self._client = None
    
    def is_available(self) -> bool:
        """Check if Bedrock client is available and configured."""
        if not self._client:
            return False
        
        try:
            # Test connection with a minimal request
            # Note: This is a placeholder - actual implementation would test connectivity
            return True
        except Exception as e:
            logger.warning(f"Bedrock availability check failed: {e}")
            return False
    
    async def analyze_document(
        self,
        document_text: str,
        filename: str,
        document_id: str
    ) -> ComplianceResults:
        """
        Analyze document text for compliance issues using AWS Bedrock.
        
        Args:
            document_text: Extracted text from the PDF document
            filename: Original filename for context
            document_id: Unique document identifier
            
        Returns:
            ComplianceResults with AI-generated compliance analysis
            
        Raises:
            Exception: If analysis fails and no fallback is available
        """
        try:
            if not self._client:
                raise Exception("Bedrock client not initialized")
            
            # Create the analysis prompt
            prompt = self._create_compliance_prompt(document_text, filename)
            
            # Prepare the request payload for Claude 3 Sonnet
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "temperature": 0.1,  # Low temperature for consistent analysis
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            # Make the request to Bedrock
            logger.info(f"Sending analysis request to Bedrock for document {document_id}")
            
            response = self._client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json"
            )
            
            # Parse the response
            response_body = json.loads(response['body'].read())
            ai_response = response_body['content'][0]['text']
            
            logger.info(f"Received analysis response from Bedrock for document {document_id}")
            
            # Parse the structured response
            results = self._parse_ai_response(ai_response, document_id)
            
            return results
            
        except (ClientError, NoCredentialsError, BotoCoreError) as e:
            logger.error(f"AWS Bedrock error for document {document_id}: {e}")
            raise Exception(f"AI analysis service unavailable: {str(e)}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response for document {document_id}: {e}")
            raise Exception("AI response parsing failed")
            
        except Exception as e:
            logger.error(f"Unexpected error during analysis for document {document_id}: {e}")
            raise Exception(f"Analysis failed: {str(e)}")
    
    def _create_compliance_prompt(self, document_text: str, filename: str) -> str:
        """
        Create a structured prompt for compliance analysis.
        
        Args:
            document_text: The extracted document text
            filename: Original filename for context
            
        Returns:
            Formatted prompt for AI analysis
        """
        prompt = f"""You are an expert compliance analyst specializing in Federal Acquisition Regulation (FAR) and Defense Federal Acquisition Regulation Supplement (DFARS) requirements for government contract proposals.

Please analyze the following proposal document for compliance issues and provide a structured response.

Document: {filename}

Key areas to analyze:
1. Cost and pricing information (FAR 15.408)
2. Technical approach and specifications
3. Past performance documentation
4. Small business participation requirements
5. Security and clearance requirements (DFARS)
6. Intellectual property and data rights (DFARS 252.227)
7. Required certifications and representations

Document Text:
{document_text[:8000]}  # Limit text to avoid token limits

Please provide your analysis in the following JSON format:

{{
    "overall_status": "pass|fail|warning",
    "overall_score": <number between 0-100>,
    "issues": [
        {{
            "severity": "critical|warning|info",
            "title": "Brief issue title",
            "description": "Detailed description of the compliance issue",
            "regulation": {{
                "regulation": "FAR|DFARS",
                "section": "specific section number",
                "title": "regulation title",
                "url": "regulation URL if available"
            }},
            "confidence": <number between 0-1>,
            "remediation": "Suggested fix (optional)"
        }}
    ],
    "summary": {{
        "total_issues": <number>,
        "critical_count": <number>,
        "warning_count": <number>,
        "info_count": <number>
    }}
}}

Focus on actionable, specific compliance issues with clear regulatory references. Provide confidence scores based on the clarity of the requirement and evidence in the document."""
        
        return prompt
    
    def _parse_ai_response(self, ai_response: str, document_id: str) -> ComplianceResults:
        """
        Parse the AI response into structured ComplianceResults.
        
        Args:
            ai_response: Raw AI response text
            document_id: Document identifier
            
        Returns:
            Parsed ComplianceResults object
        """
        try:
            # Extract JSON from the response (handle potential markdown formatting)
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in AI response")
            
            json_text = ai_response[json_start:json_end]
            parsed_data = json.loads(json_text)
            
            # Convert to our data models
            issues = []
            for issue_data in parsed_data.get('issues', []):
                regulation = RegulatoryReference(
                    regulation=issue_data['regulation']['regulation'],
                    section=issue_data['regulation']['section'],
                    title=issue_data['regulation']['title'],
                    url=issue_data['regulation'].get('url')
                )
                
                issue = ComplianceIssue(
                    id=f"{document_id}_{len(issues)}",
                    severity=issue_data['severity'],
                    title=issue_data['title'],
                    description=issue_data['description'],
                    regulation=regulation,
                    confidence=issue_data['confidence'],
                    remediation=issue_data.get('remediation')
                )
                issues.append(issue)
            
            # Create summary
            summary_data = parsed_data.get('summary', {})
            summary = ComplianceSummary(
                total_issues=summary_data.get('total_issues', len(issues)),
                critical_count=summary_data.get('critical_count', 0),
                warning_count=summary_data.get('warning_count', 0),
                info_count=summary_data.get('info_count', 0),
                overall_score=parsed_data.get('overall_score', 50.0)
            )
            
            # Create results
            results = ComplianceResults(
                id=f"bedrock_{document_id}_{int(datetime.utcnow().timestamp())}",
                session_id="",  # Will be set by caller
                document_id=document_id,
                status=parsed_data.get('overall_status', 'warning'),
                issues=issues,
                summary=summary,
                generated_at=datetime.utcnow(),
                ai_model=self.model_id,
                processing_time=0.0,  # Will be calculated by caller
                metadata={
                    "ai_provider": "aws_bedrock",
                    "model_id": self.model_id,
                    "region": self.region
                }
            )
            
            return results
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.debug(f"Raw AI response: {ai_response}")
            raise Exception(f"AI response parsing failed: {str(e)}")


# Global Bedrock client instance
_bedrock_client = None


def get_bedrock_client() -> BedrockClient:
    """Get the global Bedrock client instance."""
    global _bedrock_client
    if _bedrock_client is None:
        _bedrock_client = BedrockClient()
    return _bedrock_client