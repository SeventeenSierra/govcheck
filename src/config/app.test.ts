// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { describe, expect, it } from 'vitest';
import {
  analysisConfig,
  apiConfig,
  errorConfig,
  featureFlags,
  uiConfig,
  uploadConfig,
  validationConfig,
} from './app';

describe('Application Configuration', () => {
  describe('uploadConfig', () => {
    it('should have correct PDF acceptance configuration', () => {
      expect(uploadConfig.acceptedTypes).toContain('application/pdf');
      expect(uploadConfig.maxFileSize).toBe(100 * 1024 * 1024); // 100MB
      expect(uploadConfig.minFileSize).toBe(1024); // 1KB
    });

    it('should have reasonable upload settings', () => {
      expect(uploadConfig.chunkSize).toBeGreaterThan(0);
      expect(uploadConfig.maxConcurrentUploads).toBe(1);
      expect(uploadConfig.uploadTimeout).toBeGreaterThan(0);
    });
  });

  describe('analysisConfig', () => {
    it('should have FAR/DFARS framework support', () => {
      expect(analysisConfig.frameworks).toContain('FAR');
      expect(analysisConfig.frameworks).toContain('DFARS');
    });

    it('should have reasonable timeout and retry settings', () => {
      expect(analysisConfig.analysisTimeout).toBeGreaterThan(0);
      expect(analysisConfig.maxRetryAttempts).toBeGreaterThan(0);
      expect(analysisConfig.retryDelay).toBeGreaterThan(0);
    });
  });

  describe('uiConfig', () => {
    it('should meet 5-second load time requirement', () => {
      expect(uiConfig.loadTimeTarget).toBe(5000); // 5 seconds
    });

    it('should have responsive breakpoints', () => {
      expect(uiConfig.breakpoints.mobile).toBeLessThan(uiConfig.breakpoints.tablet);
      expect(uiConfig.breakpoints.tablet).toBeLessThan(uiConfig.breakpoints.desktop);
    });

    it('should have reasonable UI timing settings', () => {
      expect(uiConfig.transitionDuration).toBeGreaterThan(0);
      expect(uiConfig.progressUpdateFrequency).toBeGreaterThan(0);
      expect(uiConfig.notificationTimeout).toBeGreaterThan(0);
    });
  });

  describe('apiConfig', () => {
    it('should have correct service URLs', () => {
      if (typeof window !== 'undefined') {
        // In browser/jsdom, default is empty string (relative path)
        expect(apiConfig.strandsBaseUrl).toBe('');
      } else {
        expect(apiConfig.strandsBaseUrl).toContain('8080');
      }
    });

    it('should have reasonable timeout and retry settings', () => {
      expect(apiConfig.requestTimeout).toBeGreaterThan(0);
      expect(apiConfig.maxRetries).toBeGreaterThan(0);
      expect(apiConfig.retryDelay).toBeGreaterThan(0);
    });

    it('should have WebSocket configuration', () => {
      expect(apiConfig.websocket.reconnectInterval).toBeGreaterThan(0);
      expect(apiConfig.websocket.maxReconnectAttempts).toBeGreaterThan(0);
    });
  });

  describe('validationConfig', () => {
    it('should have filename validation rules', () => {
      expect(validationConfig.maxFilenameLength).toBeGreaterThan(0);
      expect(validationConfig.filenamePattern).toBeInstanceOf(RegExp);
    });

    it('should validate valid filenames', () => {
      expect(validationConfig.filenamePattern.test('proposal.pdf')).toBe(true);
      expect(validationConfig.filenamePattern.test('test-file_v1.pdf')).toBe(true);
    });

    it('should reject invalid filenames', () => {
      expect(validationConfig.filenamePattern.test('file/with/slash.pdf')).toBe(false);
      expect(validationConfig.filenamePattern.test('file with spaces.pdf')).toBe(false);
    });
  });

  describe('errorConfig', () => {
    it('should have error codes defined', () => {
      expect(errorConfig.codes.UPLOAD_FAILED).toBeDefined();
      expect(errorConfig.codes.ANALYSIS_FAILED).toBeDefined();
      expect(errorConfig.codes.VALIDATION_FAILED).toBeDefined();
      expect(errorConfig.codes.NETWORK_ERROR).toBeDefined();
      expect(errorConfig.codes.TIMEOUT_ERROR).toBeDefined();
    });

    it('should have recovery settings', () => {
      expect(errorConfig.recovery.autoRetry).toBeDefined();
      expect(errorConfig.recovery.maxAutoRetries).toBeGreaterThan(0);
      expect(errorConfig.recovery.retryDelay).toBeGreaterThan(0);
    });
  });

  describe('featureFlags', () => {
    it('should have boolean feature flags', () => {
      expect(typeof featureFlags.enableDetailedLogging).toBe('boolean');
      expect(typeof featureFlags.enablePerformanceMonitoring).toBe('boolean');
      expect(typeof featureFlags.enableErrorReporting).toBe('boolean');
      expect(typeof featureFlags.enableAdvancedAnalysis).toBe('boolean');
      expect(typeof featureFlags.enableRealTimeUpdates).toBe('boolean');
    });
  });
});
