/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { ApiResponse, UploadSessionResponse, AnalysisSessionResponse, ComplianceResultsResponse } from './strands-api-client';

/**
 * Mock Strands API Client for Development
 * 
 * Provides realistic mock responses for development and testing
 * when the actual Strands service isn't available.
 */
export class MockStrandsClient {
  private baseUrl: string;
  private mockDelay: number;

  constructor(baseUrl = 'http://localhost:3000', mockDelay = 1000) {
    this.baseUrl = baseUrl;
    this.mockDelay = mockDelay;
  }

  private async simulateDelay(customDelay?: number): Promise<void> {
    const delay = customDelay ?? this.mockDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadSessionResponse>> {
    // Simulate upload progress
    if (onProgress) {
      const progressSteps = [10, 25, 50, 75, 90, 100];
      for (const progress of progressSteps) {
        await this.simulateDelay(200);
        onProgress(progress);
      }
    } else {
      await this.simulateDelay();
    }

    // Validate file
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'Only PDF files are accepted',
        code: 'INVALID_FILE_TYPE'
      };
    }

    if (file.size > 100 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size exceeds 100MB limit',
        code: 'FILE_TOO_LARGE'
      };
    }

    // Return successful upload
    return {
      success: true,
      data: {
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'completed',
        progress: 100,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      }
    };
  }

  async startAnalysis(proposalId: string): Promise<ApiResponse<AnalysisSessionResponse>> {
    await this.simulateDelay(500);

    return {
      success: true,
      data: {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        proposalId,
        status: 'analyzing',
        progress: 0,
        startedAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 30000).toISOString(),
        currentStep: 'Starting compliance analysis...',
      }
    };
  }

  async getResults(sessionId: string): Promise<ApiResponse<ComplianceResultsResponse>> {
    await this.simulateDelay(800);

    const allMockIssues = [
      {
        id: 'issue_1',
        severity: 'warning' as const,
        title: 'Budget Justification Format',
        description: 'Budget justification follows standard format but could include more detail on equipment costs',
        location: { page: 8, section: 'Budget Justification', text: 'Equipment costs section' },
        regulation: {
          framework: 'FAR' as const,
          section: '15.204-5',
          reference: 'FAR 15.204-5 - Budget Justification Requirements'
        },
        remediation: 'Consider adding more detailed breakdown of equipment and personnel costs',
      },
      {
        id: 'issue_2',
        severity: 'info' as const,
        title: 'Data Management Plan',
        description: 'Data management plan is present and meets basic requirements',
        location: { page: 15, section: 'Data Management Plan', text: 'Data management section' },
        regulation: {
          framework: 'FAR' as const,
          section: '19-069',
          reference: 'NSF 19-069 - Data Management Plan Requirements'
        },
        remediation: 'Plan is compliant with current requirements',
      },
      {
        id: 'issue_3',
        severity: 'critical' as const,
        title: 'Missing Security Requirements',
        description: 'Critical cybersecurity requirements are not addressed in the proposal',
        location: { page: 5, section: 'Security Plan', text: 'Security requirements section' },
        regulation: {
          framework: 'DFARS' as const,
          section: '252.204-7012',
          reference: 'DFARS 252.204-7012 - Cybersecurity Requirements'
        },
        remediation: 'Must include comprehensive cybersecurity plan addressing all DFARS requirements',
      }
    ];

    // Randomly select subset of issues (sometimes including critical)
    const mockIssues = Math.random() > 0.7 
      ? allMockIssues // 30% chance of all issues including critical
      : allMockIssues.slice(0, 2); // 70% chance of just warning/info issues

    const issues = Math.random() > 0.3 ? mockIssues : []; // 70% chance of having issues
    
    return {
      success: true,
      data: {
        id: sessionId,
        proposalId: `proposal_${sessionId}`,
        status: issues.length === 0 ? 'pass' : issues.some(i => i.severity === 'critical') ? 'fail' : 'warning',
        issues,
        summary: {
          totalIssues: issues.length,
          criticalIssues: issues.filter(i => i.severity === 'critical').length,
          warningIssues: issues.filter(i => i.severity === 'warning').length,
        },
        generatedAt: new Date().toISOString(),
      }
    };
  }

  async getAnalysisStatus(sessionId: string): Promise<ApiResponse<AnalysisSessionResponse>> {
    await this.simulateDelay(300);

    return {
      success: true,
      data: {
        id: sessionId,
        proposalId: `proposal_${sessionId}`,
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 30000).toISOString(),
        completedAt: new Date().toISOString(),
        currentStep: 'Analysis completed',
      }
    };
  }

  async getUploadStatus(sessionId: string): Promise<ApiResponse<UploadSessionResponse>> {
    await this.simulateDelay(200);

    return {
      success: true,
      data: {
        id: sessionId,
        filename: 'mock-proposal.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 10000).toISOString(),
        completedAt: new Date().toISOString(),
      }
    };
  }

  // Health check for testing connectivity
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    await this.simulateDelay(100);

    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      }
    };
  }
}