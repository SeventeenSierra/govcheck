/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { type ExtendedComplianceIssue, IssueSeverity } from './types';

/**
 * Remediation recommendation interface
 */
export interface RemediationRecommendation {
  /** Primary action to take */
  primaryAction: string;
  /** Additional steps to consider */
  additionalSteps: string[];
  /** Estimated effort level */
  effortLevel: 'low' | 'medium' | 'high';
  /** Priority based on severity */
  priority: 'low' | 'medium' | 'high' | 'critical';
  /** Regulatory context */
  regulatoryContext?: string;
}

/**
 * Generate enhanced remediation recommendations
 *
 * Provides intelligent remediation guidance based on issue type,
 * severity, and regulatory context. Implements requirement 3.3.
 */
export function generateRemediationRecommendation(
  issue: ExtendedComplianceIssue
): RemediationRecommendation {
  const basePriority = getSeverityPriority(issue.severity);
  const effortLevel = estimateEffortLevel(issue);

  // Use existing remediation if available, otherwise generate basic guidance
  const primaryAction = issue.remediation || generateBasicRemediation(issue);

  const additionalSteps = generateAdditionalSteps(issue);
  const regulatoryContext = generateRegulatoryContext(issue.regulation);

  return {
    primaryAction,
    additionalSteps,
    effortLevel,
    priority: basePriority,
    regulatoryContext,
  };
}

/**
 * Get priority level based on issue severity
 */
function getSeverityPriority(severity: IssueSeverity): RemediationRecommendation['priority'] {
  switch (severity) {
    case IssueSeverity.CRITICAL:
      return 'critical';
    case IssueSeverity.WARNING:
      return 'medium';
    case IssueSeverity.INFO:
      return 'low';
    default:
      return 'low';
  }
}

/**
 * Estimate effort level based on issue characteristics
 */
function estimateEffortLevel(
  issue: ExtendedComplianceIssue
): RemediationRecommendation['effortLevel'] {
  // Simple heuristic based on issue type and description length
  const descriptionLength = issue.description.length;
  const hasLocation = !!issue.location;

  if (issue.severity === IssueSeverity.CRITICAL) {
    return 'high';
  }

  if (descriptionLength > 200 || !hasLocation) {
    return 'medium';
  }

  return 'low';
}

/**
 * Generate basic remediation guidance when none is provided
 */
function generateBasicRemediation(issue: ExtendedComplianceIssue): string {
  switch (issue.severity) {
    case IssueSeverity.CRITICAL:
      return `Review and revise the content to address the critical compliance violation identified in ${issue.regulation}.`;
    case IssueSeverity.WARNING:
      return `Consider updating the content to better align with ${issue.regulation} requirements.`;
    case IssueSeverity.INFO:
      return `Review the content for potential improvements related to ${issue.regulation}.`;
    default:
      return 'Review and address the identified compliance concern.';
  }
}

/**
 * Generate additional remediation steps
 */
function generateAdditionalSteps(issue: ExtendedComplianceIssue): string[] {
  const steps: string[] = [];

  // Location-specific steps
  if (issue.location?.page) {
    steps.push(`Navigate to page ${issue.location.page} to locate the specific content`);
  }

  if (issue.location?.section) {
    steps.push(`Focus on section ${issue.location.section} for targeted revisions`);
  }

  // Severity-specific steps
  if (issue.severity === IssueSeverity.CRITICAL) {
    steps.push('Prioritize this issue for immediate resolution');
    steps.push('Consider consulting with compliance experts if needed');
    steps.push('Verify resolution before proposal submission');
  }

  // Regulatory-specific steps
  if (issue.regulation.includes('FAR')) {
    steps.push('Review the complete FAR section for additional context');
    steps.push('Ensure all related FAR requirements are addressed');
  }

  if (issue.regulation.includes('DFARS')) {
    steps.push('Check for related DFARS clauses that may apply');
    steps.push('Verify compliance with DoD-specific requirements');
  }

  // General steps
  steps.push('Document the changes made for audit trail');
  steps.push('Re-run analysis after making corrections');

  return steps;
}

/**
 * Generate regulatory context information
 */
function generateRegulatoryContext(regulation: string): string {
  if (regulation.includes('FAR')) {
    return 'Federal Acquisition Regulation (FAR) governs federal procurement processes and contractor requirements.';
  }

  if (regulation.includes('DFARS')) {
    return 'Defense Federal Acquisition Regulation Supplement (DFARS) provides DoD-specific procurement requirements.';
  }

  return 'This regulation establishes specific compliance requirements for federal contracting.';
}

/**
 * Format remediation steps for display
 */
export function formatRemediationSteps(recommendation: RemediationRecommendation): {
  primary: string;
  steps: string[];
  context: string;
} {
  return {
    primary: recommendation.primaryAction,
    steps: recommendation.additionalSteps,
    context: recommendation.regulatoryContext || '',
  };
}
