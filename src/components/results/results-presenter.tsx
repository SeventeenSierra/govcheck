/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { IssueList } from './issue-list';
import { RegulatoryReferences } from './regulatory-references';
import { StatusDisplay } from './status-display';
import type { ResultsPresenterProps } from './types';

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
      <div className="results-presenter loading">
        <div className="loading-spinner" />
        <p>Loading analysis results...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="results-presenter error">
        <h2>Error Loading Results</h2>
        <p>{error}</p>
        <button type="button" onClick={onStartNewAnalysis}>
          Start New Analysis
        </button>
      </div>
    );
  }

  // No results state
  if (!results) {
    return (
      <div className="results-presenter no-results">
        <h2>No Results Available</h2>
        <p>No analysis results to display.</p>
        <button type="button" onClick={onStartNewAnalysis}>
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="results-presenter">
      <header className="results-header">
        <h1>Compliance Analysis Results</h1>
        <div className="results-actions">
          <button type="button" onClick={onDownloadResults}>
            Download Results
          </button>
          <button type="button" onClick={onStartNewAnalysis}>
            New Analysis
          </button>
        </div>
      </header>
      <main className="results-content">
        {/* Compliance Status Display - Requirement 3.1 */}
        <StatusDisplay
          status={results.status}
          score={results.overallScore}
          issueCounts={results.metadata.issueCounts}
          showDetails={true}
        />

        {/* Compliance Issues List - Requirement 3.2 */}
        {results.issues.length > 0 && (
          <section className="issues-section">
            <h2>Compliance Issues ({results.issues.length})</h2>
            <IssueList
              issues={results.issues}
              onIssueClick={onViewIssueDetails}
              showDetails={true}
            />
          </section>
        )}

        {/* Regulatory References - Requirement 3.4 */}
        <RegulatoryReferences
          issues={results.issues}
          rulesChecked={results.metadata.rulesChecked}
        />

        {/* Analysis Metadata */}
        <section className="metadata-section">
          <h3>Analysis Details</h3>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="label">Pages Analyzed:</span>
              <span>{results.metadata.totalPages}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Processing Time:</span>
              <span>{Math.round(results.metadata.processingTime / 1000)}s</span>
            </div>
            <div className="metadata-item">
              <span className="label">Completed:</span>
              <span>{results.metadata.completedAt.toLocaleString()}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Rules Checked:</span>
              <span>{results.metadata.rulesChecked.length}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
