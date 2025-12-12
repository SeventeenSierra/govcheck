/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { Button } from '@17sierra/ui';
import { AlertCircle, CheckCircle, Download, FileText, RefreshCw, XCircle } from 'lucide-react';
import { IssueList } from './issue-list';
import { RegulatoryReferences } from './regulatory-references';

import type { ResultsPresenterProps } from './types';
import { ComplianceStatus } from './types';

/**
 * Results Presenter Component
 *
 * Displays compliance analysis results including status, issues,
 * and regulatory references. Implements requirements 3.1-3.5.
 */
export function ResultsPresenter({
  results,
  isLoading = false,
  error,
  onViewIssueDetails,
  onDownloadResults,
  onStartNewAnalysis,
}: ResultsPresenterProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <XCircle className="h-6 w-6 text-red-500 mr-3" />
          <h2 className="text-lg font-semibold text-red-900">Error Loading Results</h2>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={onStartNewAnalysis} variant="outline">
          Start New Analysis
        </Button>
      </div>
    );
  }

  // No results state
  if (!results) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Available</h2>
        <p className="text-gray-600 mb-6">No analysis results to display.</p>
        <Button onClick={onStartNewAnalysis}>Start New Analysis</Button>
      </div>
    );
  }

  // Get status icon and colors
  const getStatusDisplay = () => {
    switch (results.status) {
      case ComplianceStatus.PASS:
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          badgeColor: 'bg-green-100 text-green-800',
          status: 'PASS',
        };
      case ComplianceStatus.FAIL:
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          badgeColor: 'bg-red-100 text-red-800',
          status: 'FAIL',
        };
      default:
        return {
          icon: <AlertCircle className="h-8 w-8 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          status: 'WARNING',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Analysis Results</h1>
          <p className="text-gray-600 text-sm mt-1">
            Analysis completed on {results.metadata.completedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onDownloadResults} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={onStartNewAnalysis} size="sm">
            New Analysis
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <div
        className={`${statusDisplay.bgColor} ${statusDisplay.borderColor} border rounded-lg p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {statusDisplay.icon}
            <div>
              <h2 className={`text-xl font-semibold ${statusDisplay.textColor}`}>
                Compliance Status: {statusDisplay.status}
              </h2>
              <p className="text-gray-600 mt-1">Overall Score: {results.overallScore}/100</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.badgeColor}`}>
            {statusDisplay.status}
          </div>
        </div>
      </div>

      {/* Issue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Critical Issues</p>
              <p className="text-2xl font-bold text-red-900">
                {results.metadata.issueCounts.critical}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Warnings</p>
              <p className="text-2xl font-bold text-yellow-900">
                {results.metadata.issueCounts.warning}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Info</p>
              <p className="text-2xl font-bold text-blue-900">
                {results.metadata.issueCounts.info}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Compliance Issues List - Requirement 3.2 */}
      {results.issues.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Compliance Issues ({results.issues.length})
            </h2>
          </div>
          <div className="p-6">
            <IssueList
              issues={results.issues}
              onIssueClick={onViewIssueDetails}
              showDetails={true}
            />
          </div>
        </div>
      )}

      {/* Regulatory References - Requirement 3.4 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Regulatory References</h2>
        </div>
        <div className="p-6">
          <RegulatoryReferences
            issues={results.issues}
            rulesChecked={results.metadata.rulesChecked}
          />
        </div>
      </div>

      {/* Analysis Metadata */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{results.metadata.totalPages}</p>
            <p className="text-sm text-gray-600">Pages Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(results.metadata.processingTime / 1000)}s
            </p>
            <p className="text-sm text-gray-600">Processing Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {results.metadata.rulesChecked.length}
            </p>
            <p className="text-sm text-gray-600">Rules Checked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {results.metadata.completedAt.toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-600">Completed At</p>
          </div>
        </div>
      </div>
    </div>
  );
}
