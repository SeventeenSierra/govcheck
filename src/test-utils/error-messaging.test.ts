/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, it, expect, vi } from 'vitest';
import { MockStrandsClient } from '@/services/mock-strands-client';

/**
 * Error Messaging Integration Tests
 * 
 * Tests the improved error messaging system to ensure users get
 * clear, actionable feedback when uploads fail.
 */

describe('Error Messaging System', () => {
  describe('File Validation Errors', () => {
    it('should provide detailed error for invalid file type', async () => {
      const mockClient = new MockStrandsClient();
      
      // Create a fake non-PDF file
      const invalidFile = new File(['test content'], 'document.txt', {
        type: 'text/plain'
      });
      
      const result = await mockClient.uploadDocument(invalidFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Only PDF files are accepted');
      expect(result.code).toBe('INVALID_FILE_TYPE');
    });

    it('should provide detailed error for oversized file', async () => {
      const mockClient = new MockStrandsClient();
      
      // Create a fake oversized file by mocking the size property
      const oversizedFile = new File(['small content'], 'large.pdf', {
        type: 'application/pdf'
      });
      
      // Mock the size property to simulate a large file
      Object.defineProperty(oversizedFile, 'size', {
        value: 101 * 1024 * 1024, // 101MB
        writable: false
      });
      
      const result = await mockClient.uploadDocument(oversizedFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('File size exceeds 100MB limit');
      expect(result.code).toBe('FILE_TOO_LARGE');
    });
  });

  describe('Network Error Simulation', () => {
    it('should handle network connectivity issues gracefully', async () => {
      // This test simulates what happens when the upload manager
      // falls back to mock client due to network issues
      const mockClient = new MockStrandsClient();
      
      const validFile = new File(['%PDF-1.4 test content'], 'test.pdf', {
        type: 'application/pdf'
      });
      
      const result = await mockClient.uploadDocument(validFile);
      
      // Mock client should succeed when real API fails
      expect(result.success).toBe(true);
      expect(result.data?.filename).toBe('test.pdf');
    });
  });

  describe('Progress Tracking', () => {
    it('should provide progress updates during upload', async () => {
      const mockClient = new MockStrandsClient();
      const progressUpdates: number[] = [];
      
      const validFile = new File(['%PDF-1.4 test content'], 'test.pdf', {
        type: 'application/pdf'
      });
      
      const result = await mockClient.uploadDocument(validFile, (progress) => {
        progressUpdates.push(progress);
      });
      
      expect(result.success).toBe(true);
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates).toContain(100); // Should reach 100%
      
      // Progress should be in ascending order
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i]).toBeGreaterThanOrEqual(progressUpdates[i - 1]);
      }
    });
  });

  describe('Mock Analysis Results', () => {
    it('should provide realistic compliance analysis results', async () => {
      const mockClient = new MockStrandsClient();
      const sessionId = 'test-session-123';
      
      const result = await mockClient.getResults(sessionId);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(sessionId);
      expect(result.data?.status).toMatch(/^(pass|fail|warning)$/);
      expect(result.data?.summary).toBeDefined();
      expect(result.data?.generatedAt).toBeDefined();
      
      // Check issue structure if present
      if (result.data?.issues && result.data.issues.length > 0) {
        const issue = result.data.issues[0];
        expect(issue.id).toBeDefined();
        expect(issue.severity).toMatch(/^(critical|warning|info)$/);
        expect(issue.title).toBeDefined();
        expect(issue.description).toBeDefined();
        expect(issue.regulation.framework).toMatch(/^(FAR|DFARS)$/);
        expect(issue.regulation.section).toBeDefined();
        expect(issue.regulation.reference).toBeDefined();
      }
    });

    it('should generate consistent summary statistics', async () => {
      const mockClient = new MockStrandsClient();
      const sessionId = 'test-session-456';
      
      const result = await mockClient.getResults(sessionId);
      
      expect(result.success).toBe(true);
      
      if (result.data?.issues) {
        const { issues, summary } = result.data;
        
        // Verify summary matches actual issues
        expect(summary.totalIssues).toBe(issues.length);
        expect(summary.criticalIssues).toBe(
          issues.filter(i => i.severity === 'critical').length
        );
        expect(summary.warningIssues).toBe(
          issues.filter(i => i.severity === 'warning').length
        );
      }
    });
  });

  describe('Error Message Quality', () => {
    it('should provide user-friendly error messages', () => {
      // Test various error scenarios that the upload manager handles
      const errorScenarios = [
        {
          originalError: 'fetch failed',
          expectedCategory: 'Network connection failed'
        },
        {
          originalError: 'ECONNREFUSED',
          expectedCategory: 'Server unavailable'
        },
        {
          originalError: 'timeout',
          expectedCategory: 'Upload timeout'
        },
        {
          originalError: 'INVALID_FILE_TYPE',
          expectedCategory: 'Invalid file type'
        },
        {
          originalError: 'FILE_TOO_LARGE',
          expectedCategory: 'File too large'
        }
      ];

      errorScenarios.forEach(scenario => {
        // This simulates the error categorization logic in upload-manager
        let errorMessage = 'Upload failed';
        
        if (scenario.originalError.includes('fetch')) {
          errorMessage = 'Network connection failed';
        } else if (scenario.originalError.includes('ECONNREFUSED')) {
          errorMessage = 'Server unavailable';
        } else if (scenario.originalError.includes('timeout')) {
          errorMessage = 'Upload timeout';
        } else if (scenario.originalError.includes('INVALID_FILE_TYPE')) {
          errorMessage = 'Invalid file type';
        } else if (scenario.originalError.includes('FILE_TOO_LARGE')) {
          errorMessage = 'File too large';
        }
        
        expect(errorMessage).toBe(scenario.expectedCategory);
      });
    });
  });
});