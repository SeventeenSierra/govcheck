// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Analysis Service Tests
 *
 * Unit tests for the analysis service functionality including analysis management,
 * progress tracking, and API integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalysisService, type AnalysisRequest } from './analysis-service';
import { AnalysisStatus } from '../components/analysis/types';
import * as strandsApiModule from './strands-api-client';

// Mock the Strands API client
vi.mock('./strands-api-client', () => ({
  strandsApiClient: {
    startAnalysis: vi.fn(),
    getAnalysisStatus: vi.fn(),
    cancelAnalysis: vi.fn(),
    connectWebSocket: vi.fn(),
    subscribeToAnalysisProgress: vi.fn(),
    subscribeToAnalysisComplete: vi.fn(),
    subscribeToErrors: vi.fn(),
    disconnectWebSocket: vi.fn(),
  },
}));

describe('AnalysisService', () => {
  let analysisService: AnalysisService;
  let mockStrandsApi: any;

  beforeEach(() => {
    analysisService = new AnalysisService();
    analysisService.clearAllSessions();
    mockStrandsApi = strandsApiModule.strandsApiClient;
    vi.clearAllMocks();
  });

  afterEach(() => {
    analysisService.clearAllSessions();
  });

  describe('Analysis Request Validation', () => {
    it('should accept valid analysis requests', () => {
      const validRequest: AnalysisRequest = {
        proposalId: 'proposal-123',
        frameworks: ['FAR', 'DFARS'],
      };

      const result = analysisService.validateAnalysisRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject requests without proposal ID', () => {
      const invalidRequest: AnalysisRequest = {
        proposalId: '',
      };

      const result = analysisService.validateAnalysisRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Proposal ID is required');
    });

    it('should reject requests with very long proposal IDs', () => {
      const invalidRequest: AnalysisRequest = {
        proposalId: 'x'.repeat(200),
      };

      const result = analysisService.validateAnalysisRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should reject requests with invalid frameworks', () => {
      const invalidRequest: AnalysisRequest = {
        proposalId: 'proposal-123',
        frameworks: ['INVALID' as any],
      };

      const result = analysisService.validateAnalysisRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid frameworks');
    });
  });

  describe('Analysis Management', () => {
    it('should start analysis successfully', async () => {
      const request: AnalysisRequest = {
        proposalId: 'proposal-123',
        frameworks: ['FAR', 'DFARS'],
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'analysis-456',
          proposalId: 'proposal-123',
          status: 'queued',
          progress: 0,
          startedAt: new Date().toISOString(),
          currentStep: 'Initializing analysis',
        },
      };

      mockStrandsApi.startAnalysis.mockResolvedValueOnce(mockResponse);

      const result = await analysisService.startAnalysis(request);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('analysis-456');
      expect(mockStrandsApi.startAnalysis).toHaveBeenCalledWith('proposal-123');
    });

    it('should handle analysis start failures', async () => {
      const request: AnalysisRequest = {
        proposalId: 'proposal-123',
      };

      const mockResponse = {
        success: false,
        error: 'Server error',
      };

      mockStrandsApi.startAnalysis.mockResolvedValueOnce(mockResponse);

      const result = await analysisService.startAnalysis(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should handle analysis start exceptions', async () => {
      const request: AnalysisRequest = {
        proposalId: 'proposal-123',
      };

      mockStrandsApi.startAnalysis.mockRejectedValueOnce(new Error('Network error'));

      const result = await analysisService.startAnalysis(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('Session Management', () => {
    it('should track active sessions', async () => {
      const request: AnalysisRequest = {
        proposalId: 'proposal-123',
      };

      mockStrandsApi.startAnalysis.mockResolvedValueOnce({
        success: true,
        data: {
          id: 'analysis-456',
          proposalId: 'proposal-123',
          status: 'queued',
          progress: 0,
          startedAt: new Date().toISOString(),
          currentStep: 'Initializing',
        },
      });

      await analysisService.startAnalysis(request);
      const sessions = analysisService.getActiveSessions();

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('analysis-456');
      expect(sessions[0].status).toBe(AnalysisStatus.QUEUED);
    });

    it('should get analysis status from server', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'analysis-456',
          proposalId: 'proposal-123',
          status: 'analyzing',
          progress: 50,
          startedAt: new Date().toISOString(),
          currentStep: 'Analyzing compliance',
        },
      };

      mockStrandsApi.getAnalysisStatus.mockResolvedValueOnce(mockResponse);

      const session = await analysisService.getAnalysisStatus('analysis-456');

      expect(session).toBeTruthy();
      expect(session?.id).toBe('analysis-456');
      expect(session?.status).toBe(AnalysisStatus.ANALYZING);
      expect(session?.progress).toBe(50);
    });

    it('should cancel analysis sessions', async () => {
      // First start an analysis
      mockStrandsApi.startAnalysis.mockResolvedValueOnce({
        success: true,
        data: {
          id: 'analysis-456',
          proposalId: 'proposal-123',
          status: 'analyzing',
          progress: 25,
          startedAt: new Date().toISOString(),
          currentStep: 'Analyzing',
        },
      });

      await analysisService.startAnalysis({ proposalId: 'proposal-123' });

      // Then cancel it
      mockStrandsApi.cancelAnalysis.mockResolvedValueOnce({ success: true });

      const result = await analysisService.cancelAnalysis('analysis-456');
      const session = analysisService['activeSessions'].get('analysis-456');

      expect(result).toBe(true);
      expect(session?.status).toBe(AnalysisStatus.FAILED);
      expect(session?.errorMessage).toContain('cancelled');
    });

    it('should clear completed sessions', () => {
      const sessionId = 'analysis-456';
      analysisService['activeSessions'].set(sessionId, {
        id: sessionId,
        proposalId: 'proposal-123',
        status: AnalysisStatus.COMPLETED,
        progress: 100,
        startedAt: new Date(),
        currentStep: 'Complete',
      });

      const result = analysisService.clearSession(sessionId);

      expect(result).toBe(true);
      expect(analysisService['activeSessions'].has(sessionId)).toBe(false);
    });

    it('should not clear active sessions', () => {
      const sessionId = 'analysis-456';
      analysisService['activeSessions'].set(sessionId, {
        id: sessionId,
        proposalId: 'proposal-123',
        status: AnalysisStatus.ANALYZING,
        progress: 50,
        startedAt: new Date(),
        currentStep: 'Analyzing',
      });

      const result = analysisService.clearSession(sessionId);

      expect(result).toBe(false);
      expect(analysisService['activeSessions'].has(sessionId)).toBe(true);
    });

    it('should clear all sessions', () => {
      analysisService['activeSessions'].set('session1', {} as any);
      analysisService['activeSessions'].set('session2', {} as any);

      analysisService.clearAllSessions();

      expect(analysisService.getActiveSessions()).toHaveLength(0);
    });
  });

  describe('Analysis Retry', () => {
    it('should retry failed analysis', async () => {
      const sessionId = 'analysis-456';
      
      // Set up a failed session
      analysisService['activeSessions'].set(sessionId, {
        id: sessionId,
        proposalId: 'proposal-123',
        status: AnalysisStatus.FAILED,
        progress: 0,
        startedAt: new Date(),
        currentStep: 'Failed',
        errorMessage: 'Analysis failed',
      });

      // Mock successful retry
      mockStrandsApi.startAnalysis.mockResolvedValueOnce({
        success: true,
        data: {
          id: 'analysis-789',
          proposalId: 'proposal-123',
          status: 'queued',
          progress: 0,
          startedAt: new Date().toISOString(),
          currentStep: 'Initializing',
        },
      });

      const result = await analysisService.retryAnalysis(sessionId);

      expect(result.success).toBe(true);
      expect(result.newSessionId).toBe('analysis-789');
      expect(analysisService['activeSessions'].has(sessionId)).toBe(false);
    });

    it('should not retry non-failed analysis', async () => {
      const sessionId = 'analysis-456';
      
      analysisService['activeSessions'].set(sessionId, {
        id: sessionId,
        proposalId: 'proposal-123',
        status: AnalysisStatus.ANALYZING,
        progress: 50,
        startedAt: new Date(),
        currentStep: 'Analyzing',
      });

      const result = await analysisService.retryAnalysis(sessionId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Can only retry failed analyses');
    });

    it('should handle retry for non-existent session', async () => {
      const result = await analysisService.retryAnalysis('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Session not found');
    });
  });

  describe('Real-time Updates', () => {
    it('should subscribe to WebSocket updates', async () => {
      mockStrandsApi.connectWebSocket.mockResolvedValueOnce(undefined);
      mockStrandsApi.subscribeToAnalysisProgress.mockImplementationOnce(() => {});
      mockStrandsApi.subscribeToAnalysisComplete.mockImplementationOnce(() => {});
      mockStrandsApi.subscribeToErrors.mockImplementationOnce(() => {});

      await analysisService.subscribeToRealTimeUpdates();

      expect(mockStrandsApi.connectWebSocket).toHaveBeenCalled();
      expect(mockStrandsApi.subscribeToAnalysisProgress).toHaveBeenCalled();
      expect(mockStrandsApi.subscribeToAnalysisComplete).toHaveBeenCalled();
      expect(mockStrandsApi.subscribeToErrors).toHaveBeenCalled();
    });

    it('should handle WebSocket connection errors', async () => {
      mockStrandsApi.connectWebSocket.mockRejectedValueOnce(new Error('Connection failed'));
      
      // Should not throw
      await expect(analysisService.subscribeToRealTimeUpdates()).resolves.toBeUndefined();
    });

    it('should unsubscribe from WebSocket updates', () => {
      analysisService.unsubscribeFromRealTimeUpdates();

      expect(mockStrandsApi.disconnectWebSocket).toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    it('should call event handlers for analysis events', async () => {
      const onProgress = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      analysisService.setEventHandlers({
        onProgress,
        onComplete,
        onError,
      });

      // Test that handlers are set
      expect(analysisService['eventHandlers'].onProgress).toBe(onProgress);
      expect(analysisService['eventHandlers'].onComplete).toBe(onComplete);
      expect(analysisService['eventHandlers'].onError).toBe(onError);
    });
  });

  describe('Status Mapping', () => {
    it('should map API status to local status correctly', () => {
      const testCases = [
        { api: 'queued', local: AnalysisStatus.QUEUED },
        { api: 'extracting', local: AnalysisStatus.EXTRACTING },
        { api: 'analyzing', local: AnalysisStatus.ANALYZING },
        { api: 'validating', local: AnalysisStatus.VALIDATING },
        { api: 'completed', local: AnalysisStatus.COMPLETED },
        { api: 'failed', local: AnalysisStatus.FAILED },
        { api: 'unknown', local: AnalysisStatus.QUEUED }, // Default case
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          id: 'test-id',
          proposalId: 'test-proposal',
          status: testCase.api,
          progress: 0,
          startedAt: new Date().toISOString(),
          currentStep: 'test',
        };

        const session = analysisService['mapApiResponseToSession'](mockResponse);
        expect(session.status).toBe(testCase.local);
      }
    });
  });
});