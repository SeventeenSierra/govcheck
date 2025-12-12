/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Error Messaging Demo
 * 
 * Demonstrates the improved error messaging system for upload failures.
 * This shows how users will see clear, actionable error messages.
 */

import { MockStrandsClient } from '@/services/mock-strands-client';

export class ErrorMessagingDemo {
  private mockClient = new MockStrandsClient();

  /**
   * Demonstrate various error scenarios with improved messaging
   */
  async demonstrateErrorScenarios(): Promise<void> {
    console.log('\n=== ERROR MESSAGING DEMONSTRATION ===\n');

    // 1. Invalid file type error
    console.log('1. Invalid File Type Error:');
    const textFile = new File(['Some text content'], 'document.txt', {
      type: 'text/plain'
    });
    
    const textResult = await this.mockClient.uploadDocument(textFile);
    console.log(`   ❌ ${textResult.error} (Code: ${textResult.code})`);
    console.log('   💡 User sees: Clear message about PDF requirement\n');

    // 2. File too large error
    console.log('2. File Size Error:');
    const largeFile = new File(['content'], 'huge.pdf', {
      type: 'application/pdf'
    });
    Object.defineProperty(largeFile, 'size', {
      value: 150 * 1024 * 1024, // 150MB
      writable: false
    });
    
    const sizeResult = await this.mockClient.uploadDocument(largeFile);
    console.log(`   ❌ ${sizeResult.error} (Code: ${sizeResult.code})`);
    console.log('   💡 User sees: Specific size limit and current file size\n');

    // 3. Successful upload with progress
    console.log('3. Successful Upload with Progress:');
    const validFile = new File(['%PDF-1.4 valid content'], 'proposal.pdf', {
      type: 'application/pdf'
    });
    
    const progressUpdates: number[] = [];
    const successResult = await this.mockClient.uploadDocument(validFile, (progress) => {
      progressUpdates.push(progress);
    });
    
    console.log(`   ✅ Upload successful: ${successResult.data?.filename}`);
    console.log(`   📊 Progress updates: ${progressUpdates.join('% → ')}%`);
    console.log('   💡 User sees: Real-time progress feedback\n');

    // 4. Analysis results with issues
    console.log('4. Analysis Results:');
    const analysisResult = await this.mockClient.getResults('demo-session');
    
    if (analysisResult.success && analysisResult.data) {
      const { status, issues, summary } = analysisResult.data;
      console.log(`   📋 Status: ${status.toUpperCase()}`);
      console.log(`   📊 Summary: ${summary.totalIssues} total issues`);
      console.log(`       - Critical: ${summary.criticalIssues}`);
      console.log(`       - Warning: ${summary.warningIssues}`);
      
      if (issues.length > 0) {
        console.log('   🔍 Sample Issue:');
        const issue = issues[0];
        console.log(`       Title: ${issue.title}`);
        console.log(`       Severity: ${issue.severity}`);
        console.log(`       Regulation: ${issue.regulation.framework} ${issue.regulation.section}`);
        console.log(`       Location: Page ${issue.location?.page}, ${issue.location?.section}`);
      }
      console.log('   💡 User sees: Detailed compliance analysis with actionable feedback\n');
    }

    console.log('=== DEMONSTRATION COMPLETE ===\n');
  }

  /**
   * Show error categorization examples
   */
  demonstrateErrorCategorization(): void {
    console.log('\n=== ERROR CATEGORIZATION EXAMPLES ===\n');

    const errorExamples = [
      {
        scenario: 'Network Connection Lost',
        originalError: 'fetch failed: network error',
        improvedMessage: 'Network connection failed. Unable to connect to upload server. Please check your internet connection.',
        userAction: 'Check internet connection and retry'
      },
      {
        scenario: 'Server Unavailable',
        originalError: 'ECONNREFUSED connection refused',
        improvedMessage: 'Server unavailable. Upload server is not responding. Using mock mode for testing.',
        userAction: 'Server issue - mock mode activated automatically'
      },
      {
        scenario: 'Upload Timeout',
        originalError: 'timeout exceeded',
        improvedMessage: 'Upload timeout. Upload took too long to complete. Please try again with a smaller file.',
        userAction: 'Try with smaller file or check connection speed'
      },
      {
        scenario: 'Invalid File Format',
        originalError: 'INVALID_FILE_TYPE',
        improvedMessage: 'Invalid file type: text/plain (.txt). Only PDF files are accepted for upload.',
        userAction: 'Convert to PDF or select a PDF file'
      },
      {
        scenario: 'File Too Large',
        originalError: 'FILE_TOO_LARGE',
        improvedMessage: 'File size (150.5MB) exceeds the maximum limit of 100MB. Please compress your PDF or select a smaller file.',
        userAction: 'Compress PDF or use smaller file'
      }
    ];

    errorExamples.forEach((example, index) => {
      console.log(`${index + 1}. ${example.scenario}:`);
      console.log(`   Original: "${example.originalError}"`);
      console.log(`   Improved: "${example.improvedMessage}"`);
      console.log(`   Action: ${example.userAction}\n`);
    });

    console.log('=== CATEGORIZATION COMPLETE ===\n');
  }

  /**
   * Show the complete error handling workflow
   */
  async demonstrateCompleteWorkflow(): Promise<void> {
    console.log('\n=== COMPLETE ERROR HANDLING WORKFLOW ===\n');

    console.log('Step 1: File Selection & Validation');
    console.log('   - User selects file via drag-drop or file picker');
    console.log('   - Client-side validation checks file type, size, name');
    console.log('   - Immediate feedback for validation failures\n');

    console.log('Step 2: Upload Attempt');
    console.log('   - Try real Strands API first');
    console.log('   - Show progress updates during upload');
    console.log('   - Detailed error messages for failures\n');

    console.log('Step 3: Automatic Fallback');
    console.log('   - If real API fails, automatically try mock client');
    console.log('   - Seamless user experience with fallback notification');
    console.log('   - Continue workflow with mock data for testing\n');

    console.log('Step 4: Analysis & Results');
    console.log('   - Process uploaded document for compliance');
    console.log('   - Show analysis progress with step descriptions');
    console.log('   - Present detailed results with actionable recommendations\n');

    console.log('Key Improvements:');
    console.log('   ✅ User-friendly error messages instead of technical jargon');
    console.log('   ✅ Specific file details (size, type, name) in error messages');
    console.log('   ✅ Actionable guidance for resolving issues');
    console.log('   ✅ Automatic fallback to mock mode when server unavailable');
    console.log('   ✅ Progress feedback throughout the entire process');
    console.log('   ✅ Comprehensive logging for debugging support\n');

    console.log('=== WORKFLOW DEMONSTRATION COMPLETE ===\n');
  }
}

// Export for use in tests or demos
export default ErrorMessagingDemo;