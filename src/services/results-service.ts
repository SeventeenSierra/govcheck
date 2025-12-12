// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Results Service
 *
 * Service layer for managing compliance analysis results and integrating with the Strands API.
 * Provides results retrieval, issue details, and regulatory references.
 * Implements requirements 3.1, 3.2, 3.3, 3.4, and 3.5 for results functionality.
 */

import {
  type AnalysisResults,
  ComplianceStatus,
  IssueSeverity,
  type ComplianceIssue as LocalComplianceIssue,
} from '../components/results/types';
import {
  type ComplianceIssue,
  type ComplianceResultsResponse,
  strandsApiClient,
} from './strands-api-client';

/**
 * Results service events
 */
export interface ResultsServiceEvents {
  onResultsUpdate: (proposalId: string, results: AnalysisResults) => void;
  onError: (proposalId: string, error: string) => void;
}

/**
 * Results Service Class
 *
 * Manages compliance analysis results with the Strands API, providing results retrieval,
 * issue details, and regulatory reference capabilities.
 */
export class ResultsService {
  private resultsCache = new Map<string, AnalysisResults>();
  private eventHandlers: Partial<ResultsServiceEvents> = {};

  /**
   * Set event handlers for results events
   */
  setEventHandlers(handlers: Partial<ResultsServiceEvents>) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Get compliance analysis results
   * Requirement 3.1: Show compliance status (pass/fail/warning)
   * Requirement 3.2: List identified compliance issues
   */
  async getResults(
    proposalId: string,
    useCache: boolean = true
  ): Promise<{ success: boolean; results?: AnalysisResults; error?: string }> {
    // Check cache first if requested
    if (useCache && this.resultsCache.has(proposalId)) {
      const cachedResults = this.resultsCache.get(proposalId)!;
      return { success: true, results: cachedResults };
    }

    try {
      const response = await strandsApiClient.getResults(proposalId);

      if (response.success && response.data) {
        const results = this.mapApiResponseToResults(response.data);

        // Cache the results
        this.resultsCache.set(proposalId, results);

        // Notify listeners
        this.eventHandlers.onResultsUpdate?.(proposalId, results);

        return { success: true, results };
      } else {
        const error = response.error || 'Failed to retrieve results';
        this.eventHandlers.onError?.(proposalId, error);
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Results retrieval failed';
      this.eventHandlers.onError?.(proposalId, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get specific compliance issue details
   * Requirement 3.5: Allow users to see specific issue locations
   */
  async getIssueDetails(
    issueId: string
  ): Promise<{ success: boolean; issue?: ComplianceIssue; error?: string }> {
    try {
      const response = await strandsApiClient.getIssueDetails(issueId);

      if (response.success && response.data) {
        return { success: true, issue: response.data };
      } else {
        const error = response.error || 'Failed to retrieve issue details';
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Issue details retrieval failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get regulatory references for issues
   * Requirement 3.4: Reference specific FAR/DFARS sections
   */
  getRegulatoryReferences(
    results: AnalysisResults
  ): { framework: string; sections: string[]; count: number }[] {
    const references = new Map<string, Set<string>>();

    // Collect all regulatory references from issues
    results.issues.forEach((issue: LocalComplianceIssue) => {
      if (issue.regulation) {
        // Extract framework (FAR, DFARS) and section from regulation
        const parts = issue.regulation.split(' ');
        const framework = parts[0]; // e.g., "FAR" or "DFARS"
        const section = parts.slice(1).join(' '); // e.g., "52.204-1"

        if (!references.has(framework)) {
          references.set(framework, new Set());
        }
        references.get(framework)!.add(section);
      }
    });

    // Convert to array format
    return Array.from(references.entries()).map(([framework, sections]) => ({
      framework,
      sections: Array.from(sections).sort(),
      count: sections.size,
    }));
  }

  /**
   * Get remediation guidance for issues
   * Requirement 3.3: Include basic remediation recommendations
   */
  getRemediationGuidance(issueId: string, results?: AnalysisResults): string | null {
    if (!results) return null;

    const issue = results.issues.find((i: LocalComplianceIssue) => i.id === issueId);
    if (!issue || !issue.remediation) return null;

    return issue.remediation;
  }

  /**
   * Filter issues by severity
   */
  filterIssuesBySeverity(
    results: AnalysisResults,
    severity: IssueSeverity
  ): LocalComplianceIssue[] {
    return results.issues.filter((issue: LocalComplianceIssue) => issue.severity === severity);
  }

  /**
   * Get issue statistics
   */
  getIssueStatistics(results: AnalysisResults): {
    total: number;
    critical: number;
    warning: number;
    info: number;
    byFramework: { framework: string; count: number }[];
  } {
    const stats = {
      total: results.issues.length,
      critical: 0,
      warning: 0,
      info: 0,
      byFramework: [] as { framework: string; count: number }[],
    };

    const frameworkCounts = new Map<string, number>();

    results.issues.forEach((issue: LocalComplianceIssue) => {
      // Count by severity
      switch (issue.severity) {
        case IssueSeverity.CRITICAL:
          stats.critical++;
          break;
        case IssueSeverity.WARNING:
          stats.warning++;
          break;
        case IssueSeverity.INFO:
          stats.info++;
          break;
      }

      // Count by framework
      if (issue.regulation) {
        // Extract framework (FAR, DFARS) from regulation
        const framework = issue.regulation.split(' ')[0]; // e.g., "FAR" or "DFARS"
        frameworkCounts.set(framework, (frameworkCounts.get(framework) || 0) + 1);
      }
    });

    // Convert framework counts to array
    stats.byFramework = Array.from(frameworkCounts.entries()).map(([framework, count]) => ({
      framework,
      count,
    }));

    return stats;
  }

  /**
   * Export results to different formats
   */
  async exportResults(
    proposalId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<{ success: boolean; data?: string | Blob; error?: string }> {
    const resultsResponse = await this.getResults(proposalId);

    if (!resultsResponse.success || !resultsResponse.results) {
      return { success: false, error: resultsResponse.error || 'No results to export' };
    }

    const results = resultsResponse.results;

    try {
      switch (format) {
        case 'json':
          return {
            success: true,
            data: JSON.stringify(results, null, 2),
          };

        case 'csv': {
          const csvData = this.convertToCSV(results);
          return {
            success: true,
            data: csvData,
          };
        }

        case 'pdf':
          // For threshold implementation, return JSON format
          // In full implementation, this would generate a PDF
          return {
            success: true,
            data: JSON.stringify(results, null, 2),
          };

        default:
          return { success: false, error: 'Unsupported export format' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Clear cached results
   */
  clearCache(proposalId?: string): void {
    if (proposalId) {
      this.resultsCache.delete(proposalId);
    } else {
      this.resultsCache.clear();
    }
  }

  /**
   * Get cached results
   */
  getCachedResults(proposalId: string): AnalysisResults | null {
    return this.resultsCache.get(proposalId) || null;
  }

  /**
   * Check if results are available for a proposal
   */
  async hasResults(proposalId: string): Promise<boolean> {
    // Check cache first
    if (this.resultsCache.has(proposalId)) {
      return true;
    }

    // Check with API
    try {
      const response = await strandsApiClient.getResults(proposalId);
      return response.success && !!response.data;
    } catch {
      return false;
    }
  }

  /**
   * Convert results to CSV format
   */
  private convertToCSV(results: AnalysisResults): string {
    const headers = [
      'Issue ID',
      'Severity',
      'Title',
      'Description',
      'Framework',
      'Section',
      'Reference',
      'Remediation',
    ];
    const rows = [headers.join(',')];

    results.issues.forEach((issue: LocalComplianceIssue) => {
      const row = [
        issue.id,
        issue.severity,
        `"${issue.title.replace(/"/g, '""')}"`,
        `"${issue.description.replace(/"/g, '""')}"`,
        issue.regulation || '',
        issue.regulation || '',
        issue.regulation || '',
        issue.remediation ? `"${issue.remediation.replace(/"/g, '""')}"` : '',
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Map API response to internal results format
   */
  private mapApiResponseToResults(apiResponse: ComplianceResultsResponse): AnalysisResults {
    return {
      sessionId: apiResponse.id,
      proposalId: apiResponse.proposalId,
      status: this.mapApiStatusToLocal(apiResponse.status),
      overallScore: this.calculateOverallScore(apiResponse.issues),
      issues: apiResponse.issues.map(this.mapApiIssueToLocal),
      metadata: {
        totalPages: 1, // Default, would be provided by API in full implementation
        processingTime: 0, // Default, would be provided by API
        rulesChecked: this.extractRulesChecked(apiResponse.issues),
        completedAt: new Date(apiResponse.generatedAt),
        issueCounts: {
          critical: apiResponse.summary.criticalIssues,
          warning: apiResponse.summary.warningIssues,
          info:
            apiResponse.summary.totalIssues -
            apiResponse.summary.criticalIssues -
            apiResponse.summary.warningIssues,
        },
      },
    };
  }

  /**
   * Map API status to local status enum
   */
  private mapApiStatusToLocal(apiStatus: string): ComplianceStatus {
    switch (apiStatus) {
      case 'pass':
        return ComplianceStatus.PASS;
      case 'fail':
        return ComplianceStatus.FAIL;
      case 'warning':
        return ComplianceStatus.WARNING;
      default:
        return ComplianceStatus.WARNING;
    }
  }

  /**
   * Map API issue to local issue format
   */
  private mapApiIssueToLocal = (apiIssue: ComplianceIssue): LocalComplianceIssue => {
    return {
      id: apiIssue.id,
      severity: this.mapApiSeverityToLocal(apiIssue.severity),
      title: apiIssue.title,
      description: apiIssue.description,
      regulation: apiIssue.regulation ? apiIssue.regulation.reference : '',
      location: apiIssue.location
        ? {
            page: apiIssue.location.page,
            section: apiIssue.location.section,
            lineNumber: 0, // Default line number since API has 'text' but local expects 'lineNumber'
          }
        : undefined,
      remediation: apiIssue.remediation,
    };
  };

  /**
   * Map API severity to local severity enum
   */
  private mapApiSeverityToLocal(apiSeverity: string): IssueSeverity {
    switch (apiSeverity) {
      case 'critical':
        return IssueSeverity.CRITICAL;
      case 'warning':
        return IssueSeverity.WARNING;
      case 'info':
        return IssueSeverity.INFO;
      default:
        return IssueSeverity.INFO;
    }
  }

  /**
   * Calculate overall score from issues
   */
  private calculateOverallScore(issues: ComplianceIssue[]): number {
    if (issues.length === 0) return 100;

    const criticalPenalty = issues.filter((i) => i.severity === 'critical').length * 20;
    const warningPenalty = issues.filter((i) => i.severity === 'warning').length * 10;
    const infoPenalty = issues.filter((i) => i.severity === 'info').length * 5;

    const totalPenalty = criticalPenalty + warningPenalty + infoPenalty;
    return Math.max(0, 100 - totalPenalty);
  }

  /**
   * Extract rules checked from issues
   */
  private extractRulesChecked(issues: ComplianceIssue[]): string[] {
    const rules = new Set<string>();
    issues.forEach((issue) => {
      if (issue.regulation) {
        rules.add(issue.regulation.reference);
      }
    });
    return Array.from(rules);
  }
}

/**
 * Default results service instance
 */
export const resultsService = new ResultsService();
