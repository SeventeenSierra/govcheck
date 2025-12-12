/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * **Feature: comprehensive-testing-infrastructure, Property 5: Mock data consistency**
 * **Validates: Requirements 6.1, 6.2, 6.3**
 * 
 * Property-based tests for mock data consistency across different scenarios.
 * Ensures that mock API responses conform to expected interfaces and provide
 * realistic values that match production data patterns.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { MockStrandsAPIEnhanced, ErrorScenario } from './mock-strands-api-enhanced';
import {
  generateMockUploadSession,
  generateMockAnalysisSession,
  generateMockAnalysisResults,
  generateMockFile,
  getRandomSeedGrant,
  seedGrantToAnalysisResult,
  seedGrantToUploadSession,
} from '@/seed-data/grants';
import { validateMockData } from './mock-data-provider';
import { UploadStatus } from '@/types/app';
import { AnalysisStatus } from '@/components/analysis/types';

describe('Mock Data Consistency Properties', () => {
  describe('Property 5.1: Upload Session Mock Data Consistency', () => {
    it('should generate valid upload sessions for all status values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.values(UploadStatus)),
          (status) => {
            const uploadSession = generateMockUploadSession(status);
            
            // Validate structure
            expect(validateMockData.uploadSession(uploadSession)).toBe(true);
            
            // Validate status consistency
            expect(uploadSession.status).toBe(status);
            
            // Validate progress consistency with status
            if (status === UploadStatus.PENDING) {
              expect(uploadSession.progress).toBe(0);
            } else if (status === UploadStatus.COMPLETED) {
              expect(uploadSession.progress).toBe(100);
            } else if (status === UploadStatus.UPLOADING) {
              expect(uploadSession.progress).toBeGreaterThan(0);
              expect(uploadSession.progress).toBeLessThan(100);
            }
            
            // Validate required fields
            expect(typeof uploadSession.id).toBe('string');
            expect(uploadSession.id.length).toBeGreaterThan(0);
            expect(typeof uploadSession.filename).toBe('string');
            expect(uploadSession.filename.length).toBeGreaterThan(0);
            expect(typeof uploadSession.fileSize).toBe('number');
            expect(uploadSession.fileSize).toBeGreaterThan(0);
            expect(typeof uploadSession.mimeType).toBe('string');
            expect(uploadSession.startedAt).toBeInstanceOf(Date);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5.2: Analysis Session Mock Data Consistency', () => {
    it('should generate valid analysis sessions for all status values', () => {
      const analysisStatuses = ['queued', 'extracting', 'analyzing', 'validating', 'completed', 'failed'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...analysisStatuses),
          (status) => {
            const analysisSession = generateMockAnalysisSession(status);
            
            // Validate structure
            expect(validateMockData.analysisSession(analysisSession)).toBe(true);
            
            // Validate status consistency
            expect(analysisSession.status).toBe(status);
            
            // Validate progress consistency with status
            expect(analysisSession.progress).toBeGreaterThanOrEqual(0);
            expect(analysisSession.progress).toBeLessThanOrEqual(100);
            
            // Validate progress ranges based on status
            if (status === 'queued') {
              expect(analysisSession.progress).toBe(0);
            } else if (status === 'extracting') {
              expect(analysisSession.progress).toBe(15);
            } else if (status === 'analyzing') {
              expect(analysisSession.progress).toBeGreaterThanOrEqual(20);
              expect(analysisSession.progress).toBeLessThanOrEqual(80);
            } else if (status === 'validating') {
              expect(analysisSession.progress).toBeGreaterThanOrEqual(70);
              expect(analysisSession.progress).toBeLessThanOrEqual(90);
            } else if (status === 'completed') {
              expect(analysisSession.progress).toBe(100);
              expect(analysisSession.completedAt).toBeInstanceOf(Date);
            } else if (status === 'failed') {
              expect(analysisSession.progress).toBeGreaterThanOrEqual(10);
              expect(analysisSession.progress).toBeLessThanOrEqual(60);
            }
            
            // Validate required fields
            expect(typeof analysisSession.id).toBe('string');
            expect(analysisSession.id.length).toBeGreaterThan(0);
            expect(typeof analysisSession.proposalId).toBe('string');
            expect(analysisSession.proposalId.length).toBeGreaterThan(0);
            expect(typeof analysisSession.currentStep).toBe('string');
            expect(analysisSession.currentStep.length).toBeGreaterThan(0);
            expect(analysisSession.startedAt).toBeInstanceOf(Date);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5.3: Analysis Results Mock Data Consistency', () => {
    it('should generate valid analysis results for all compliance statuses', () => {
      const complianceStatuses = ['pass', 'fail', 'warning'] as const;
      
      fc.assert(
        fc.property(
          fc.constantFrom(...complianceStatuses),
          (status) => {
            const analysisResults = generateMockAnalysisResults(status);
            
            // Validate structure
            expect(validateMockData.analysisResults(analysisResults)).toBe(true);
            
            // Validate status consistency
            expect(analysisResults.status).toBe(status);
            
            // Validate score consistency with status
            if (status === 'pass') {
              expect(analysisResults.overallScore).toBeGreaterThanOrEqual(85);
            } else if (status === 'fail') {
              expect(analysisResults.overallScore).toBeLessThanOrEqual(70);
            } else if (status === 'warning') {
              expect(analysisResults.overallScore).toBeGreaterThanOrEqual(70);
              expect(analysisResults.overallScore).toBeLessThanOrEqual(90);
            }
            
            // Validate issues consistency with status
            if (status === 'pass') {
              expect(analysisResults.issues).toHaveLength(0);
            } else {
              expect(analysisResults.issues.length).toBeGreaterThan(0);
            }
            
            // Validate required fields
            expect(typeof analysisResults.sessionId).toBe('string');
            expect(typeof analysisResults.proposalId).toBe('string');
            expect(typeof analysisResults.overallScore).toBe('number');
            expect(analysisResults.overallScore).toBeGreaterThanOrEqual(0);
            expect(analysisResults.overallScore).toBeLessThanOrEqual(100);
            expect(Array.isArray(analysisResults.issues)).toBe(true);
            expect(analysisResults.analysisMetadata).toBeDefined();
            expect(analysisResults.analysisMetadata.completedAt).toBeInstanceOf(Date);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5.4: Seed Grant Data Consistency', () => {
    it('should maintain consistent data transformation from seed grants', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 99 }), // Use as seed for deterministic selection
          (seed) => {
            // Get consistent grant based on seed
            const grant = getRandomSeedGrant();
            
            // Transform to upload session
            const uploadSession = seedGrantToUploadSession(grant);
            expect(uploadSession.id).toBe(grant.metadata.UUID);
            expect(uploadSession.filename).toContain(grant.metadata.UUID);
            expect(uploadSession.status).toBe(UploadStatus.COMPLETED);
            
            // Transform to analysis result
            const analysisResult = seedGrantToAnalysisResult(grant);
            expect(analysisResult.proposalId).toBe(grant.metadata.UUID);
            expect(analysisResult.sessionId).toContain(grant.metadata.UUID);
            
            // Validate metadata consistency
            expect(analysisResult.analysisMetadata.totalPages).toBeGreaterThan(0);
            expect(analysisResult.analysisMetadata.processingTime).toBeGreaterThan(0);
            expect(Array.isArray(analysisResult.analysisMetadata.rulesChecked)).toBe(true);
            expect(analysisResult.analysisMetadata.rulesChecked.length).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 5.5: Mock API Error Scenario Consistency', () => {
    it('should handle error scenarios consistently across all methods', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...Object.values(ErrorScenario)),
          async (errorScenario) => {
            const mockAPI = MockStrandsAPIEnhanced.createErrorScenario(errorScenario, 10);
            const mockFile = generateMockFile();
            
            // Test upload method error handling
            try {
              await mockAPI.uploadFile(mockFile);
              // If no error thrown, it should only be for scenarios that don't affect upload
              expect([
                ErrorScenario.ANALYSIS_FAILED,
              ]).toContain(errorScenario);
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as Error).message.length).toBeGreaterThan(0);
            }
            
            // Test analysis methods error handling
            try {
              await mockAPI.startAnalysis('test-proposal');
              // If no error thrown, it should only be for scenarios that don't affect analysis start
              expect([
                ErrorScenario.INVALID_FILE,
                ErrorScenario.FILE_TOO_LARGE,
              ]).toContain(errorScenario);
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              expect((error as Error).message.length).toBeGreaterThan(0);
            }
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 5.6: Mock File Generation Consistency', () => {
    it('should generate valid mock files with consistent properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1024, max: 10 * 1024 * 1024 }),
          fc.constantFrom('application/pdf', 'text/plain', 'application/json'),
          (name, size, type) => {
            const mockFile = generateMockFile(name, size, type);
            
            // Validate file properties
            expect(mockFile).toBeInstanceOf(File);
            expect(mockFile.name).toBe(name);
            expect(mockFile.size).toBe(size);
            expect(mockFile.type).toBe(type);
            
            // Validate file content exists
            expect(mockFile.size).toBeGreaterThan(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5.7: Mock Data Round-Trip Consistency', () => {
    it('should maintain data integrity through serialization/deserialization', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.values(UploadStatus)),
          fc.constantFrom('queued', 'analyzing', 'completed', 'failed'),
          fc.constantFrom('pass', 'fail', 'warning'),
          (uploadStatus, analysisStatus, complianceStatus) => {
            // Generate mock data
            const uploadSession = generateMockUploadSession(uploadStatus);
            const analysisSession = generateMockAnalysisSession(analysisStatus);
            const analysisResults = generateMockAnalysisResults(complianceStatus);
            
            // Serialize and deserialize
            const serializedUpload = JSON.stringify(uploadSession);
            const deserializedUpload = JSON.parse(serializedUpload);
            
            const serializedAnalysis = JSON.stringify(analysisSession);
            const deserializedAnalysis = JSON.parse(serializedAnalysis);
            
            const serializedResults = JSON.stringify(analysisResults);
            const deserializedResults = JSON.parse(serializedResults);
            
            // Validate round-trip consistency (excluding Date objects which need special handling)
            expect(deserializedUpload.id).toBe(uploadSession.id);
            expect(deserializedUpload.status).toBe(uploadSession.status);
            expect(deserializedUpload.progress).toBe(uploadSession.progress);
            
            expect(deserializedAnalysis.id).toBe(analysisSession.id);
            expect(deserializedAnalysis.status).toBe(analysisSession.status);
            expect(deserializedAnalysis.progress).toBe(analysisSession.progress);
            
            expect(deserializedResults.sessionId).toBe(analysisResults.sessionId);
            expect(deserializedResults.status).toBe(analysisResults.status);
            expect(deserializedResults.overallScore).toBe(analysisResults.overallScore);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});