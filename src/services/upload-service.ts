// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Upload Service
 *
 * Service layer for managing document uploads and integrating with the Strands API.
 * Provides upload session management, progress tracking, and error handling.
 * Implements requirements 1.1, 1.2, 1.3, 1.4, and 1.5 for upload functionality.
 */

import { errorConfig, uploadConfig } from '../config/app';
import { type UploadSession, UploadStatus } from '../types/app';
import { strandsApiClient, type UploadSessionResponse } from './strands-api-client';

/**
 * Upload service events
 */
export interface UploadServiceEvents {
  onProgress: (sessionId: string, progress: number) => void;
  onComplete: (sessionId: string, session: UploadSession) => void;
  onError: (sessionId: string, error: string) => void;
}

/**
 * Upload Service Class
 *
 * Manages document uploads with the Strands API, providing session tracking,
 * progress monitoring, and error handling capabilities.
 */
export class UploadService {
  private activeSessions = new Map<string, UploadSession>();
  private eventHandlers: Partial<UploadServiceEvents> = {};

  /**
   * Set event handlers for upload events
   */
  setEventHandlers(handlers: Partial<UploadServiceEvents>) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Upload a document file
   * Requirement 1.1: Accept PDF format files
   * Requirement 1.5: Show upload progress and status
   */
  async uploadDocument(
    file: File,
    sessionId?: string
  ): Promise<{ success: boolean; sessionId: string; error?: string }> {
    // Create or update session
    const session: UploadSession =
      sessionId && this.activeSessions.has(sessionId)
        ? { ...this.activeSessions.get(sessionId)!, status: UploadStatus.UPLOADING }
        : {
            id: sessionId || `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            filename: file.name,
            fileSize: file.size,
            mimeType: file.type,
            status: UploadStatus.UPLOADING,
            progress: 0,
            startedAt: new Date(),
          };

    this.activeSessions.set(session.id, session);

    try {
      // Upload file with progress tracking
      const response = await strandsApiClient.uploadDocument(file, (progress) => {
        const updatedSession = { ...session, progress };
        this.activeSessions.set(session.id, updatedSession);
        this.eventHandlers.onProgress?.(session.id, progress);
      });

      if (response.success && response.data) {
        // Update session with server response
        const completedSession: UploadSession = {
          ...session,
          id: response.data.id, // Use server-generated ID
          status: UploadStatus.COMPLETED,
          progress: 100,
          completedAt: new Date(),
        };

        this.activeSessions.set(completedSession.id, completedSession);
        this.eventHandlers.onComplete?.(completedSession.id, completedSession);

        return { success: true, sessionId: completedSession.id };
      } else {
        const error = response.error || 'Upload failed';
        const failedSession = {
          ...session,
          status: UploadStatus.FAILED,
          errorMessage: error,
        };
        this.activeSessions.set(session.id, failedSession);
        this.eventHandlers.onError?.(session.id, error);

        return { success: false, sessionId: session.id, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      const failedSession = {
        ...session,
        status: UploadStatus.FAILED,
        errorMessage,
      };
      this.activeSessions.set(session.id, failedSession);
      this.eventHandlers.onError?.(session.id, errorMessage);

      return { success: false, sessionId: session.id, error: errorMessage };
    }
  }

  /**
   * Get upload session status
   * Requirement 1.5: Show upload progress and status
   */
  async getUploadStatus(sessionId: string): Promise<UploadSession | null> {
    // Check local session first
    const localSession = this.activeSessions.get(sessionId);
    if (localSession && localSession.status !== UploadStatus.COMPLETED) {
      return localSession;
    }

    // Query server for completed sessions
    try {
      const response = await strandsApiClient.getUploadStatus(sessionId);
      if (response.success && response.data) {
        const session = this.mapApiResponseToSession(response.data);
        this.activeSessions.set(sessionId, session);
        return session;
      }
    } catch (error) {
      console.error('Failed to get upload status:', error);
    }

    return localSession || null;
  }

  /**
   * Get all active upload sessions
   */
  getActiveSessions(): UploadSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Cancel an upload session
   */
  cancelUpload(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === UploadStatus.UPLOADING) {
      const cancelledSession = {
        ...session,
        status: UploadStatus.FAILED,
        errorMessage: 'Upload cancelled by user',
      };
      this.activeSessions.set(sessionId, cancelledSession);
      return true;
    }
    return false;
  }

  /**
   * Clear completed or failed sessions
   */
  clearSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (
      session &&
      (session.status === UploadStatus.COMPLETED || session.status === UploadStatus.FAILED)
    ) {
      this.activeSessions.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.activeSessions.clear();
  }

  /**
   * Validate file before upload
   * Requirement 1.1: PDF format validation
   * Requirement 1.2: File size validation
   */
  validateFile(file: File): { isValid: boolean; error?: string; errorCode?: string } {
    // Check file type (requirement 1.1: PDF format only)
    if (!uploadConfig.acceptedTypes.includes(file.type as any)) {
      return {
        isValid: false,
        error: 'Only PDF files are accepted for upload.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    // Check file size limits (requirement 1.2)
    if (file.size > uploadConfig.maxFileSize) {
      const maxSizeMB = Math.round(uploadConfig.maxFileSize / (1024 * 1024));
      return {
        isValid: false,
        error: `File size exceeds the maximum limit of ${maxSizeMB}MB.`,
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    if (file.size < uploadConfig.minFileSize) {
      return {
        isValid: false,
        error: 'File is too small. Please select a valid PDF document.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    // Check filename validity
    if (file.name.length > 255) {
      return {
        isValid: false,
        error: 'Filename is too long. Maximum 255 characters allowed.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    return { isValid: true };
  }

  /**
   * Map API response to internal session format
   */
  private mapApiResponseToSession(apiResponse: UploadSessionResponse): UploadSession {
    return {
      id: apiResponse.id,
      filename: apiResponse.filename,
      fileSize: apiResponse.fileSize,
      mimeType: apiResponse.mimeType,
      status: this.mapApiStatusToLocal(apiResponse.status),
      progress: apiResponse.progress,
      startedAt: new Date(apiResponse.startedAt),
      completedAt: apiResponse.completedAt ? new Date(apiResponse.completedAt) : undefined,
      errorMessage: apiResponse.errorMessage,
    };
  }

  /**
   * Map API status to local status enum
   */
  private mapApiStatusToLocal(apiStatus: string): UploadStatus {
    switch (apiStatus) {
      case 'pending':
        return UploadStatus.PENDING;
      case 'uploading':
        return UploadStatus.UPLOADING;
      case 'processing':
        return UploadStatus.PROCESSING;
      case 'completed':
        return UploadStatus.COMPLETED;
      case 'failed':
        return UploadStatus.FAILED;
      default:
        return UploadStatus.PENDING;
    }
  }

  /**
   * Subscribe to real-time upload progress updates via WebSocket
   */
  async subscribeToRealTimeUpdates(): Promise<void> {
    try {
      await strandsApiClient.connectWebSocket();

      strandsApiClient.subscribeToUploadProgress((message) => {
        const sessionId = message.sessionId;
        const session = this.activeSessions.get(sessionId);

        if (session && message.data.progress !== undefined) {
          const updatedSession = { ...session, progress: message.data.progress };
          this.activeSessions.set(sessionId, updatedSession);
          this.eventHandlers.onProgress?.(sessionId, message.data.progress);
        }
      });
    } catch (error) {
      console.error('Failed to subscribe to real-time updates:', error);
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromRealTimeUpdates(): void {
    strandsApiClient.disconnectWebSocket();
  }
}

/**
 * Default upload service instance
 */
export const uploadService = new UploadService();
