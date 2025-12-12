// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { describe, expect, it } from 'vitest';
import { AnalysisStatus, UploadStatus, ViewType } from '../types/app';
import { createMockAnalysisSession, createMockUIState, createMockUploadSession } from './index';

describe('Test Utilities', () => {
  describe('createMockUploadSession', () => {
    it('should create a valid mock upload session', () => {
      const session = createMockUploadSession();

      expect(session.id).toBe('test-upload-123');
      expect(session.filename).toBe('test-proposal.pdf');
      expect(session.fileSize).toBe(1024 * 1024);
      expect(session.mimeType).toBe('application/pdf');
      expect(session.status).toBe('pending');
      expect(session.progress).toBe(0);
      expect(session.startedAt).toBeInstanceOf(Date);
    });

    it('should accept overrides', () => {
      const session = createMockUploadSession({
        filename: 'custom.pdf',
        status: UploadStatus.COMPLETED,
        progress: 100,
      });

      expect(session.filename).toBe('custom.pdf');
      expect(session.status).toBe(UploadStatus.COMPLETED);
      expect(session.progress).toBe(100);
    });
  });

  describe('createMockAnalysisSession', () => {
    it('should create a valid mock analysis session', () => {
      const session = createMockAnalysisSession();

      expect(session.id).toBe('test-analysis-456');
      expect(session.proposalId).toBe('test-proposal-789');
      expect(session.status).toBe('queued');
      expect(session.progress).toBe(0);
      expect(session.startedAt).toBeInstanceOf(Date);
      expect(session.currentStep).toBe('Initializing analysis');
    });

    it('should accept overrides', () => {
      const session = createMockAnalysisSession({
        status: AnalysisStatus.ANALYZING,
        progress: 50,
        currentStep: 'Processing document',
      });

      expect(session.status).toBe(AnalysisStatus.ANALYZING);
      expect(session.progress).toBe(50);
      expect(session.currentStep).toBe('Processing document');
    });
  });

  describe('createMockUIState', () => {
    it('should create a valid mock UI state', () => {
      const state = createMockUIState();

      expect(state.currentView).toBe('dashboard');
      expect(state.navigationHistory).toEqual(['/dashboard']);
      expect(state.notifications).toEqual([]);
      expect(state.preferences.theme).toBe('system');
      expect(state.preferences.showDetailedProgress).toBe(true);
    });

    it('should accept overrides', () => {
      const state = createMockUIState({
        currentView: ViewType.UPLOAD,
        navigationHistory: ['/dashboard', '/upload'],
      });

      expect(state.currentView).toBe(ViewType.UPLOAD);
      expect(state.navigationHistory).toEqual(['/dashboard', '/upload']);
    });
  });
});
