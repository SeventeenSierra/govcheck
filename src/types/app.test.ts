// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { describe, expect, it } from 'vitest';
import {
  type AnalysisSession,
  AnalysisStatus,
  NotificationType,
  type UIState,
  type UploadSession,
  UploadStatus,
  ViewType,
} from './app';

describe('Application Types', () => {
  describe('UploadStatus enum', () => {
    it('should have all required status values', () => {
      expect(UploadStatus.PENDING).toBe('pending');
      expect(UploadStatus.UPLOADING).toBe('uploading');
      expect(UploadStatus.PROCESSING).toBe('processing');
      expect(UploadStatus.COMPLETED).toBe('completed');
      expect(UploadStatus.FAILED).toBe('failed');
    });
  });

  describe('AnalysisStatus enum', () => {
    it('should have all required status values', () => {
      expect(AnalysisStatus.QUEUED).toBe('queued');
      expect(AnalysisStatus.EXTRACTING).toBe('extracting');
      expect(AnalysisStatus.ANALYZING).toBe('analyzing');
      expect(AnalysisStatus.VALIDATING).toBe('validating');
      expect(AnalysisStatus.COMPLETED).toBe('completed');
      expect(AnalysisStatus.FAILED).toBe('failed');
    });
  });

  describe('ViewType enum', () => {
    it('should have all required view types', () => {
      expect(ViewType.DASHBOARD).toBe('dashboard');
      expect(ViewType.UPLOAD).toBe('upload');
      expect(ViewType.ANALYSIS).toBe('analysis');
      expect(ViewType.RESULTS).toBe('results');
      expect(ViewType.SETTINGS).toBe('settings');
    });
  });

  describe('NotificationType enum', () => {
    it('should have all required notification types', () => {
      expect(NotificationType.INFO).toBe('info');
      expect(NotificationType.SUCCESS).toBe('success');
      expect(NotificationType.WARNING).toBe('warning');
      expect(NotificationType.ERROR).toBe('error');
    });
  });

  describe('UploadSession interface', () => {
    it('should accept valid upload session data', () => {
      const uploadSession: UploadSession = {
        id: 'test-123',
        filename: 'proposal.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: UploadStatus.PENDING,
        progress: 0,
        startedAt: new Date(),
      };

      expect(uploadSession.id).toBe('test-123');
      expect(uploadSession.filename).toBe('proposal.pdf');
      expect(uploadSession.status).toBe(UploadStatus.PENDING);
    });
  });

  describe('AnalysisSession interface', () => {
    it('should accept valid analysis session data', () => {
      const analysisSession: AnalysisSession = {
        id: 'analysis-456',
        proposalId: 'proposal-789',
        status: AnalysisStatus.QUEUED,
        progress: 0,
        startedAt: new Date(),
        currentStep: 'Initializing',
      };

      expect(analysisSession.id).toBe('analysis-456');
      expect(analysisSession.proposalId).toBe('proposal-789');
      expect(analysisSession.status).toBe(AnalysisStatus.QUEUED);
    });
  });

  describe('UIState interface', () => {
    it('should accept valid UI state data', () => {
      const uiState: UIState = {
        currentView: ViewType.DASHBOARD,
        navigationHistory: ['/dashboard'],
        notifications: [],
        preferences: {
          theme: 'system',
          showDetailedProgress: true,
          autoDismissNotifications: true,
          notificationTimeout: 5000,
          showAdvancedOptions: false,
        },
      };

      expect(uiState.currentView).toBe(ViewType.DASHBOARD);
      expect(uiState.navigationHistory).toEqual(['/dashboard']);
      expect(uiState.preferences.theme).toBe('system');
    });
  });
});
