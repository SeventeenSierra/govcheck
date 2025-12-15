/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { type ExtendedComplianceIssue, IssueSeverity } from '@/components/results/types';

/**
 * Issue Details Component Props
 */
export interface IssueDetailsProps {
  /** The compliance issue to display details for */
  issue: ExtendedComplianceIssue;
  /** Whether to show the full detailed view */
  expanded?: boolean;
  /** Callback when user wants to close the details */
  onClose?: () => void;
}

/**
 * Issue Details Component
 *
 * Displays detailed information about a specific compliance issue
 * including location, remediation guidance, and regulatory context.
 * Implements requirements 3.3 and 3.5.
 */
export function IssueDetails({ issue, expanded = false, onClose }: IssueDetailsProps) {
  const getSeverityIcon = (severity: IssueSeverity): string => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return '🔴';
      case IssueSeverity.WARNING:
        return '🟡';
      case IssueSeverity.INFO:
        return '🔵';
      default:
        return '⚪';
    }
  };

  const getSeverityColor = (severity: IssueSeverity): string => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return '#dc2626'; // red-600
      case IssueSeverity.WARNING:
        return '#d97706'; // amber-600
      case IssueSeverity.INFO:
        return '#2563eb'; // blue-600
      default:
        return '#6b7280'; // gray-500
    }
  };

  const formatDetailedLocation = (): string => {
    if (!issue.location) return 'Location not specified';

    const parts: string[] = [];
    if (issue.location.page) parts.push(`Page ${issue.location.page}`);
    if (issue.location.section) parts.push(`Section ${issue.location.section}`);
    if (issue.location.lineNumber) parts.push(`Line ${issue.location.lineNumber}`);

    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const generateRemediationSteps = (): string[] => {
    if (!issue.remediation) return [];

    // Split remediation text into actionable steps
    const steps = issue.remediation
      .split(/[.!?]+/)
      .map((step) => step.trim())
      .filter((step) => step.length > 0)
      .map((step) => step.charAt(0).toUpperCase() + step.slice(1));

    return steps;
  };

  return (
    <div className={`issue-details ${expanded ? 'expanded' : 'compact'}`}>
      <div className="issue-details-header">
        <div className="issue-severity-badge">
          <span className="severity-icon" style={{ color: getSeverityColor(issue.severity) }}>
            {getSeverityIcon(issue.severity)}
          </span>
          <span className="severity-text">{issue.severity.toUpperCase()}</span>
        </div>
        <h3 className="issue-title">{issue.title}</h3>
        {onClose && (
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close issue details"
          >
            ✕
          </button>
        )}
      </div>

      <div className="issue-details-content">
        <div className="issue-description">
          <h4>Description</h4>
          <p>{issue.description}</p>
        </div>

        {/* Regulatory Reference - Requirement 3.4 */}
        <div className="issue-regulation">
          <h4>Regulatory Reference</h4>
          <div className="regulation-badge">
            <strong>{issue.regulation}</strong>
          </div>
        </div>

        {/* Issue Location Details - Requirement 3.5 */}
        <div className="issue-location-details">
          <h4>Location in Document</h4>
          <div className="location-info">
            <span className="location-text">{formatDetailedLocation()}</span>
            {issue.location?.page && (
              <button type="button" className="view-page-button">
                View Page {issue.location.page}
              </button>
            )}
          </div>

          {/* Location Excerpt */}
          {issue.location?.excerpt && (
            <div className="location-excerpt">
              <h5>Relevant Text</h5>
              <blockquote className="excerpt-text">"{issue.location.excerpt}"</blockquote>
            </div>
          )}
        </div>
        {/* Remediation Guidance - Requirement 3.3 */}
        {issue.remediation && (
          <div className="remediation-guidance">
            <h4>Recommended Actions</h4>
            <div className="remediation-content">
              {generateRemediationSteps().length > 1 ? (
                <ol className="remediation-steps">
                  {generateRemediationSteps().map((step, index) => (
                    <li key={`step-${step.substring(0, 20)}-${index}`} className="remediation-step">
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="remediation-text">{issue.remediation}</p>
              )}
            </div>

            {/* Additional guidance based on severity */}
            {issue.severity === IssueSeverity.CRITICAL && (
              <div className="critical-guidance">
                <strong>⚠️ Critical Issue:</strong> This issue must be resolved before proposal
                submission.
              </div>
            )}

            {issue.severity === IssueSeverity.WARNING && (
              <div className="warning-guidance">
                <strong>⚠️ Warning:</strong> Consider addressing this issue to improve compliance
                score.
              </div>
            )}
          </div>
        )}

        {/* Additional Context */}
        {expanded && (
          <div className="additional-context">
            <h4>Additional Information</h4>
            <div className="context-grid">
              <div className="context-item">
                <span className="label">Issue ID:</span>
                <span className="issue-id">{issue.id}</span>
              </div>
              <div className="context-item">
                <span className="label">Severity Level:</span>
                <span className={`severity-level ${issue.severity}`}>{issue.severity}</span>
              </div>
              {issue.location?.page && (
                <div className="context-item">
                  <span className="label">Document Page:</span>
                  <span>{issue.location.page}</span>
                </div>
              )}
              {issue.location?.section && (
                <div className="context-item">
                  <span className="label">Document Section:</span>
                  <span>{issue.location.section}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
