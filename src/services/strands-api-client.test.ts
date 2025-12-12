// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Strands API Client Tests
 *
 * Unit tests for the Strands API client HTTP/REST and WebSocket functionality.
 * Tests error handling, retry logic, and API integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrandsApiClient, type ApiResponse, type UploadSessionResponse } from './strands-api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  readyState = MockWebSocket.OPEN;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  send(data: string) {
    // Mock send implementation
  }

  close() {
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

global.WebSocket = MockWebSocket as any;

describe('StrandsApiClient', () => {
  let client: StrandsApiClient;

  beforeEach(() => {
    client = new StrandsApiClient('http://localhost:8080');
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('HTTP Client', () => {
    describe('uploadDocument', () => {
      it('should upload a PDF file successfully', async () => {
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        const mockResponse: UploadSessionResponse = {
          id: 'upload-123',
          filename: 'test.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          status: 'completed',
          progress: 100,
          startedAt: new Date().toISOString(),
        };

        // Mock XMLHttpRequest for file upload
        const mockXHR = {
          upload: { addEventListener: vi.fn() },
          addEventListener: vi.fn(),
          open: vi.fn(),
          send: vi.fn(),
          status: 200,
          responseText: JSON.stringify(mockResponse),
          timeout: 0,
        };

        const originalXHR = global.XMLHttpRequest;
        global.XMLHttpRequest = function() {
          return mockXHR;
        } as any;

        // Simulate successful upload
        setTimeout(() => {
          const loadHandler = mockXHR.addEventListener.mock.calls.find(
            call => call[0] === 'load'
          )?.[1];
          if (loadHandler) loadHandler();
        }, 0);

        const result = await client.uploadDocument(mockFile);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
        expect(mockXHR.open).toHaveBeenCalledWith('POST', 'http://localhost:8080/api/documents/upload');

        global.XMLHttpRequest = originalXHR;
      });

      it('should handle upload progress tracking', async () => {
        const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        const progressCallback = vi.fn();

        const mockXHR = {
          upload: { addEventListener: vi.fn() },
          addEventListener: vi.fn(),
          open: vi.fn(),
          send: vi.fn(),
          status: 200,
          responseText: JSON.stringify({ id: 'upload-123' }),
          timeout: 0,
        };

        const originalXHR = global.XMLHttpRequest;
        global.XMLHttpRequest = function() {
          return mockXHR;
        } as any;

        // Simulate progress events
        setTimeout(() => {
          const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
            call => call[0] === 'progress'
          )?.[1];
          if (progressHandler) {
            progressHandler({ lengthComputable: true, loaded: 50, total: 100 });
            progressHandler({ lengthComputable: true, loaded: 100, total: 100 });
          }

          const loadHandler = mockXHR.addEventListener.mock.calls.find(
            call => call[0] === 'load'
          )?.[1];
          if (loadHandler) loadHandler();
        }, 0);

        await client.uploadDocument(mockFile, progressCallback);

        expect(progressCallback).toHaveBeenCalledWith(50);
        expect(progressCallback).toHaveBeenCalledWith(100);

        global.XMLHttpRequest = originalXHR;
      });
    });

    describe('getUploadStatus', () => {
      it('should fetch upload status successfully', async () => {
        const mockResponse: UploadSessionResponse = {
          id: 'upload-123',
          filename: 'test.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          status: 'processing',
          progress: 75,
          startedAt: new Date().toISOString(),
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await client.getUploadStatus('upload-123');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/documents/upload/upload-123',
          expect.objectContaining({ method: 'GET' })
        );
      });

      it('should handle HTTP errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });

        const result = await client.getUploadStatus('nonexistent');

        expect(result.success).toBe(false);
        expect(result.error).toContain('HTTP 404');
      });
    });

    describe('startAnalysis', () => {
      it('should start analysis successfully', async () => {
        const mockResponse = {
          id: 'analysis-123',
          proposalId: 'proposal-456',
          status: 'queued',
          progress: 0,
          startedAt: new Date().toISOString(),
          currentStep: 'initializing',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await client.startAnalysis('proposal-456');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/analysis/start',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              proposalId: 'proposal-456',
              frameworks: ['FAR', 'DFARS'],
            }),
          })
        );
      });
    });

    describe('getResults', () => {
      it('should fetch compliance results successfully', async () => {
        const mockResponse = {
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
            },
          ],
          summary: {
            totalIssues: 1,
            criticalIssues: 1,
            warningIssues: 0,
          },
          generatedAt: new Date().toISOString(),
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await client.getResults('proposal-456');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/results/proposal-456',
          expect.objectContaining({ method: 'GET' })
        );
      });
    });

    describe('healthCheck', () => {
      it('should check service health successfully', async () => {
        const mockResponse = {
          status: 'healthy',
          version: '1.0.0',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await client.healthCheck();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/health',
          expect.objectContaining({ method: 'GET' })
        );
      });
    });

    describe('retry logic', () => {
      it('should retry failed requests', async () => {
        // First two calls fail, third succeeds
        mockFetch
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ status: 'healthy' }),
          });

        const result = await client.healthCheck();

        expect(result.success).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      it('should not retry client errors (4xx)', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
        });

        const result = await client.healthCheck();

        expect(result.success).toBe(false);
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('WebSocket Client', () => {
    it('should connect to WebSocket successfully', async () => {
      await expect(client.connectWebSocket()).resolves.toBeUndefined();
      expect(client.isWebSocketConnected()).toBe(true);
    });

    it('should handle WebSocket message subscriptions', async () => {
      await client.connectWebSocket();

      const progressCallback = vi.fn();
      client.subscribeToUploadProgress(progressCallback);

      // Simulate receiving a message
      const mockMessage = {
        type: 'upload_progress' as const,
        sessionId: 'upload-123',
        data: { progress: 50 },
      };

      // Access the WebSocket instance and trigger onmessage
      const wsInstance = (client as any).wsClient.ws;
      if (wsInstance && wsInstance.onmessage) {
        wsInstance.onmessage({
          data: JSON.stringify(mockMessage),
        } as MessageEvent);
      }

      expect(progressCallback).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle WebSocket disconnection', async () => {
      await client.connectWebSocket();
      expect(client.isWebSocketConnected()).toBe(true);

      client.disconnectWebSocket();
      expect(client.isWebSocketConnected()).toBe(false);
    });

    it('should handle subscription management', async () => {
      await client.connectWebSocket();

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      client.subscribeToAnalysisProgress(callback1);
      client.subscribeToAnalysisProgress(callback2);

      // Unsubscribe one callback
      client.unsubscribe('analysis_progress', callback1);

      // Simulate message
      const mockMessage = {
        type: 'analysis_progress' as const,
        sessionId: 'analysis-123',
        data: { progress: 75 },
      };

      const wsInstance = (client as any).wsClient.ws;
      if (wsInstance && wsInstance.onmessage) {
        wsInstance.onmessage({
          data: JSON.stringify(mockMessage),
        } as MessageEvent);
      }

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(mockMessage);
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await client.healthCheck();

      expect(result.success).toBe(false);
      expect(result.code).toBe('TIMEOUT_001');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await client.healthCheck();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    }, 10000);
  });
});