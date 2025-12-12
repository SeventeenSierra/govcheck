// @ts-nocheck
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Upload Service Tests
 *
 * Unit tests for the upload service functionality including file validation,
 * upload management, and API integration.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type UploadSession, UploadStatus } from '../types/app';
import type { StrandsApiClient } from './strands-api-client';
import * as strandsApiModule from './strands-api-client';
import { UploadService } from './upload-service';

// Mock the Strands API client
vi.mock('./strands-api-client', () => ({
  strandsApiClient: {
    uploadDocument: vi.fn(),
    getUploadStatus: vi.fn(),
    connectWebSocket: vi.fn(),
    subscribeToUploadProgress: vi.fn(),
    disconnectWebSocket: vi.fn(),
  },
}));

describe('UploadService', () => {
  let uploadService: UploadService;
  let mockStrandsApi: Partial<StrandsApiClient>;

  beforeEach(() => {
    uploadService = new UploadService();
    uploadService.clearAllSessions(); // Ensure clean state
    mockStrandsApi = strandsApiModule.strandsApiClient;
    vi.clearAllMocks();
  });

  afterEach(() => {
    uploadService.clearAllSessions();
  });

  describe('File Validation', () => {
    it('should accept valid PDF files', () => {
      // Create a file with sufficient size (> 1KB)
      const content = 'x'.repeat(2048); // 2KB
      const validFile = new File([content], 'test.pdf', { type: 'application/pdf' });
      const result = uploadService.validateFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-PDF files', () => {
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = uploadService.validateFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Only PDF files are accepted');
      expect(result.errorCode).toBe('VALIDATION_001');
    });

    it('should reject files that are too large', () => {
      // Create a mock file with large size without actually creating the content
      const largeFile = new File(['test content'], 'large.pdf', {
        type: 'application/pdf',
      });

      // Mock the size property to simulate a large file
      Object.defineProperty(largeFile, 'size', {
        value: 101 * 1024 * 1024, // 101MB
        writable: false,
      });

      const result = uploadService.validateFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds the maximum limit');
    });

    it('should reject files that are too small', () => {
      const smallFile = new File(['x'], 'small.pdf', { type: 'application/pdf' });
      const result = uploadService.validateFile(smallFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too small');
    });

    it('should reject files with very long filenames', () => {
      const longName = `${'x'.repeat(300)}.pdf`;
      const content = 'x'.repeat(2048); // Ensure file is large enough
      const file = new File([content], longName, { type: 'application/pdf' });
      const result = uploadService.validateFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Filename is too long');
    });
  });

  describe('Upload Management', () => {
    it('should upload a valid file successfully', async () => {
      uploadService.clearAllSessions(); // Ensure clean state
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        success: true,
        data: {
          id: 'upload-123',
          filename: 'test.pdf',
          fileSize: file.size,
          mimeType: 'application/pdf',
          status: 'completed',
          progress: 100,
          startedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.uploadDocument.mockResolvedValueOnce(mockResponse);

      const result = await uploadService.uploadDocument(file);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('upload-123');
      expect(mockStrandsApi.uploadDocument).toHaveBeenCalledWith(file, expect.any(Function));
    });

    it('should handle upload failures', async () => {
      uploadService.clearAllSessions(); // Ensure clean state
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        success: false,
        error: 'Server error',
      };

      mockStrandsApi.uploadDocument.mockResolvedValueOnce(mockResponse);

      const result = await uploadService.uploadDocument(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should track upload progress', async () => {
      uploadService.clearAllSessions(); // Ensure clean state
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const progressCallback = vi.fn();

      uploadService.setEventHandlers({
        onProgress: progressCallback,
      });

      mockStrandsApi.uploadDocument.mockImplementationOnce(
        (file: File, onProgress: (progress: number) => void) => {
          // Simulate progress updates
          onProgress(25);
          onProgress(50);
          onProgress(75);
          onProgress(100);

          return Promise.resolve({
            success: true,
            data: {
              id: 'upload-123',
              filename: 'test.pdf',
              fileSize: file.size,
              mimeType: 'application/pdf',
              status: 'completed',
              progress: 100,
              startedAt: new Date().toISOString(),
            },
          });
        }
      );

      await uploadService.uploadDocument(file);

      expect(progressCallback).toHaveBeenCalledWith(expect.any(String), 25);
      expect(progressCallback).toHaveBeenCalledWith(expect.any(String), 50);
      expect(progressCallback).toHaveBeenCalledWith(expect.any(String), 75);
      expect(progressCallback).toHaveBeenCalledWith(expect.any(String), 100);
    });

    it('should handle upload exceptions', async () => {
      uploadService.clearAllSessions(); // Ensure clean state
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      mockStrandsApi.uploadDocument.mockRejectedValueOnce(new Error('Network error'));

      const result = await uploadService.uploadDocument(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('Session Management', () => {
    it('should track active sessions', async () => {
      // Ensure clean state for this test
      uploadService.clearAllSessions();

      const content = 'x'.repeat(2048); // Ensure file is large enough
      const file = new File([content], 'test.pdf', { type: 'application/pdf' });

      mockStrandsApi.uploadDocument.mockResolvedValueOnce({
        success: true,
        data: {
          id: 'upload-123',
          filename: 'test.pdf',
          fileSize: file.size,
          mimeType: 'application/pdf',
          status: 'completed',
          progress: 100,
          startedAt: new Date().toISOString(),
        },
      });

      await uploadService.uploadDocument(file);
      const sessions = uploadService.getActiveSessions();

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('upload-123');
      expect(sessions[0].status).toBe(UploadStatus.COMPLETED);
    });

    it('should get upload status from server', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'upload-123',
          filename: 'test.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          status: 'processing',
          progress: 75,
          startedAt: new Date().toISOString(),
        },
      };

      mockStrandsApi.getUploadStatus.mockResolvedValueOnce(mockResponse);

      const session = await uploadService.getUploadStatus('upload-123');

      expect(session).toBeTruthy();
      expect(session?.id).toBe('upload-123');
      expect(session?.status).toBe(UploadStatus.PROCESSING);
      expect(session?.progress).toBe(75);
    });

    it('should cancel upload sessions', () => {
      // Manually add a session in uploading state
      const sessionId = 'upload-123';
      uploadService.activeSessions.set(sessionId, {
        id: sessionId,
        filename: 'test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: UploadStatus.UPLOADING,
        progress: 50,
        startedAt: new Date(),
      });

      const result = uploadService.cancelUpload(sessionId);
      const session = uploadService.activeSessions.get(sessionId);

      expect(result).toBe(true);
      expect(session?.status).toBe(UploadStatus.FAILED);
      expect(session?.errorMessage).toContain('cancelled');
    });

    it('should clear completed sessions', () => {
      const sessionId = 'upload-123';
      uploadService.activeSessions.set(sessionId, {
        id: sessionId,
        filename: 'test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: UploadStatus.COMPLETED,
        progress: 100,
        startedAt: new Date(),
        completedAt: new Date(),
      });

      const result = uploadService.clearSession(sessionId);

      expect(result).toBe(true);
      expect(uploadService.activeSessions.has(sessionId)).toBe(false);
    });

    it('should clear all sessions', () => {
      const mockSession1: UploadSession = {
        id: 'session1',
        filename: 'test1.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: UploadStatus.UPLOADING,
        progress: 50,
        startedAt: new Date(),
      };
      const mockSession2: UploadSession = {
        id: 'session2',
        filename: 'test2.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        status: UploadStatus.UPLOADING,
        progress: 30,
        startedAt: new Date(),
      };
      uploadService.activeSessions.set('session1', mockSession1);
      uploadService.activeSessions.set('session2', mockSession2);

      uploadService.clearAllSessions();

      expect(uploadService.getActiveSessions()).toHaveLength(0);
    });
  });

  describe('Real-time Updates', () => {
    it('should subscribe to WebSocket updates', async () => {
      mockStrandsApi.connectWebSocket.mockResolvedValueOnce(undefined);
      mockStrandsApi.subscribeToUploadProgress.mockImplementationOnce(() => {});

      await uploadService.subscribeToRealTimeUpdates();

      expect(mockStrandsApi.connectWebSocket).toHaveBeenCalled();
      expect(mockStrandsApi.subscribeToUploadProgress).toHaveBeenCalled();
    });

    it('should handle WebSocket connection errors', async () => {
      mockStrandsApi.connectWebSocket.mockRejectedValueOnce(new Error('Connection failed'));

      // Should not throw
      await expect(uploadService.subscribeToRealTimeUpdates()).resolves.toBeUndefined();
    });

    it('should unsubscribe from WebSocket updates', () => {
      uploadService.unsubscribeFromRealTimeUpdates();

      expect(mockStrandsApi.disconnectWebSocket).toHaveBeenCalled();
    });
  });

  describe('Event Handlers', () => {
    it('should call event handlers for upload events', async () => {
      const onComplete = vi.fn();
      const onError = vi.fn();
      const onProgress = vi.fn();

      uploadService.setEventHandlers({
        onComplete,
        onError,
        onProgress,
      });

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      mockStrandsApi.uploadDocument.mockImplementationOnce(
        (file: File, onProgress: (progress: number) => void) => {
          onProgress(100);
          return Promise.resolve({
            success: true,
            data: {
              id: 'upload-123',
              filename: 'test.pdf',
              fileSize: file.size,
              mimeType: 'application/pdf',
              status: 'completed',
              progress: 100,
              startedAt: new Date().toISOString(),
            },
          });
        }
      );

      await uploadService.uploadDocument(file);

      expect(onProgress).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
