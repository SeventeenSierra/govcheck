/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { AlertCircle, ChevronDown, ChevronRight, MapPin, XCircle } from '@17sierra/ui';
import { useState } from 'react';
import { generateRemediationRecommendation } from '@/components/results/remediation-utils';
import {
  type ExtendedComplianceIssue,
  type IssueListProps,
  IssueSeverity,
} from '@/components/results/types';
import { IssueDetails } from './issue-details';

/**
 * Issue List Component
 *
 * Displays list of compliance issues with details and remediation guidance.
 * Implements requirements 3.2, 3.3, and 3.5.
 */
export function IssueList({ issues, onIssueClick, showDetails = false }: IssueListProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const getSeverityConfig = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return {
          icon: <XCircle className="h-5 w-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          badgeColor: 'bg-red-100 text-red-800',
          iconColor: 'text-red-500',
        };
      case IssueSeverity.WARNING:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          iconColor: 'text-yellow-500',
        };
      case IssueSeverity.INFO:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          badgeColor: 'bg-blue-100 text-blue-800',
          iconColor: 'text-blue-500',
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          badgeColor: 'bg-gray-100 text-gray-800',
          iconColor: 'text-gray-500',
        };
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
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <p className="text-gray-600">No compliance issues found. Great job!</p>
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
    <div className="space-y-4">
      {issues.map((issue) => {
        const severityConfig = getSeverityConfig(issue.severity);
        const isExpanded = expandedIssue === issue.id;

        return (
          <div key={issue.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              className={`${severityConfig.bgColor} ${severityConfig.borderColor} border-l-4 p-4 cursor-pointer hover:bg-opacity-80 transition-colors w-full text-left`}
              onClick={() => handleIssueClick(issue.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`${severityConfig.iconColor} mt-0.5`}>{severityConfig.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityConfig.badgeColor}`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                      <h3 className={`text-sm font-semibold ${severityConfig.textColor} truncate`}>
                        {issue.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{issue.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Regulation:</span>
                        <span>{issue.regulation}</span>
                      </div>
                      {showDetails && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{formatLocation(issue)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-xs text-gray-500">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="bg-white border-t border-gray-200 p-4">
                {showDetails && (
                  <div className="space-y-4">
                    {/* Location Excerpt */}
                    {issue.location?.excerpt && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Document Excerpt:
                        </h4>
                        <blockquote className="bg-gray-50 border-l-4 border-gray-300 pl-4 py-2 text-sm text-gray-700 italic">
                          "{issue.location.excerpt}"
                        </blockquote>
                      </div>
                    )}

                    {/* Remediation Guidance */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Recommended Action:
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-900">{getRemediationPreview(issue)}</p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // This would open a detailed modal or navigate to details page
                          console.log('View full details for issue:', issue.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View full details →
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded Issue Details Component */}
                <IssueDetails
                  issue={issue}
                  expanded={true}
                  onClose={() => setExpandedIssue(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
