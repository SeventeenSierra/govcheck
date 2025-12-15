/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { type ComplianceIssue, IssueSeverity } from '../analysis/types';

/**
 * Results Presenter Type Definitions
 *
 * Types specific to the Results Presenter component for displaying
 * compliance analysis results, issues, and regulatory references.
 * Reuses ComplianceIssue and IssueSeverity from analysis module.
 */

/**
 * Compliance status enumeration
 * Represents the overall compliance status of a proposal
 */
export enum ComplianceStatus {
  PASS = 'pass',
  FAIL = 'fail',
  WARNING = 'warning',
}

// Re-export types from analysis module for convenience
export type { ComplianceIssue };
export { IssueSeverity };

/**
 * Extended issue location interface
 * Extends the basic location with excerpt capability
 */
export interface ExtendedIssueLocation {
  /** Page number where issue occurs */
  page?: number;
  /** Section identifier within the document */
  section?: string;
  /** Line number within the page/section */
  lineNumber?: number;
  /** Text excerpt showing the problematic content */
  excerpt?: string;
}

/**
 * Extended compliance issue interface
 * Extends the basic ComplianceIssue with additional location details
 */
export interface ExtendedComplianceIssue extends Omit<ComplianceIssue, 'location'> {
  /** Extended location information within the document */
  location?: ExtendedIssueLocation;
}

/**
 * Analysis results interface
 * Contains the complete results of compliance analysis
 */
export interface AnalysisResults {
  /** Unique identifier for the analysis session */
  sessionId: string;
  /** Reference to the analyzed proposal */
  proposalId: string;
  /** Overall compliance status */
  status: ComplianceStatus;
  /** Overall compliance score (0-100) */
  overallScore: number;
  /** List of identified compliance issues */
  issues: ExtendedComplianceIssue[];
  /** Analysis metadata and statistics */
  metadata: AnalysisMetadata;
}

/**
 * Analysis metadata interface
 * Contains statistical and processing information about the analysis
 */
export interface AnalysisMetadata {
  /** Total number of pages analyzed */
  totalPages: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** List of regulatory rules that were checked */
  rulesChecked: string[];
  /** Timestamp when analysis completed */
  completedAt: Date;
  /** Number of issues by severity */
  issueCounts: {
    critical: number;
    warning: number;
    info: number;
  };
}

/**
 * Results presenter props interface
 * Props for the main Results Presenter component
 */
export interface ResultsPresenterProps {
  /** Analysis results to display */
  results?: AnalysisResults;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error message if results failed to load */
  error?: string;
  /** Callback when user requests to view issue details */
  onViewIssueDetails?: (issueId: string) => void;
  /** Callback when user requests to download results */
  onDownloadResults?: () => void;
  /** Callback when user wants to start a new analysis */
  onStartNewAnalysis?: () => void;
}

/**
 * Issue list props interface
 * Props for the compliance issues list component
 */
export interface IssueListProps {
  /** List of compliance issues to display */
  issues: ExtendedComplianceIssue[];
  /** Callback when user clicks on an issue */
  onIssueClick?: (issueId: string) => void;
  /** Whether to show detailed information */
  showDetails?: boolean;
}

/**
 * Status display props interface
 * Props for the compliance status display component
 */
export interface StatusDisplayProps {
  /** Overall compliance status */
  status: ComplianceStatus;
  /** Overall compliance score */
  score: number;
  /** Issue counts by severity */
  issueCounts: AnalysisMetadata['issueCounts'];
  /** Whether to show detailed statistics */
  showDetails?: boolean;
}
