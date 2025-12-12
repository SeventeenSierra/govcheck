/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mockApiServer } from '@/services/mock-api-server';
import { apiConfiguration, ApiConfigUtils, apiConfigManager } from '@/config/api-config';

/**
 * Framework Independence Tests
 * 
 * Tests that verify the API can work independently of any specific
 * framework and can be configured for different deployment scenarios.
 */

describe('Framework Independence', () => {
  beforeEach(() => {
    // Reset configuration before each test
    apiConfigManager.reset();
  });

  describe('Mock API Server', () => {
    it('should handle document upload without framework dependencies', async () => {
      const file = new File(['%PDF-1.4 test content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const result = await mockApiServer.handleDocumentUpload(file);

      expect(result.success).toBe(true);
      expect(result.data?.filename).toBe('test.pdf');
      expect(result.data?.fileSize).toBe(file.size);
      expect(result.data?.mimeType).toBe('application/pdf');
      expect(result.data?.status).toBe('completed');
    });

    it('should handle analysis start without framework dependencies', async () => {
      const proposalId = 'test-proposal-123';

      const result = await mockApiServer.handleAnalysisStart(proposalId);

      expect(result.success).toBe(true);
      expect(result.data?.proposalId).toBe(proposalId);
      expect(result.data?.status).toBe('analyzing');
      expect(result.data?.progress).toBe(0);
    });

    it('should handle analysis results without framework dependencies', async () => {
      const sessionId = 'test-session-456';

      const result = await mockApiServer.handleAnalysisResults(sessionId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(sessionId);
      expect(result.data?.status).toMatch(/^(pass|fail|warning)$/);
      expect(result.data?.summary).toBeDefined();
    });

    it('should validate file types consistently', async () => {
      const invalidFile = new File(['test content'], 'document.txt', {
        type: 'text/plain'
      });

      const result = await mockApiServer.handleDocumentUpload(invalidFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Only PDF files are accepted');
      expect(result.code).toBe('INVALID_FILE_TYPE');
    });

    it('should validate file sizes consistently', async () => {
      const largeFile = new File(['content'], 'large.pdf', {
        type: 'application/pdf'
      });
      
      // Mock large file size
      Object.defineProperty(largeFile, 'size', {
        value: 150 * 1024 * 1024, // 150MB
        writable: false
      });

      const result = await mockApiServer.handleDocumentUpload(largeFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File size exceeds 100MB limit');
      expect(result.code).toBe('FILE_TOO_LARGE');
    });
  });

  describe('API Configuration', () => {
    it('should provide default configuration', () => {
      const config = apiConfiguration;

      expect(config.baseUrl).toBeDefined();
      expect(config.endpoints).toBeDefined();
      expect(config.timeout).toBeGreaterThan(0);
      expect(config.retries).toBeGreaterThan(0);
    });

    it('should configure for Next.js', () => {
      ApiConfigUtils.configureForNextJs(3000);
      const config = apiConfigManager.getConfiguration();

      expect(config.baseUrl).toBe('http://localhost:3000');
      expect(config.useMock).toBe(true);
    });

    it('should configure for Express', () => {
      ApiConfigUtils.configureForExpress(8080);
      const config = apiConfigManager.getConfiguration();

      expect(config.baseUrl).toBe('http://localhost:8080');
      expect(config.useMock).toBe(false);
    });

    it('should configure for standalone mock server', () => {
      ApiConfigUtils.configureForStandaloneMock(8081);
      const config = apiConfigManager.getConfiguration();

      expect(config.baseUrl).toBe('http://localhost:8081');
      expect(config.useMock).toBe(true);
    });

    it('should configure for production', () => {
      const productionUrl = 'https://api.example.com';
      ApiConfigUtils.configureForProduction(productionUrl);
      const config = apiConfigManager.getConfiguration();

      expect(config.baseUrl).toBe(productionUrl);
      expect(config.useMock).toBe(false);
      expect(config.timeout).toBe(60000); // Longer timeout for production
      expect(config.retries).toBe(5); // More retries for production
    });

    it('should notify listeners of configuration changes', () => {
      let notificationCount = 0;
      let lastConfig: any = null;

      const unsubscribe = apiConfigManager.subscribe((config) => {
        notificationCount++;
        lastConfig = config;
      });

      ApiConfigUtils.configureForExpress(8080);

      expect(notificationCount).toBe(1);
      expect(lastConfig?.baseUrl).toBe('http://localhost:8080');

      unsubscribe();
    });
  });

  describe('Error Handling Consistency', () => {
    it('should return consistent error format for missing files', async () => {
      // Simulate missing file scenario
      const result = await mockApiServer.handleDocumentUpload(null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.code).toBeDefined();
    });

    it('should return consistent error format for missing proposal ID', async () => {
      const result = await mockApiServer.handleAnalysisStart('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Proposal ID is required');
      expect(result.code).toBe('MISSING_PROPOSAL_ID');
    });

    it('should return consistent error format for missing session ID', async () => {
      const result = await mockApiServer.handleAnalysisResults('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Session ID is required');
      expect(result.code).toBe('MISSING_SESSION_ID');
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent success response format', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = await mockApiServer.handleDocumentUpload(file);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result).not.toHaveProperty('error');
      expect(result).not.toHaveProperty('code');
    });

    it('should return consistent error response format', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await mockApiServer.handleDocumentUpload(invalidFile);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('code');
      expect(result).not.toHaveProperty('data');
    });
  });

  describe('Health Check', () => {
    it('should provide health check without framework dependencies', async () => {
      const result = await mockApiServer.handleHealthCheck();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.version).toBeDefined();
      expect(result.data?.timestamp).toBeDefined();
    });
  });

  describe('Issue Details', () => {
    it('should handle issue details requests', async () => {
      const issueId = 'test-issue-123';
      const result = await mockApiServer.handleIssueDetails(issueId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(issueId);
      expect(result.data?.severity).toMatch(/^(critical|warning|info)$/);
      expect(result.data?.title).toBeDefined();
      expect(result.data?.description).toBeDefined();
      expect(result.data?.regulation).toBeDefined();
    });

    it('should validate issue ID requirement', async () => {
      const result = await mockApiServer.handleIssueDetails('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Issue ID is required');
      expect(result.code).toBe('MISSING_ISSUE_ID');
    });
  });

  describe('Status Endpoints', () => {
    it('should handle upload status requests', async () => {
      const sessionId = 'test-upload-session';
      const result = await mockApiServer.handleUploadStatus(sessionId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(sessionId);
      expect(result.data?.status).toBe('completed');
      expect(result.data?.progress).toBe(100);
    });

    it('should handle analysis status requests', async () => {
      const sessionId = 'test-analysis-session';
      const result = await mockApiServer.handleAnalysisStatus(sessionId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(sessionId);
      expect(result.data?.status).toBe('completed');
      expect(result.data?.progress).toBe(100);
    });
  });
});

/**
 * Integration Test for Framework Independence
 */
describe('Framework Independence Integration', () => {
  it('should work with different configuration scenarios', async () => {
    // Test Next.js configuration
    ApiConfigUtils.configureForNextJs(3000);
    let config = apiConfigManager.getConfiguration();
    expect(config.baseUrl).toBe('http://localhost:3000');

    // Test Express configuration  
    ApiConfigUtils.configureForExpress(8080);
    config = apiConfigManager.getConfiguration();
    expect(config.baseUrl).toBe('http://localhost:8080');

    // Test standalone configuration
    ApiConfigUtils.configureForStandaloneMock(8081);
    config = apiConfigManager.getConfiguration();
    expect(config.baseUrl).toBe('http://localhost:8081');

    // Business logic should work the same regardless of configuration
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = await mockApiServer.handleDocumentUpload(file);
    expect(result.success).toBe(true);
  });

  it('should maintain API contract across all configurations', async () => {
    const testScenarios = [
      () => ApiConfigUtils.configureForNextJs(3000),
      () => ApiConfigUtils.configureForExpress(8080),
      () => ApiConfigUtils.configureForStandaloneMock(8081),
    ];

    for (const configureScenario of testScenarios) {
      configureScenario();

      // Test upload
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const uploadResult = await mockApiServer.handleDocumentUpload(file);
      expect(uploadResult.success).toBe(true);

      // Test analysis
      const analysisResult = await mockApiServer.handleAnalysisStart('test-proposal');
      expect(analysisResult.success).toBe(true);

      // Test results
      const resultsResult = await mockApiServer.handleAnalysisResults('test-session');
      expect(resultsResult.success).toBe(true);
    }
  }, 10000); // 10 second timeout
});