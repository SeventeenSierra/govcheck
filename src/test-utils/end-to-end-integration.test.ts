/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, it, expect } from 'vitest';
import { IntegrationTestHelper } from './integration-test-helper';

/**
 * End-to-End Integration Tests
 *
 * Tests the complete workflow: PDF Upload → Analysis Processing → Results Display
 * Based on threshold design requirements for basic compliance checking.
 */

describe('End-to-End Integration Tests', () => {
  describe('Complete Workflow Testing', () => {
    it('should complete the full workflow for compliant proposals', async () => {
      const scenarios = IntegrationTestHelper.getTestScenarios();
      const compliantScenario = scenarios.find((s) => s.expectedOutcome === 'pass')!;

      const result = await IntegrationTestHelper.runEndToEndTest(compliantScenario);

      expect(result.success).toBe(true);
      expect(result.steps.upload.success).toBe(true);
      expect(result.steps.analysis.success).toBe(true);
      expect(result.steps.analysis.results?.overallStatus).toBe('pass');
      expect(result.steps.analysis.results?.complianceScore).toBeGreaterThan(90);

      console.log(result.summary);
    });

    it('should complete the full workflow for non-compliant proposals', async () => {
      const scenarios = IntegrationTestHelper.getTestScenarios();
      const nonCompliantScenario = scenarios.find((s) => s.expectedOutcome === 'fail')!;

      const result = await IntegrationTestHelper.runEndToEndTest(nonCompliantScenario);

      expect(result.success).toBe(true);
      expect(result.steps.upload.success).toBe(true);
      expect(result.steps.analysis.success).toBe(true);
      expect(result.steps.analysis.results?.overallStatus).toBe('fail');
      expect(result.steps.analysis.results?.complianceScore).toBeLessThan(50);
      expect(result.steps.analysis.results?.issues.length).toBeGreaterThan(0);

      console.log(result.summary);
    });

    it('should complete the full workflow for proposals with warnings', async () => {
      const scenarios = IntegrationTestHelper.getTestScenarios();
      const warningScenario = scenarios.find((s) => s.expectedOutcome === 'warning')!;

      const result = await IntegrationTestHelper.runEndToEndTest(warningScenario);

      expect(result.success).toBe(true);
      expect(result.steps.upload.success).toBe(true);
      expect(result.steps.analysis.success).toBe(true);
      expect(result.steps.analysis.results?.overallStatus).toBe('warning');
      expect(result.steps.analysis.results?.complianceScore).toBeGreaterThan(50);
      expect(result.steps.analysis.results?.complianceScore).toBeLessThan(90);

      console.log(result.summary);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid file formats gracefully', async () => {
      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });
      const uploadResult = await IntegrationTestHelper.simulateUpload(invalidFile);

      expect(uploadResult.success).toBe(false);
      expect(uploadResult.error).toContain('Invalid file format');
    });

    it('should handle oversized files gracefully', async () => {
      // Create a mock large file (simulate 15MB)
      const largeContent = 'x'.repeat(15 * 1024 * 1024);
      const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const uploadResult = await IntegrationTestHelper.simulateUpload(largeFile);

      expect(uploadResult.success).toBe(false);
      expect(uploadResult.error).toContain('File size exceeds');
    });
  });

  describe('Performance Integration', () => {
    it('should complete analysis within reasonable time', async () => {
      const scenarios = IntegrationTestHelper.getTestScenarios();
      const testScenario = scenarios[0];

      const startTime = Date.now();
      const result = await IntegrationTestHelper.runEndToEndTest(testScenario);
      const endTime = Date.now();

      const processingTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds

      console.log(`Processing completed in ${processingTime}ms`);
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain consistent session data throughout workflow', async () => {
      const scenarios = IntegrationTestHelper.getTestScenarios();
      const testScenario = scenarios[0];

      const uploadResult = await IntegrationTestHelper.simulateUpload(testScenario.testFile);
      expect(uploadResult.success).toBe(true);
      expect(uploadResult.sessionId).toBeDefined();

      const analysisResult = await IntegrationTestHelper.simulateAnalysis(
        uploadResult.sessionId!,
        testScenario
      );
      expect(analysisResult.success).toBe(true);
      expect(analysisResult.results).toBeDefined();

      // Verify session consistency
      expect(uploadResult.sessionId).toMatch(/^session-\d+-[a-z0-9]+$/);
    });
  });
});

/**
 * Integration Test Summary Runner
 *
 * Runs all scenarios and provides a comprehensive report
 */
describe('Integration Test Summary', () => {
  it('should run all test scenarios and provide summary report', async () => {
    const scenarios = IntegrationTestHelper.getTestScenarios();
    const results = [];

    console.log('\n=== INTEGRATION TEST SUMMARY ===');

    for (const scenario of scenarios) {
      const result = await IntegrationTestHelper.runEndToEndTest(scenario);
      results.push({ scenario: scenario.name, result });

      console.log(`${scenario.name}: ${result.summary}`);
    }

    const successCount = results.filter((r) => r.result.success).length;
    const totalCount = results.length;

    console.log(`\nOverall: ${successCount}/${totalCount} scenarios passed`);
    console.log('=== END SUMMARY ===\n');

    expect(successCount).toBe(totalCount);
  });
});
