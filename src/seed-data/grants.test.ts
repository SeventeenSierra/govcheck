/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, expect, it } from 'vitest';
import {
  seedGrants,
  getRandomSeedGrant,
  getSeedGrantById,
  getFundedGrants,
  getGrantsByFunder,
  getNSFGrants,
  seedGrantToUploadSession,
  seedGrantToAnalysisResult,
} from './grants';
import { UploadStatus } from '../types/app';

describe('Seed Data - Grant Utilities', () => {
  it('should have seed grants available', () => {
    expect(seedGrants).toBeDefined();
    expect(seedGrants.length).toBeGreaterThan(0);
    
    // Verify structure of first grant
    const firstGrant = seedGrants[0];
    expect(firstGrant.metadata).toBeDefined();
    expect(firstGrant.metadata.UUID).toBeDefined();
    expect(firstGrant.metadata.Title).toBeDefined();
    expect(firstGrant.metadata.author).toBeDefined();
    expect(firstGrant.documents).toBeDefined();
    expect(firstGrant.documents.length).toBeGreaterThan(0);
  });

  it('should get random seed grant', () => {
    const grant1 = getRandomSeedGrant();
    const grant2 = getRandomSeedGrant();
    
    expect(grant1).toBeDefined();
    expect(grant2).toBeDefined();
    expect(grant1.metadata.UUID).toBeDefined();
    expect(grant2.metadata.UUID).toBeDefined();
  });

  it('should get seed grant by ID', () => {
    const knownId = '02ecd4f0-ac84-4cf4-8d10-1aed8faa6767';
    const grant = getSeedGrantById(knownId);
    
    expect(grant).toBeDefined();
    expect(grant?.metadata.UUID).toBe(knownId);
    expect(grant?.metadata.author).toBe('Jan Jensen');
  });

  it('should get funded grants', () => {
    const fundedGrants = getFundedGrants();
    
    expect(fundedGrants.length).toBeGreaterThan(0);
    fundedGrants.forEach(grant => {
      expect(grant.metadata.status).toBe('funded');
    });
  });

  it('should get grants by funder', () => {
    const nsfGrants = getGrantsByFunder('National Science Foundation');
    
    expect(nsfGrants.length).toBeGreaterThan(0);
    nsfGrants.forEach(grant => {
      expect(grant.metadata.funder.toLowerCase()).toContain('national science foundation');
    });
  });

  it('should get NSF grants specifically', () => {
    const nsfGrants = getNSFGrants();
    
    expect(nsfGrants.length).toBeGreaterThan(0);
    nsfGrants.forEach(grant => {
      expect(grant.metadata.funder.toLowerCase()).toContain('national science foundation');
    });
  });

  it('should convert seed grant to upload session', () => {
    const grant = seedGrants[0];
    const uploadSession = seedGrantToUploadSession(grant);
    
    expect(uploadSession.id).toBe(grant.metadata.UUID);
    expect(uploadSession.filename).toBe(grant.documents[0].filename);
    expect(uploadSession.status).toBe(UploadStatus.COMPLETED);
    expect(uploadSession.mimeType).toBe('application/pdf');
  });

  it('should convert seed grant to analysis result', () => {
    const grant = seedGrants[0];
    const analysisResult = seedGrantToAnalysisResult(grant);
    
    expect(analysisResult.sessionId).toContain('analysis-');
    expect(analysisResult.proposalId).toBe(grant.metadata.UUID);
    expect(analysisResult.status).toBeDefined();
    expect(analysisResult.overallScore).toBeGreaterThanOrEqual(0);
    expect(analysisResult.overallScore).toBeLessThanOrEqual(100);
    expect(analysisResult.analysisMetadata).toBeDefined();
  });

  it('should have realistic grant metadata', () => {
    const grant = seedGrants.find(g => g.metadata.author === 'Jan Jensen');
    
    expect(grant).toBeDefined();
    expect(grant?.metadata.Title).toBe('High Throughput pKa Prediction Using Semi Empirical Methods');
    expect(grant?.metadata.funder).toBe('Danish National Science Foundation');
    expect(grant?.metadata.Year).toBe(2015);
    expect(grant?.metadata.status).toBe('funded');
  });

  it('should have mock analysis results with compliance issues', () => {
    const grantWithIssues = seedGrants.find(g => 
      g.mockAnalysisResult && g.mockAnalysisResult.issues.length > 0
    );
    
    expect(grantWithIssues).toBeDefined();
    expect(grantWithIssues?.mockAnalysisResult?.issues).toBeDefined();
    
    const issue = grantWithIssues?.mockAnalysisResult?.issues[0];
    expect(issue?.id).toBeDefined();
    expect(issue?.type).toBeDefined();
    expect(issue?.severity).toBeDefined();
    expect(issue?.title).toBeDefined();
    expect(issue?.description).toBeDefined();
    expect(issue?.location).toBeDefined();
    expect(issue?.regulation).toBeDefined();
    expect(issue?.remediation).toBeDefined();
  });
});