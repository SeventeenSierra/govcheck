/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { 
  ApiResponse, 
  UploadSessionResponse, 
  AnalysisSessionResponse, 
  ComplianceResultsResponse,
  ComplianceIssue 
} from './strands-api-client';

/**
 * Framework-Independent Mock API Server
 * 
 * Provides mock API functionality that can be used with any framework
 * or as a standalone server. Extracted from Next.js API routes for
 * maximum portability and reusability.
 */
export class MockApiServer {
  private mockDelay: number;

  constructor(mockDelay = 1000) {
    this.mockDelay = mockDelay;
  }

  private async simulateDelay(customDelay?: number): Promise<void> {
    const delay = customDelay ?? this.mockDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Handle document upload
   * Extracted from src/app/api/documents/upload/route.ts
   */
  async handleDocumentUpload(file: File): Promise<ApiResponse<UploadSessionResponse>> {
    try {
      // Validate file presence
      if (!file) {
        return {
          success: false,
          error: 'No file provided',
          code: 'MISSING_FILE'
        };
      }

      // Validate file type
      if (file.type !== 'application/pdf') {
        return {
          success: false,
          error: 'Only PDF files are accepted',
          code: 'INVALID_FILE_TYPE'
        };
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size exceeds 100MB limit',
          code: 'FILE_TOO_LARGE'
        };
      }

      // Simulate processing delay
      await this.simulateDelay();

      // Generate mock upload session
      const uploadSession: UploadSessionResponse = {
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'completed',
        progress: 100,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: uploadSession
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Upload failed',
        code: 'UPLOAD_FAILED'
      };
    }
  }

  /**
   * Handle analysis start
   * Extracted from src/app/api/analysis/start/route.ts
   */
  async handleAnalysisStart(proposalId: string): Promise<ApiResponse<AnalysisSessionResponse>> {
    try {
      if (!proposalId) {
        return {
          success: false,
          error: 'Proposal ID is required',
          code: 'MISSING_PROPOSAL_ID'
        };
      }

      // Simulate processing delay
      await this.simulateDelay(500);

      // Generate mock analysis session
      const analysisSession: AnalysisSessionResponse = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        proposalId,
        status: 'analyzing',
        progress: 0,
        startedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 30000).toISOString(), // 30 seconds from now
        currentStep: 'Starting compliance analysis...',
      };

      return {
        success: true,
        data: analysisSession
      };

    } catch (error) {
      console.error('Analysis start error:', error);
      return {
        success: false,
        error: 'Failed to start analysis',
        code: 'ANALYSIS_START_FAILED'
      };
    }
  }

  /**
   * Handle analysis results retrieval
   * Extracted from src/app/api/analysis/[sessionId]/results/route.ts
   */
  async handleAnalysisResults(sessionId: string): Promise<ApiResponse<ComplianceResultsResponse>> {
    try {
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        };
      }

      // Simulate processing delay
      await this.simulateDelay(500);

      // Generate mock compliance issues with proper structure
      const mockIssues: ComplianceIssue[] = [
        {
          id: 'issue_1',
          severity: 'warning',
          title: 'Budget Justification Format',
          description: 'Budget justification follows standard format but could include more detail on equipment costs',
          location: { 
            page: 8, 
            section: 'Budget Justification',
            text: 'Equipment costs section'
          },
          regulation: {
            framework: 'FAR',
            section: '15.204-5',
            reference: 'FAR 15.204-5 - Budget Justification Requirements'
          },
          remediation: 'Consider adding more detailed breakdown of equipment and personnel costs',
        },
        {
          id: 'issue_2',
          severity: 'info',
          title: 'Data Management Plan',
          description: 'Data management plan is present and meets basic requirements',
          location: { 
            page: 15, 
            section: 'Data Management Plan',
            text: 'Data management section'
          },
          regulation: {
            framework: 'FAR',
            section: '19-069',
            reference: 'NSF 19-069 - Data Management Plan Requirements'
          },
          remediation: 'Plan is compliant with current requirements',
        }
      ];

      // Randomly include issues (70% chance)
      const issues = Math.random() > 0.3 ? mockIssues : [];

      // Generate mock analysis results
      const analysisResults: ComplianceResultsResponse = {
        id: sessionId,
        proposalId: `proposal_${sessionId}`,
        status: issues.length === 0 ? 'pass' : 'warning',
        issues,
        summary: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          warningIssues: issues.filter(i => i.severity === 'warning').length,
        },
        generatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: analysisResults
      };

    } catch (error) {
      console.error('Results retrieval error:', error);
      return {
        success: false,
        error: 'Failed to retrieve results',
        code: 'RESULTS_RETRIEVAL_FAILED'
      };
    }
  }

  /**
   * Handle upload status check
   */
  async handleUploadStatus(sessionId: string): Promise<ApiResponse<UploadSessionResponse>> {
    try {
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        };
      }

      await this.simulateDelay(200);

      const uploadSession: UploadSessionResponse = {
        id: sessionId,
        filename: 'mock-proposal.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 10000).toISOString(),
        completedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: uploadSession
      };

    } catch (error) {
      console.error('Upload status error:', error);
      return {
        success: false,
        error: 'Failed to get upload status',
        code: 'UPLOAD_STATUS_FAILED'
      };
    }
  }

  /**
   * Handle analysis status check
   */
  async handleAnalysisStatus(sessionId: string): Promise<ApiResponse<AnalysisSessionResponse>> {
    try {
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        };
      }

      await this.simulateDelay(300);

      const analysisSession: AnalysisSessionResponse = {
        id: sessionId,
        proposalId: `proposal_${sessionId}`,
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 30000).toISOString(),
        completedAt: new Date().toISOString(),
        currentStep: 'Analysis completed',
      };

      return {
        success: true,
        data: analysisSession
      };

    } catch (error) {
      console.error('Analysis status error:', error);
      return {
        success: false,
        error: 'Failed to get analysis status',
        code: 'ANALYSIS_STATUS_FAILED'
      };
    }
  }

  /**
   * Health check endpoint
   */
  async handleHealthCheck(): Promise<ApiResponse<{ status: string; version: string; timestamp: string }>> {
    await this.simulateDelay(100);

    return {
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0-mock',
        timestamp: new Date().toISOString(),
      }
    };
  }

  /**
   * Get issue details
   */
  async handleIssueDetails(issueId: string): Promise<ApiResponse<ComplianceIssue>> {
    try {
      if (!issueId) {
        return {
          success: false,
          error: 'Issue ID is required',
          code: 'MISSING_ISSUE_ID'
        };
      }

      await this.simulateDelay(200);

      const issue: ComplianceIssue = {
        id: issueId,
        severity: 'warning',
        title: 'Sample Compliance Issue',
        description: 'This is a detailed description of the compliance issue found in the document.',
        location: {
          page: 5,
          section: 'Technical Approach',
          text: 'Relevant text excerpt from the document'
        },
        regulation: {
          framework: 'FAR',
          section: '52.204-8',
          reference: 'FAR 52.204-8 - Annual Representations and Certifications'
        },
        remediation: 'Recommended steps to address this compliance issue.',
      };

      return {
        success: true,
        data: issue
      };

    } catch (error) {
      console.error('Issue details error:', error);
      return {
        success: false,
        error: 'Failed to get issue details',
        code: 'ISSUE_DETAILS_FAILED'
      };
    }
  }
}

/**
 * Default mock API server instance
 */
export const mockApiServer = new MockApiServer();