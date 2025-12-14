/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { AnalysisResult, AnalysisSession } from '@/components/analysis/types';
import { AnalysisStatus } from '@/components/analysis/types';
import type { UploadSession } from '@/types/app';
import { UploadStatus } from '@/types/app';
import {
  getRandomSeedGrant,
  seedGrantToAnalysisResult,
  seedGrantToUploadSession,
} from '@/seed-data';

/**
 * Enhanced Mock Strands API for testing with real grant data
 * Provides realistic mock responses using real grant data from AATB dataset
 */
export class MockStrandsAPIEnhanced {
  private baseUrl: string;
  private delay: number;

  constructor(baseUrl = 'http://localhost:8080', delay = 1000) {
    this.baseUrl = baseUrl;
    this.delay = delay;
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * Mock file upload using seed data
   */
  async uploadFile(file: File): Promise<UploadSession> {
    await this.simulateDelay();

    // Simulate upload validation
    if (!file.type.includes('pdf')) {
      throw new Error('Only PDF files are supported');
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error('File size exceeds 10MB limit');
    }

    // Use seed data for realistic file names and metadata
    const seedGrant = getRandomSeedGrant();
    const uploadSession = seedGrantToUploadSession(seedGrant);

    // Override with actual file details but keep seed metadata
    return {
      ...uploadSession,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  /**
   * Mock analysis start
   */
  async startAnalysis(proposalId: string): Promise<AnalysisSession> {
    await this.simulateDelay();

    return {
      id: `analysis-${Date.now()}`,
      proposalId,
      status: AnalysisStatus.ANALYZING,
      progress: 0,
      startedAt: new Date(),
      currentStep: 'Extracting text from document',
    };
  }

  /**
   * Mock analysis progress
   */
  async getAnalysisProgress(sessionId: string): Promise<AnalysisSession> {
    await this.simulateDelay();

    // Simulate progressive analysis
    const progress = Math.min(100, Math.floor(Math.random() * 100));
    const steps = [
      'Extracting text from document',
      'Analyzing compliance requirements',
      'Checking FAR/DFARS regulations',
      'Validating budget justifications',
      'Reviewing data management plans',
      'Generating compliance report',
      'Finalizing analysis',
    ];

    return {
      id: sessionId,
      proposalId: 'mock-proposal',
      status: progress === 100 ? AnalysisStatus.COMPLETED : AnalysisStatus.ANALYZING,
      progress,
      startedAt: new Date(Date.now() - 30000), // 30 seconds ago
      estimatedCompletion: new Date(Date.now() + 10000), // 10 seconds from now
      currentStep: steps[Math.floor((progress / 100) * steps.length)],
    };
  }

  /**
   * Mock analysis results using seed data
   */
  async getAnalysisResults(sessionId: string): Promise<AnalysisResult> {
    await this.simulateDelay();

    // Use seed data for realistic analysis results
    const seedGrant = getRandomSeedGrant();
    return seedGrantToAnalysisResult(seedGrant);
  }

  /**
   * Get analysis results for a specific seed grant
   */
  async getAnalysisResultsForGrant(grantId: string): Promise<AnalysisResult> {
    await this.simulateDelay();

    // Find specific grant or use random if not found
    const seedGrant = getRandomSeedGrant(); // In a real implementation, we'd look up by grantId
    return seedGrantToAnalysisResult(seedGrant);
  }

  /**
   * Mock health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    await this.simulateDelay();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get available seed grants for testing
   */
  async getAvailableGrants(): Promise<
    Array<{ id: string; title: string; author: string; funder: string }>
  > {
    await this.simulateDelay();

    // This would be useful for testing different grant scenarios
    return [
      {
        id: '02ecd4f0-ac84-4cf4-8d10-1aed8faa6767',
        title: 'High Throughput pKa Prediction Using Semi Empirical Methods',
        author: 'Jan Jensen',
        funder: 'Danish National Science Foundation',
      },
      {
        id: '1b5d2213-4c72-4da8-a7b8-bece5b27d280',
        title: 'FAIR for Research Software projects',
        author: 'Michelle Barker',
        funder: 'Wellcome Trust',
      },
      {
        id: '4a81a377-e0e9-43b6-b301-7a3058b0d012',
        title:
          'Using metacommunity theory to assess the impact of multi-species interactions on gut microbial assembly',
        author: 'Mauna Dasari',
        funder: 'U.S. National Science Foundation (NSF)',
      },
    ];
  }
}

/**
 * Default enhanced mock API instance
 */
export const mockStrandsAPIEnhanced = new MockStrandsAPIEnhanced();
