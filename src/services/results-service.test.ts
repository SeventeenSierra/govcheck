// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Results Service Tests
 *
 * Unit tests for the results service functionality including results retrieval,
 * issue details, and regulatory references.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComplianceStatus, IssueSeverity } from '../components/results/types';
import { ResultsService } from './results-service';
import type { StrandsApiClient } from './strands-api-client';
import * as strandsApiModule from './strands-api-client';

// Mock the Strands API client
vi.mock('./strands-api-client', () => ({
  strandsApiClient: {
    getResults: vi.fn(),
    getIssueDetails: vi.fn(),
  },
}));

describe('ResultsService', () => {
  let resultsService: ResultsService;
  let mockStrandsApi: Partial<StrandsApiClient>;

  beforeEach(() => {
    resultsService = new ResultsService();
    resultsService.clearCache();
    mockStrandsApi = strandsApiModule.strandsApiClient;
    vi.clearAllMocks();
  });

  afterEach(() => {
    resultsService.clearCache();
  });

  describe('Results Retrieval', () => {
    it('should get compliance results successfully', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'warning',
          issues: [
            {
              id: 'issue-1',
              severity: 'critical',
              title: 'Missing FAR clause',
              description: 'Required FAR clause not found',
              regulation: {
                framework: 'FAR',
                section: '52.204-1',
                reference: 'FAR 52.204-1',
              },
              remediation: 'Add the required FAR clause',
            },
          ],
          summary: {
            totalIssues: 1,
            criticalIssues: 1,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValueOnce(mockApiResponse);

      const result = await resultsService.getResults('proposal-456');

      expect(result.success).toBe(true);
      expect(result.results).toBeTruthy();
      expect(result.results?.proposalId).toBe('proposal-456');
      expect(result.results?.status).toBe(ComplianceStatus.WARNING);
      expect(result.results?.issues).toHaveLength(1);
      expect(mockStrandsApi.getResults).toHaveBeenCalledWith('proposal-456');
    });

    it('should handle results retrieval failures', async () => {
      const mockResponse = {
        success: false,
        error: 'Results not found',
      };

      mockStrandsApi.getResults.mockResolvedValueOnce(mockResponse);

      const result = await resultsService.getResults('proposal-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Results not found');
    });

    it('should handle results retrieval exceptions', async () => {
      mockStrandsApi.getResults.mockRejectedValueOnce(new Error('Network error'));

      const result = await resultsService.getResults('proposal-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should use cached results when available', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'pass',
          issues: [],
          summary: {
            totalIssues: 0,
            criticalIssues: 0,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValueOnce(mockApiResponse);

      // First call - should hit API
      await resultsService.getResults('proposal-456');
      expect(mockStrandsApi.getResults).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result = await resultsService.getResults('proposal-456', true);
      expect(result.success).toBe(true);
      expect(mockStrandsApi.getResults).toHaveBeenCalledTimes(1); // No additional API call
    });

    it('should bypass cache when requested', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'pass',
          issues: [],
          summary: {
            totalIssues: 0,
            criticalIssues: 0,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValue(mockApiResponse);

      // First call
      await resultsService.getResults('proposal-456');
      expect(mockStrandsApi.getResults).toHaveBeenCalledTimes(1);

      // Second call with cache bypass
      await resultsService.getResults('proposal-456', false);
      expect(mockStrandsApi.getResults).toHaveBeenCalledTimes(2);
    });
  });

  describe('Issue Details', () => {
    it('should get issue details successfully', async () => {
      const mockIssue = {
        id: 'issue-1',
        severity: 'critical',
        title: 'Missing FAR clause',
        description: 'Required FAR clause not found',
        regulation: {
          framework: 'FAR',
          section: '52.204-1',
          reference: 'FAR 52.204-1',
        },
        location: {
          page: 5,
          section: 'Section 2.1',
          text: 'Sample text location',
        },
        remediation: 'Add the required FAR clause',
      };

      mockStrandsApi.getIssueDetails.mockResolvedValueOnce({
        success: true,
        data: mockIssue,
      });

      const result = await resultsService.getIssueDetails('issue-1');

      expect(result.success).toBe(true);
      expect(result.issue).toEqual(mockIssue);
      expect(mockStrandsApi.getIssueDetails).toHaveBeenCalledWith('issue-1');
    });

    it('should handle issue details retrieval failures', async () => {
      mockStrandsApi.getIssueDetails.mockResolvedValueOnce({
        success: false,
        error: 'Issue not found',
      });

      const result = await resultsService.getIssueDetails('issue-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Issue not found');
    });
  });

  describe('Regulatory References', () => {
    it('should extract regulatory references from results', () => {
      const mockResults = {
        sessionId: 'results-123',
        proposalId: 'proposal-456',
        status: ComplianceStatus.WARNING,
        overallScore: 75,
        issues: [
          {
            id: 'issue-1',
            severity: IssueSeverity.CRITICAL,
            title: 'FAR Issue',
            description: 'FAR compliance issue',
            regulation: 'FAR 52.204-1',
          },
          {
            id: 'issue-2',
            severity: IssueSeverity.WARNING,
            title: 'DFARS Issue',
            description: 'DFARS compliance issue',
            regulation: 'DFARS 252.204-7012',
          },
          {
            id: 'issue-3',
            severity: IssueSeverity.CRITICAL,
            title: 'Another FAR Issue',
            description: 'Another FAR compliance issue',
            regulation: 'FAR 52.219-8',
          },
        ],
        metadata: {
          totalPages: 10,
          processingTime: 5000,
          rulesChecked: ['FAR 52.204-1', 'DFARS 252.204-7012'],
          completedAt: new Date(),
          issueCounts: {
            critical: 2,
            warning: 1,
            info: 0,
          },
        },
      };

      const references = resultsService.getRegulatoryReferences(mockResults);

      expect(references).toHaveLength(2);

      const farRef = references.find((r) => r.framework === 'FAR');
      expect(farRef).toBeTruthy();
      expect(farRef?.sections).toEqual(['52.204-1', '52.219-8']);
      expect(farRef?.count).toBe(2);

      const dfarsRef = references.find((r) => r.framework === 'DFARS');
      expect(dfarsRef).toBeTruthy();
      expect(dfarsRef?.sections).toEqual(['252.204-7012']);
      expect(dfarsRef?.count).toBe(1);
    });
  });

  describe('Issue Statistics', () => {
    it('should calculate issue statistics correctly', () => {
      const mockResults = {
        sessionId: 'results-123',
        proposalId: 'proposal-456',
        status: ComplianceStatus.FAIL,
        overallScore: 60,
        issues: [
          {
            id: 'issue-1',
            severity: IssueSeverity.CRITICAL,
            title: 'Critical Issue',
            description: 'Critical compliance issue',
            regulation: 'FAR 52.204-1',
          },
          {
            id: 'issue-2',
            severity: IssueSeverity.CRITICAL,
            title: 'Another Critical Issue',
            description: 'Another critical compliance issue',
            regulation: 'FAR 52.219-8',
          },
          {
            id: 'issue-3',
            severity: IssueSeverity.WARNING,
            title: 'Warning Issue',
            description: 'Warning compliance issue',
            regulation: 'DFARS 252.204-7012',
          },
          {
            id: 'issue-4',
            severity: IssueSeverity.INFO,
            title: 'Info Issue',
            description: 'Info compliance issue',
            regulation: 'FAR 52.204-1',
          },
        ],
        metadata: {
          totalPages: 10,
          processingTime: 5000,
          rulesChecked: ['FAR 52.204-1', 'DFARS 252.204-7012'],
          completedAt: new Date(),
          issueCounts: { critical: 2, warning: 1, info: 1 },
        },
      };

      const stats = resultsService.getIssueStatistics(mockResults);

      expect(stats.total).toBe(4);
      expect(stats.critical).toBe(2);
      expect(stats.warning).toBe(1);
      expect(stats.info).toBe(1);
      expect(stats.byFramework).toHaveLength(2);

      const farStats = stats.byFramework.find((f) => f.framework === 'FAR');
      expect(farStats?.count).toBe(3);

      const dfarsStats = stats.byFramework.find((f) => f.framework === 'DFARS');
      expect(dfarsStats?.count).toBe(1);
    });
  });

  describe('Issue Filtering', () => {
    it('should filter issues by severity', () => {
      const mockResults = {
        sessionId: 'results-123',
        proposalId: 'proposal-456',
        status: ComplianceStatus.WARNING,
        overallScore: 75,
        issues: [
          {
            id: 'issue-1',
            severity: IssueSeverity.CRITICAL,
            title: 'Critical Issue',
            description: 'Critical compliance issue',
            regulation: 'FAR 52.204-1',
          },
          {
            id: 'issue-2',
            severity: IssueSeverity.WARNING,
            title: 'Warning Issue',
            description: 'Warning compliance issue',
            regulation: 'DFARS 252.204-7012',
          },
          {
            id: 'issue-3',
            severity: IssueSeverity.INFO,
            title: 'Info Issue',
            description: 'Info compliance issue',
            regulation: 'FAR 52.219-8',
          },
        ],
        metadata: {
          totalPages: 10,
          processingTime: 5000,
          rulesChecked: ['FAR 52.204-1'],
          completedAt: new Date(),
          issueCounts: { critical: 1, warning: 1, info: 1 },
        },
      };

      const criticalIssues = resultsService.filterIssuesBySeverity(
        mockResults,
        IssueSeverity.CRITICAL
      );
      expect(criticalIssues).toHaveLength(1);
      expect(criticalIssues[0].id).toBe('issue-1');

      const warningIssues = resultsService.filterIssuesBySeverity(
        mockResults,
        IssueSeverity.WARNING
      );
      expect(warningIssues).toHaveLength(1);
      expect(warningIssues[0].id).toBe('issue-2');

      const infoIssues = resultsService.filterIssuesBySeverity(mockResults, IssueSeverity.INFO);
      expect(infoIssues).toHaveLength(1);
      expect(infoIssues[0].id).toBe('issue-3');
    });
  });

  describe('Results Export', () => {
    it('should export results to JSON format', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'pass',
          issues: [],
          summary: {
            totalIssues: 0,
            criticalIssues: 0,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValueOnce(mockApiResponse);

      const result = await resultsService.exportResults('proposal-456', 'json');

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('string');
      expect(() => JSON.parse(result.data as string)).not.toThrow();
    });

    it('should export results to CSV format', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'warning',
          issues: [
            {
              id: 'issue-1',
              severity: 'critical',
              title: 'Test Issue',
              description: 'Test description',
              regulation: {
                framework: 'FAR',
                section: '52.204-1',
                reference: 'FAR 52.204-1',
              },
              remediation: 'Test remediation',
            },
          ],
          summary: {
            totalIssues: 1,
            criticalIssues: 1,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValueOnce(mockApiResponse);

      const result = await resultsService.exportResults('proposal-456', 'csv');

      expect(result.success).toBe(true);
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('Issue ID,Severity,Title');
      expect(result.data).toContain('issue-1,critical,"Test Issue"');
    });

    it('should handle export failures', async () => {
      mockStrandsApi.getResults.mockResolvedValueOnce({
        success: false,
        error: 'Results not found',
      });

      const result = await resultsService.exportResults('proposal-456', 'json');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Results not found');
    });
  });

  describe('Cache Management', () => {
    it('should manage results cache correctly', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'pass',
          issues: [],
          summary: {
            totalIssues: 0,
            criticalIssues: 0,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValueOnce(mockApiResponse);

      // Load results into cache
      await resultsService.getResults('proposal-456');

      // Check cached results
      const cachedResults = resultsService.getCachedResults('proposal-456');
      expect(cachedResults).toBeTruthy();
      expect(cachedResults?.proposalId).toBe('proposal-456');

      // Clear specific cache
      resultsService.clearCache('proposal-456');
      const clearedResults = resultsService.getCachedResults('proposal-456');
      expect(clearedResults).toBeNull();
    });

    it('should clear all cache', async () => {
      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'pass',
          issues: [],
          summary: {
            totalIssues: 0,
            criticalIssues: 0,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValue(mockApiResponse);

      // Load multiple results
      await resultsService.getResults('proposal-1');
      await resultsService.getResults('proposal-2');

      // Clear all cache
      resultsService.clearCache();

      expect(resultsService.getCachedResults('proposal-1')).toBeNull();
      expect(resultsService.getCachedResults('proposal-2')).toBeNull();
    });
  });

  describe('Event Handlers', () => {
    it('should call event handlers for results events', async () => {
      const onResultsUpdate = vi.fn();
      const onError = vi.fn();

      resultsService.setEventHandlers({
        onResultsUpdate,
        onError,
      });

      const mockApiResponse = {
        success: true,
        data: {
          id: 'results-123',
          proposalId: 'proposal-456',
          status: 'pass',
          issues: [],
          summary: {
            totalIssues: 0,
            criticalIssues: 0,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getResults.mockResolvedValueOnce(mockApiResponse);

      await resultsService.getResults('proposal-456');

      expect(onResultsUpdate).toHaveBeenCalledWith('proposal-456', expect.any(Object));
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
