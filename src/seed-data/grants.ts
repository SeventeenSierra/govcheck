/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { IssueSeverity } from '@/components/analysis/types';
import type { SeedGrant } from './types';
import { UploadStatus } from '../types/app';

/**
 * Seed data from AATB dataset for testing proposal compliance analysis
 *
 * This dataset contains real grant proposals and metadata from various funding agencies
 * including NSF, Wellcome Trust, and Danish National Science Foundation.
 *
 * Source: https://github.com/SeventeenSierra/grant-trace/tree/main/data/aatb_dataset
 */
export const seedGrants: SeedGrant[] = [
  {
    metadata: {
      layout: 'grant',
      author: 'Jan Jensen',
      funder: 'Danish National Science Foundation',
      program: 'Chemical Physics',
      status: 'funded',
      UUID: '02ecd4f0-ac84-4cf4-8d10-1aed8faa6767',
      'Original ID': 'jensen_jan_2015',
      Link: [
        {
          url: 'https://arxiv.org/pdf/1512.00701',
          status: 'Success',
        },
      ],
      Title: 'High Throughput pKa Prediction Using Semi Empirical Methods',
      Agency: null,
      Year: 2015,
    },
    documents: [
      {
        id: 'jensen_jan_2015_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767_PROPOSAL_1',
        filename: 'jensen_jan_2015_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767_PROPOSAL_1.pdf',
        type: 'PROPOSAL',
        url: 'https://raw.githubusercontent.com/SeventeenSierra/grant-trace/main/data/aatb_dataset/grant_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767/jensen_jan_2015_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767_PROPOSAL_1.pdf',
        metadata: {
          layout: 'grant',
          author: 'Jan Jensen',
          funder: 'Danish National Science Foundation',
          program: 'Chemical Physics',
          status: 'funded',
          UUID: '02ecd4f0-ac84-4cf4-8d10-1aed8faa6767',
          'Original ID': 'jensen_jan_2015',
          Title: 'High Throughput pKa Prediction Using Semi Empirical Methods',
          Agency: null,
          Year: 2015,
        },
      },
    ],
    mockAnalysisResult: {
      status: 'pass',
      overallScore: 92,
      issues: [
        {
          id: 'issue-1',
          type: 'compliance',
          severity: IssueSeverity.INFO,
          title: 'Budget justification format',
          description:
            'Budget justification follows standard format but could include more detail on equipment costs',
          location: { page: 8, section: 'Budget Justification' },
          regulation: { section: 'FAR 15.204-5', title: 'Proposal Evaluation' },
          remediation: 'Consider adding more detailed breakdown of equipment and personnel costs',
        },
      ],
    },
  },
  {
    metadata: {
      layout: 'grant',
      author: 'Michelle Barker',
      funder: 'Wellcome Trust',
      program: 'Discretionary',
      status: 'funded',
      UUID: '1b5d2213-4c72-4da8-a7b8-bece5b27d280',
      'Original ID': 'barker_michelle_2020',
      Link: [
        {
          url: 'https://www.ogrants.org/proposals/barker_michelle_2020.pdf',
          status: 'Success',
        },
      ],
      Title: 'FAIR for Research Software projects',
      Agency: null,
      Year: 2020,
    },
    documents: [
      {
        id: 'barker_michelle_2020_1b5d2213-4c72-4da8-a7b8-bece5b27d280_PROPOSAL_1',
        filename: 'barker_michelle_2020_1b5d2213-4c72-4da8-a7b8-bece5b27d280_PROPOSAL_1.pdf',
        type: 'PROPOSAL',
        url: 'https://www.ogrants.org/proposals/barker_michelle_2020.pdf',
        metadata: {
          layout: 'grant',
          author: 'Michelle Barker',
          funder: 'Wellcome Trust',
          program: 'Discretionary',
          status: 'funded',
          UUID: '1b5d2213-4c72-4da8-a7b8-bece5b27d280',
          'Original ID': 'barker_michelle_2020',
          Title: 'FAIR for Research Software projects',
          Agency: null,
          Year: 2020,
        },
      },
    ],
    mockAnalysisResult: {
      status: 'warning',
      overallScore: 78,
      issues: [
        {
          id: 'issue-2',
          type: 'compliance',
          severity: IssueSeverity.WARNING,
          title: 'Missing cost-sharing documentation',
          description:
            'Cost-sharing commitments mentioned but supporting documentation not clearly referenced',
          location: { page: 12, section: 'Budget and Cost Sharing' },
          regulation: { section: 'FAR 16.303', title: 'Cost-reimbursement contracts' },
          remediation: 'Include formal cost-sharing commitment letters from institutional partners',
        },
        {
          id: 'issue-3',
          type: 'compliance',
          severity: IssueSeverity.INFO,
          title: 'Data management plan completeness',
          description:
            'Data management plan is present but could benefit from more specific technical details',
          location: { page: 15, section: 'Data Management Plan' },
          regulation: { section: 'NSF 19-069', title: 'Data Management Plan Requirements' },
          remediation: 'Add specific file formats, storage locations, and access protocols',
        },
      ],
    },
  },
  {
    metadata: {
      layout: 'grant',
      author: 'Mauna Dasari',
      funder: 'U.S. National Science Foundation (NSF)',
      program: 'Postdoctoral Research Fellowship in Biology (Area: Rules of Life)',
      status: 'funded',
      UUID: '4a81a377-e0e9-43b6-b301-7a3058b0d012',
      'Original ID': 'dasari_mauna_2021',
      Link: [
        {
          url: 'https://www.ogrants.org/proposals/dasari_mauna_2021.pdf',
          status: 'Success',
        },
      ],
      Title:
        'Using metacommunity theory to assess the impact of multi-species interactions on gut microbial assembly',
      Agency: null,
      Year: 2021,
    },
    documents: [
      {
        id: 'dasari_mauna_2021_4a81a377-e0e9-43b6-b301-7a3058b0d012_PROPOSAL_1',
        filename: 'dasari_mauna_2021_4a81a377-e0e9-43b6-b301-7a3058b0d012_PROPOSAL_1.pdf',
        type: 'PROPOSAL',
        url: 'https://www.ogrants.org/proposals/dasari_mauna_2021.pdf',
        metadata: {
          layout: 'grant',
          author: 'Mauna Dasari',
          funder: 'U.S. National Science Foundation (NSF)',
          program: 'Postdoctoral Research Fellowship in Biology (Area: Rules of Life)',
          status: 'funded',
          UUID: '4a81a377-e0e9-43b6-b301-7a3058b0d012',
          'Original ID': 'dasari_mauna_2021',
          Title:
            'Using metacommunity theory to assess the impact of multi-species interactions on gut microbial assembly',
          Agency: null,
          Year: 2021,
        },
      },
    ],
    mockAnalysisResult: {
      status: 'pass',
      overallScore: 95,
      issues: [],
    },
  },
];

