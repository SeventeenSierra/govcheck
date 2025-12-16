/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Issue Management Types
 *
 * Type definitions for compliance issue management and display.
 */

// Re-export commonly used types from results for convenience
export type {
  ExtendedComplianceIssue,
  ExtendedIssueLocation,
  IssueListProps,
} from '@/components/results/types';

export { IssueSeverity } from '@/components/results/types';

// Import for local use
import type {
  ExtendedComplianceIssue,
  ExtendedIssueLocation,
  IssueSeverity,
} from '@/components/results/types';

/**
 * Issue filter criteria
 */
export interface IssueFilter {
  /** Filter by severity levels */
  severities?: IssueSeverity[];
  /** Filter by regulation types */
  regulations?: string[];
  /** Filter by issue status */
  statuses?: IssueStatus[];
  /** Text search in title/description */
  searchText?: string;
}

/**
 * Issue status for tracking resolution
 */
export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

/**
 * Issue resolution tracking
 */
export interface IssueResolution {
  /** Issue identifier */
  issueId: string;
  /** Resolution status */
  status: IssueStatus;
  /** Resolution notes */
  notes?: string;
  /** Who resolved the issue */
  resolvedBy?: string;
  /** When it was resolved */
  resolvedAt?: Date;
  /** Verification status */
  verified?: boolean;
}

/**
 * Issue details component props
 */
export interface IssueDetailsProps {
  /** The compliance issue to display */
  issue: ExtendedComplianceIssue;
  /** Whether to show expanded view */
  expanded?: boolean;
  /** Callback when user closes the details */
  onClose?: () => void;
  /** Callback when user resolves the issue */
  onResolve?: (resolution: IssueResolution) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Issue location viewer props
 */
export interface IssueLocationViewerProps {
  /** The compliance issue with location information */
  issue: ExtendedComplianceIssue;
  /** Callback when user navigates to location */
  onNavigateToLocation?: (location: ExtendedIssueLocation) => void;
  /** Whether to show document preview */
  showPreview?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Issue management actions
 */
export interface IssueActions {
  /** Mark issue as resolved */
  resolve: (issueId: string, resolution: IssueResolution) => Promise<void>;
  /** Dismiss an issue */
  dismiss: (issueId: string, reason: string) => Promise<void>;
  /** Add notes to an issue */
  addNotes: (issueId: string, notes: string) => Promise<void>;
  /** Export issues to various formats */
  export: (issues: ExtendedComplianceIssue[], format: 'csv' | 'pdf' | 'json') => Promise<void>;
}

/**
 * Issue statistics and metrics
 */
export interface IssueMetrics {
  /** Total number of issues */
  total: number;
  /** Issues by severity */
  bySeverity: Record<IssueSeverity, number>;
  /** Issues by status */
  byStatus: Record<IssueStatus, number>;
  /** Issues by regulation */
  byRegulation: Record<string, number>;
  /** Resolution rate percentage */
  resolutionRate: number;
}
