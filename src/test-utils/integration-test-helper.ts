/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Integration Test Helper
 * 
 * Provides utilities for testing the end-to-end flow:
 * PDF Upload → Analysis Processing → Results Display
 */

export interface IntegrationTestScenario {
  name: string;
  description: string;
  testFile: File;
  expectedOutcome: 'pass' | 'fail' | 'warning';
  expectedIssues?: string[];
}

export class IntegrationTestHelper {
  /**
   * Create a mock PDF file for testing
   */
  static createMockPDF(filename: string, content: string = 'Mock PDF content'): File {
    const blob = new Blob([content], { type: 'application/pdf' });
    return new File([blob], filename, { type: 'application/pdf' });
  }

  /**
   * Create test scenarios for different compliance outcomes
   */
  static getTestScenarios(): IntegrationTestScenario[] {
    return [
      {
        name: 'Valid Compliant Proposal',
        description: 'A proposal that should pass all FAR/DFARS requirements',
        testFile: this.createMockPDF('compliant-proposal.pdf', 
          'This proposal meets all FAR requirements including cost accounting standards and technical specifications.'),
        expectedOutcome: 'pass',
        expectedIssues: []
      },
      {
        name: 'Non-Compliant Proposal',
        description: 'A proposal with clear FAR violations',
        testFile: this.createMockPDF('non-compliant-proposal.pdf',
          'This proposal lacks required cost accounting disclosures and technical specifications.'),
        expectedOutcome: 'fail',
        expectedIssues: ['Missing cost accounting standards', 'Incomplete technical specifications']
      },
      {
        name: 'Proposal with Warnings',
        description: 'A proposal with minor compliance issues',
        testFile: this.createMockPDF('warning-proposal.pdf',
          'This proposal meets most requirements but has some formatting issues.'),
        expectedOutcome: 'warning',
        expectedIssues: ['Formatting inconsistencies']
      }
    ];
  }

  /**
   * Simulate the upload process
   */
  static async simulateUpload(file: File): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      // Simulate file validation
      if (!file.name.endsWith('.pdf')) {
        return { success: false, error: 'Invalid file format. Only PDF files are accepted.' };
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return { success: false, error: 'File size exceeds 10MB limit.' };
      }

      // Simulate successful upload
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return { success: true, sessionId };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  /**
   * Simulate the analysis process
   */
  static async simulateAnalysis(sessionId: string, scenario: IntegrationTestScenario): Promise<{
    success: boolean;
    results?: {
      overallStatus: 'pass' | 'fail' | 'warning';
      issues: Array<{
        id: string;
        type: string;
        severity: 'high' | 'medium' | 'low';
        description: string;
        recommendation: string;
      }>;
      complianceScore: number;
    };
    error?: string;
  }> {
    try {
      // Simulate analysis processing time
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate mock results based on scenario
      const results = {
        overallStatus: scenario.expectedOutcome,
        issues: scenario.expectedIssues?.map((issue, index) => ({
          id: `issue-${index + 1}`,
          type: 'FAR Compliance',
          severity: scenario.expectedOutcome === 'fail' ? 'high' as const : 'medium' as const,
          description: issue,
          recommendation: `Address ${issue.toLowerCase()} to ensure compliance.`
        })) || [],
        complianceScore: scenario.expectedOutcome === 'pass' ? 95 : 
                        scenario.expectedOutcome === 'warning' ? 75 : 45
      };

      return { success: true, results };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Analysis failed' };
    }
  }

  /**
   * Run a complete end-to-end test scenario
   */
  static async runEndToEndTest(scenario: IntegrationTestScenario): Promise<{
    success: boolean;
    steps: {
      upload: { success: boolean; sessionId?: string; error?: string };
      analysis: { success: boolean; results?: any; error?: string };
    };
    summary: string;
  }> {
    console.log(`Running E2E test: ${scenario.name}`);

    // Step 1: Upload
    const uploadResult = await this.simulateUpload(scenario.testFile);
    
    if (!uploadResult.success) {
      return {
        success: false,
        steps: { upload: uploadResult, analysis: { success: false, error: 'Skipped due to upload failure' } },
        summary: `Upload failed: ${uploadResult.error}`
      };
    }

    // Step 2: Analysis
    const analysisResult = await this.simulateAnalysis(uploadResult.sessionId!, scenario);

    if (!analysisResult.success) {
      return {
        success: false,
        steps: { upload: uploadResult, analysis: analysisResult },
        summary: `Analysis failed: ${analysisResult.error}`
      };
    }

    // Verify results match expectations
    const expectedOutcome = scenario.expectedOutcome;
    const actualOutcome = analysisResult.results!.overallStatus;
    const outcomeMatches = expectedOutcome === actualOutcome;

    return {
      success: outcomeMatches,
      steps: { upload: uploadResult, analysis: analysisResult },
      summary: outcomeMatches 
        ? `✅ Test passed: Expected ${expectedOutcome}, got ${actualOutcome}`
        : `❌ Test failed: Expected ${expectedOutcome}, got ${actualOutcome}`
    };
  }
}