/**
 * Get a random seed grant for testing
 */
export function getRandomSeedGrant(): SeedGrant {
  return seedGrants[Math.floor(Math.random() * seedGrants.length)];
}

/**
 * Get seed grant by ID
 */
export function getSeedGrantById(id: string): SeedGrant | undefined {
  return seedGrants.find((grant) => grant.metadata.UUID === id);
}

/**
 * Get all funded grants
 */
export function getFundedGrants(): SeedGrant[] {
  return seedGrants.filter((grant) => grant.metadata.status === 'funded');
}

/**
 * Get grants by funder
 */
export function getGrantsByFunder(funder: string): SeedGrant[] {
  return seedGrants.filter((grant) =>
    grant.metadata.funder.toLowerCase().includes(funder.toLowerCase())
  );
}

/**
 * Get NSF grants specifically
 */
export function getNSFGrants(): SeedGrant[] {
  return getGrantsByFunder('National Science Foundation');
}

/**
 * Convert seed grant to upload session format for testing
 */
export function seedGrantToUploadSession(grant: SeedGrant) {
  const document = grant.documents[0]; // Use first document
  return {
    id: grant.metadata.UUID,
    filename: document.filename,
    fileSize: 1024000, // Mock file size
    mimeType: 'application/pdf',
    status: UploadStatus.COMPLETED,
    progress: 100,
    startedAt: new Date(),
    completedAt: new Date(),
  };
}

/**
 * Convert seed grant to analysis result format for testing
 */
export function seedGrantToAnalysisResult(grant: SeedGrant) {
  const mockResult = grant.mockAnalysisResult || {
    status: 'pass' as const,
    overallScore: 85,
    issues: [],
  };

  // Convert issues to match ComplianceIssue interface
  const convertedIssues = mockResult.issues.map((issue) => ({
    id: issue.id,
    severity: issue.severity,
    title: issue.title,
    description: issue.description,
    regulation: issue.regulation.section, // Convert object to string
    location: {
      page: issue.location.page,
      section: issue.location.section,
    },
    remediation: issue.remediation,
  }));

  return {
    sessionId: `analysis-${grant.metadata.UUID}`,
    proposalId: grant.metadata.UUID,
    status: mockResult.status,
    overallScore: mockResult.overallScore,
    issues: convertedIssues,
    analysisMetadata: {
      totalPages: Math.floor(Math.random() * 20) + 10, // Random page count
      processingTime: Math.floor(Math.random() * 10000) + 2000, // Random processing time
      completedAt: new Date(),
      rulesChecked: [
        'FAR 52.204-8',
        'FAR 52.204-21',
        'DFARS 252.204-7012',
        'FAR 52.219-8',
        'FAR 52.222-50',
      ].slice(0, Math.floor(Math.random() * 5) + 1), // Random subset of rules
    },
  };
}

