/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { IssueSeverity } from '@/components/analysis/types';

/**
 * Grant metadata structure from AATB dataset
 */
export interface GrantMetadata {
  layout: string;
  author: string;
  funder: string;
  program: string;
  status: 'funded' | 'rejected' | 'pending' | 'withdrawn';
  UUID: string;
  'Original ID': string;
  Link?: Array<{
    url: string;
    status: string;
  }>;
  Title: string;
  Agency: string | null;
  Year: number;
}

/**
 * Grant document structure for testing
 */
export interface GrantDocument {
  id: string;
  filename: string;
  type: 'PROPOSAL' | 'SOLICITATION';
  url: string;
  metadata: GrantMetadata;
}

/**
 * Seed data structure for testing
 */
export interface SeedGrant {
  metadata: GrantMetadata;
  documents: GrantDocument[];
  // For testing purposes, we'll include some mock analysis results
  mockAnalysisResult?: {
    status: 'pass' | 'fail' | 'warning';
    overallScore: number;
    issues: Array<{
      id: string;
      type: string;
      severity: IssueSeverity;
      title: string;
      description: string;
      location: { page: number; section: string };
      regulation: { section: string; title: string };
      remediation: string;
    }>;
  };
}