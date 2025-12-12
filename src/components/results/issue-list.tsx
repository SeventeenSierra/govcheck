/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { useState } from 'react';
import { IssueDetails } from './issue-details';
import { generateRemediationRecommendation } from './remediation-utils';
import { type ExtendedComplianceIssue, type IssueListProps, IssueSeverity } from './types';

/**
 * Issue List Component
 *
 * Displays list of compliance issues with details and remediation guidance.
 * Implements requirements 3.2, 3.3, and 3.5.
 */
export function IssueList({ issues, onIssueClick, showDetails = false }: IssueListProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
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
        return 'red';
      case IssueSeverity.WARNING:
        return 'orange';
      case IssueSeverity.INFO:
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatLocation = (issue: ExtendedComplianceIssue): string => {
    if (!issue.location) return 'Location not specified';

    const parts: string[] = [];
    if (issue.location.page) parts.push(`Page ${issue.location.page}`);
    if (issue.location.section) parts.push(`Section ${issue.location.section}`);
    if (issue.location.lineNumber) parts.push(`Line ${issue.location.lineNumber}`);

    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  if (issues.length === 0) {
    return (
      <div className="issue-list empty">
        <p>No compliance issues found.</p>
      </div>
    );
  }

  const handleIssueClick = (issueId: string) => {
    if (onIssueClick) {
      onIssueClick(issueId);
    } else {
      // Toggle expanded view if no external click handler
      setExpandedIssue(expandedIssue === issueId ? null : issueId);
    }
  };

  const getRemediationPreview = (issue: ExtendedComplianceIssue): string => {
    if (issue.remediation) {
      return issue.remediation.length > 100
        ? `${issue.remediation.substring(0, 100)}...`
        : issue.remediation;
    }

    const recommendation = generateRemediationRecommendation(issue);
    return recommendation.primaryAction.length > 100
      ? `${recommendation.primaryAction.substring(0, 100)}...`
      : recommendation.primaryAction;
  };

  return (
    <div className="issue-list">
      {issues.map((issue) => (
        <div key={issue.id} className="issue-container">
          <div
            className={`issue-item ${issue.severity} ${expandedIssue === issue.id ? 'expanded' : ''}`}
            onClick={() => handleIssueClick(issue.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleIssueClick(issue.id);
              }
            }}
          >
            <div className="issue-header">
              <div className="issue-severity">
                <span className="severity-icon" style={{ color: getSeverityColor(issue.severity) }}>
                  {getSeverityIcon(issue.severity)}
                </span>
                <span className="severity-label">{issue.severity.toUpperCase()}</span>
              </div>
              <h3 className="issue-title">{issue.title}</h3>
            </div>
            <div className="issue-content">
              <p className="issue-description">{issue.description}</p>

              {/* Regulatory Reference - Requirement 3.4 */}
              <div className="issue-regulation">
                <strong>Regulation:</strong> {issue.regulation}
              </div>

              {showDetails && (
                <>
                  {/* Issue Location - Requirement 3.5 */}
                  <div className="issue-location">
                    <strong>Location:</strong> {formatLocation(issue)}
                  </div>

                  {/* Location Excerpt */}
                  {issue.location?.excerpt && (
                    <div className="issue-excerpt">
                      <strong>Excerpt:</strong>
                      <blockquote>"{issue.location.excerpt}"</blockquote>
                    </div>
                  )}

                  {/* Remediation Guidance Preview - Requirement 3.3 */}
                  <div className="issue-remediation-preview">
                    <strong>Recommended Action:</strong>
                    <p>{getRemediationPreview(issue)}</p>
                  </div>
                </>
              )}
            </div>

            <div className="issue-actions">
              <span className="view-details-hint">
                {expandedIssue === issue.id ? 'Click to collapse' : 'Click to view details'}
              </span>
            </div>
          </div>

          {/* Expanded Issue Details */}
          {expandedIssue === issue.id && (
            <div className="issue-expanded-details">
              <IssueDetails issue={issue} expanded={true} onClose={() => setExpandedIssue(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
