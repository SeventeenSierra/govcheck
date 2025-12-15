/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Analysis session status enumeration
 * Tracks the current state of document analysis
 */
export enum AnalysisStatus {
  QUEUED = 'queued',
  EXTRACTING = 'extracting',
  ANALYZING = 'analyzing',
  VALIDATING = 'validating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Analysis session interface
 * Represents an active analysis process
 */
export interface AnalysisSession {
  id: string;
  proposalId: string;
  status: AnalysisStatus;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  currentStep: string;
  errorMessage?: string;
}

/**
 * Compliance issue severity levels
 */
export enum IssueSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Compliance issue interface
 * Represents a specific compliance violation found during analysis
 */
export interface ComplianceIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  regulation: string; // FAR/DFARS section reference
  location?: {
    page?: number;
    section?: string;
    lineNumber?: number;
  };
  remediation?: string;
}

/**
 * Analysis result interface
 * Contains the complete results of document analysis
 */
export interface AnalysisResult {
  sessionId: string;
  proposalId: string;
  status: 'pass' | 'fail' | 'warning';
  overallScore: number;
  issues: ComplianceIssue[];
  extractedText?: string;
  analysisMetadata: {
    totalPages: number;
    processingTime: number;
    rulesChecked: string[];
    completedAt: Date;
  };
}

/**
 * Text extraction result interface
 */
export interface TextExtractionResult {
  success: boolean;
  text?: string;
  pageCount?: number;
  errorMessage?: string;
  metadata?: {
    extractionMethod: string;
    processingTime: number;
    confidence: number;
  };
}

/**
 * FAR/DFARS validation result interface
 */
export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  issues: ComplianceIssue[];
  confidence: number;
}
