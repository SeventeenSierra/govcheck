/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { AlertCircle, CheckCircle, FileText, XCircle } from 'lucide-react';
import type { ExtendedComplianceIssue } from './types';
import { IssueSeverity } from './types';

/**
 * Regulatory References Component Props
 */
interface RegulatoryReferencesProps {
  /** List of compliance issues containing regulatory references */
  issues: ExtendedComplianceIssue[];
  /** List of all regulatory rules that were checked */
  rulesChecked: string[];
}

/**
 * Regulatory References Component
 *
 * Displays FAR/DFARS section references and regulatory information.
 * Implements requirement 3.4.
 */
export function RegulatoryReferences({ issues, rulesChecked }: RegulatoryReferencesProps) {
  // Extract unique regulatory references from issues
  const referencedRegulations = Array.from(
    new Set(issues.map((issue) => issue.regulation).filter(Boolean))
  ).sort();

  // Group issues by regulation
  const issuesByRegulation = issues.reduce(
    (acc, issue) => {
      if (issue.regulation) {
        if (!acc[issue.regulation]) {
          acc[issue.regulation] = [];
        }
        acc[issue.regulation].push(issue);
      }
      return acc;
    },
    {} as Record<string, ExtendedComplianceIssue[]>
  );

  const getSeverityConfig = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL:
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: <XCircle className="h-3 w-3" />
        };
      case IssueSeverity.WARNING:
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: <AlertCircle className="h-3 w-3" />
        };
      case IssueSeverity.INFO:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: <FileText className="h-3 w-3" />
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: <FileText className="h-3 w-3" />
        };
    }
  };

  return (
    <div className="space-y-6">
      {referencedRegulations.length > 0 ? (
        <>
          {/* Regulations with Issues */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Regulations with Issues ({referencedRegulations.length})
            </h3>
            <div className="space-y-4">
              {referencedRegulations.map((regulation) => (
                <div key={regulation} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-semibold text-red-900">{regulation}</h4>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {issuesByRegulation[regulation].length} issue
                      {issuesByRegulation[regulation].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {issuesByRegulation[regulation].map((issue) => {
                      const severityConfig = getSeverityConfig(issue.severity);
                      return (
                        <div key={issue.id} className="flex items-center space-x-3 text-sm">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${severityConfig.bgColor} ${severityConfig.textColor}`}>
                            {severityConfig.icon}
                            <span>{issue.severity.toUpperCase()}</span>
                          </span>
                          <span className="text-gray-700 flex-1">{issue.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Rules Checked */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Rules Checked ({rulesChecked.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rulesChecked.map((rule) => {
                const hasIssues = referencedRegulations.includes(rule);
                return (
                  <div
                    key={rule}
                    className={`p-3 rounded-lg border ${
                      hasIssues
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate pr-2">
                        {rule}
                      </span>
                      <div className="flex items-center space-x-1">
                        {hasIssues ? (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-700 font-medium">Issues</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-700 font-medium">Passed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Regulatory Violations Found</h3>
          <p className="text-gray-600 mb-6">All regulatory requirements have been met.</p>
          
          {/* All Rules Checked - Success State */}
          <div className="text-left">
            <h4 className="text-base font-semibold text-gray-900 mb-4">
              Rules Checked ({rulesChecked.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rulesChecked.map((rule) => (
                <div key={rule} className="p-3 rounded-lg border bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate pr-2">
                      {rule}
                    </span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-700 font-medium">Passed</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