/**
 * Generate mock upload session for testing
 */
export function generateMockUploadSession(status?: UploadStatus) {
  const grant = getRandomSeedGrant();
  const baseSession = seedGrantToUploadSession(grant);

  // Set progress based on status
  let progress = baseSession.progress;
  if (status === UploadStatus.PENDING) {
    progress = 0;
  } else if (status === UploadStatus.COMPLETED) {
    progress = 100;
  } else if (status === UploadStatus.UPLOADING) {
    progress = Math.floor(Math.random() * 99) + 1; // 1-99
  } else if (status === UploadStatus.FAILED) {
    progress = Math.floor(Math.random() * 90) + 10; // 10-99
  }

  return {
    ...baseSession,
    status: status || UploadStatus.COMPLETED,
    progress,
  };
}

/**
 * Generate mock analysis session for testing
 */
export function generateMockAnalysisSession(status?: string) {
  const grant = getRandomSeedGrant();

  // Set progress based on status
  let progress = 0;
  if (status === 'queued') {
    progress = 0;
  } else if (status === 'extracting') {
    progress = 15;
  } else if (status === 'analyzing') {
    progress = Math.floor(Math.random() * 61) + 20; // 20-80
  } else if (status === 'validating') {
    progress = Math.floor(Math.random() * 21) + 70; // 70-90
  } else if (status === 'completed') {
    progress = 100;
  } else if (status === 'failed') {
    progress = Math.floor(Math.random() * 51) + 10; // 10-60
  } else {
    progress = Math.floor(Math.random() * 100);
  }

  return {
    id: `analysis-${grant.metadata.UUID}`,
    proposalId: grant.metadata.UUID,
    status: status || 'completed',
    progress,
    startedAt: new Date(Date.now() - 30000),
    estimatedCompletion: status === 'completed' ? new Date() : new Date(Date.now() + 10000),
    currentStep: status === 'completed' ? 'Analysis complete' : 'Analyzing compliance requirements',
    completedAt: status === 'completed' ? new Date() : undefined,
  };
}

/**
 * Generate mock analysis results for testing
 */
export function generateMockAnalysisResults(complianceStatus?: 'pass' | 'fail' | 'warning') {
  const grant = getRandomSeedGrant();
  const result = seedGrantToAnalysisResult(grant);

  if (complianceStatus) {
    result.status = complianceStatus;
    result.overallScore =
      complianceStatus === 'pass' ? 90 : complianceStatus === 'warning' ? 75 : 45;

    // Adjust issues based on compliance status
    if (complianceStatus === 'pass') {
      result.issues = [];
    } else if (complianceStatus === 'fail') {
      // Ensure at least one critical issue for fail status
      if (!result.issues.some((issue) => issue.severity === IssueSeverity.CRITICAL)) {
        result.issues.push({
          id: 'critical-issue-1',
          title: 'Critical Compliance Issue',
          description: 'This is a critical compliance issue for testing',
          severity: IssueSeverity.CRITICAL,
          category: 'compliance', // Note: 'category' is extra property not in ComplianceIssue, consider removing if strict
          location: { page: 1, section: 'Section 1' },
          regulation: 'N/A', // Added missing regulation
          remediation: 'Fix this critical issue',
        } as any); // Cast as any because 'category' might be missing from type
      }
    } else if (complianceStatus === 'warning') {
      // Filter out critical issues for warning status
      result.issues = result.issues.filter((issue) => issue.severity !== IssueSeverity.CRITICAL);
      // Ensure at least one warning if no issues exist
      if (result.issues.length === 0) {
        result.issues.push({
          id: 'warning-issue-1',
          title: 'Warning Issue',
          description: 'This is a warning issue for testing',
          severity: IssueSeverity.WARNING,
          category: 'formatting',
          location: { page: 1, section: 'Section 1' },
          regulation: 'N/A', // Added missing regulation
          remediation: 'Consider addressing this warning',
        } as any);
      }
    }
  }

  return result;
}

/**
 * Generate mock file for testing
 */
export function generateMockFile(): File {
  const grant = getRandomSeedGrant();
  const content = `Mock PDF content for ${grant.metadata.Title}`;
  const blob = new Blob([content], { type: 'application/pdf' });
  return new File([blob], grant.documents[0].filename, { type: 'application/pdf' });
}
