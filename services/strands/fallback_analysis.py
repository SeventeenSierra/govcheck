"""
Fallback analysis service for when AWS Bedrock is unavailable.

This module provides mock compliance analysis results that maintain
the same structure as real AI analysis, ensuring system reliability
when external AI services are not available.
"""

import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any
import random

from models import ComplianceResults, ComplianceIssue, ComplianceSummary, RegulatoryReference

logger = logging.getLogger(__name__)


class FallbackAnalysisService:
    """Fallback service providing mock compliance analysis."""
    
    def __init__(self):
        """Initialize the fallback analysis service."""
        self.mock_issues_templates = self._initialize_mock_templates()
    
    def _initialize_mock_templates(self) -> List[Dict[str, Any]]:
        """Initialize templates for generating realistic mock compliance issues."""
        return [
            {
                "severity": "warning",
                "title": "Missing Cost Breakdown Section",
                "description": "The proposal lacks a detailed cost breakdown as required by FAR 15.408. This section should include labor costs, materials, overhead, and profit margins.",
                "regulation": {
                    "regulation": "FAR",
                    "section": "15.408",
                    "title": "Solicitation provisions and contract clauses",
                    "url": "https://www.acquisition.gov/far/15.408"
                },
                "confidence": 0.85,
                "remediation": "Add a detailed cost breakdown section including labor, materials, overhead costs, and profit margins with supporting documentation."
            },
            {
                "severity": "critical",
                "title": "Missing Small Business Subcontracting Plan",
                "description": "Proposals over $750,000 must include a small business subcontracting plan per FAR 19.702. No such plan was found in the submitted proposal.",
                "regulation": {
                    "regulation": "FAR",
                    "section": "19.702",
                    "title": "Statutory requirements for subcontracting plans",
                    "url": "https://www.acquisition.gov/far/19.702"
                },
                "confidence": 0.92,
                "remediation": "Include a comprehensive small business subcontracting plan with specific percentage goals and implementation strategy."
            },
            {
                "severity": "info",
                "title": "Technical Approach Well Documented",
                "description": "The technical approach section meets DFARS requirements for technical documentation and provides clear methodology descriptions.",
                "regulation": {
                    "regulation": "DFARS",
                    "section": "252.235-7010",
                    "title": "Technical Data - General",
                    "url": "https://www.acquisition.gov/dfars/252.235-7010-technical-data-general"
                },
                "confidence": 0.88
            },
            {
                "severity": "warning",
                "title": "Incomplete Past Performance Documentation",
                "description": "Past performance section lacks sufficient detail about similar contract performance as required by FAR 15.305(a)(2)(i).",
                "regulation": {
                    "regulation": "FAR",
                    "section": "15.305",
                    "title": "Proposal evaluation",
                    "url": "https://www.acquisition.gov/far/15.305"
                },
                "confidence": 0.78,
                "remediation": "Provide detailed past performance information including contract values, performance periods, and customer references."
            },
            {
                "severity": "critical",
                "title": "Missing Security Clearance Requirements",
                "description": "The proposal does not address personnel security clearance requirements specified in DFARS 252.204-7012.",
                "regulation": {
                    "regulation": "DFARS",
                    "section": "252.204-7012",
                    "title": "Safeguarding Covered Defense Information and Cyber Incident Reporting",
                    "url": "https://www.acquisition.gov/dfars/252.204-7012-safeguarding-covered-defense-information-and-cyber-incident-reporting"
                },
                "confidence": 0.95,
                "remediation": "Include detailed security clearance plan and personnel security procedures compliance documentation."
            },
            {
                "severity": "info",
                "title": "Adequate Quality Assurance Plan",
                "description": "The quality assurance section provides comprehensive procedures that align with contract requirements.",
                "regulation": {
                    "regulation": "FAR",
                    "section": "46.202",
                    "title": "Types of contract quality requirements",
                    "url": "https://www.acquisition.gov/far/46.202"
                },
                "confidence": 0.82
            },
            {
                "severity": "warning",
                "title": "Intellectual Property Rights Unclear",
                "description": "The proposal does not clearly address intellectual property and data rights as required by DFARS 252.227-7013.",
                "regulation": {
                    "regulation": "DFARS",
                    "section": "252.227-7013",
                    "title": "Rights in Technical Data - Noncommercial Items",
                    "url": "https://www.acquisition.gov/dfars/252.227-7013-rights-technical-data-noncommercial-items"
                },
                "confidence": 0.87,
                "remediation": "Clarify intellectual property ownership and provide detailed data rights assertions."
            }
        ]
    
    async def generate_mock_analysis(
        self,
        document_text: str,
        filename: str,
        document_id: str,
        session_id: str
    ) -> ComplianceResults:
        """
        Generate mock compliance analysis results.
        
        Args:
            document_text: Extracted document text (used for context)
            filename: Original filename
            document_id: Unique document identifier
            session_id: Analysis session identifier
            
        Returns:
            ComplianceResults with mock analysis data
        """
        logger.info(f"Generating mock analysis for document {document_id}")
        
        # Simulate analysis based on document characteristics
        text_length = len(document_text)
        word_count = len(document_text.split())
        
        # Generate a realistic number of issues based on document size
        num_issues = min(max(2, word_count // 1000), 6)  # 2-6 issues based on size
        
        # Randomly select issues from templates
        selected_templates = random.sample(self.mock_issues_templates, num_issues)
        
        # Create compliance issues
        issues = []
        critical_count = 0
        warning_count = 0
        info_count = 0
        
        for i, template in enumerate(selected_templates):
            # Create regulatory reference
            regulation = RegulatoryReference(
                regulation=template["regulation"]["regulation"],
                section=template["regulation"]["section"],
                title=template["regulation"]["title"],
                url=template["regulation"]["url"]
            )
            
            # Create compliance issue
            issue = ComplianceIssue(
                id=f"mock_{document_id}_{i}",
                severity=template["severity"],
                title=template["title"],
                description=template["description"],
                regulation=regulation,
                confidence=template["confidence"],
                remediation=template.get("remediation")
            )
            
            issues.append(issue)
            
            # Count by severity
            if template["severity"] == "critical":
                critical_count += 1
            elif template["severity"] == "warning":
                warning_count += 1
            else:
                info_count += 1
        
        # Calculate overall score based on issues
        base_score = 85.0
        score_penalty = (critical_count * 15) + (warning_count * 8) + (info_count * 2)
        overall_score = max(20.0, base_score - score_penalty)
        
        # Determine overall status
        if critical_count > 0 or overall_score < 60:
            status = "fail"
        elif warning_count > 0 or overall_score < 80:
            status = "warning"
        else:
            status = "pass"
        
        # Create summary
        summary = ComplianceSummary(
            total_issues=len(issues),
            critical_count=critical_count,
            warning_count=warning_count,
            info_count=info_count,
            overall_score=overall_score
        )
        
        # Create results
        results = ComplianceResults(
            id=f"mock_{document_id}_{int(datetime.utcnow().timestamp())}",
            session_id=session_id,
            document_id=document_id,
            status=status,
            issues=issues,
            summary=summary,
            generated_at=datetime.utcnow(),
            ai_model="mock-fallback-service",
            processing_time=random.uniform(2.0, 8.0),  # Realistic processing time
            metadata={
                "analysis_type": "mock_fallback",
                "document_filename": filename,
                "document_text_length": text_length,
                "document_word_count": word_count,
                "fallback_reason": "AWS Bedrock unavailable",
                "mock_analysis": True
            }
        )
        
        logger.info(f"Generated mock analysis with {len(issues)} issues for document {document_id}")
        return results


# Global fallback service instance
_fallback_service = None


def get_fallback_service() -> FallbackAnalysisService:
    """Get the global fallback analysis service instance."""
    global _fallback_service
    if _fallback_service is None:
        _fallback_service = FallbackAnalysisService()
    return _fallback_service