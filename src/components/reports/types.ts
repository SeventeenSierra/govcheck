/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Report Generation Types
 *
 * Type definitions for compliance report generation and management.
 */

import type { AnalysisResults } from '@/components/results/types';

/**
 * Report generation status
 */
export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  READY = 'ready',
  ERROR = 'error',
  EXPIRED = 'expired',
}

/**
 * Supported report formats
 */
export enum ReportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  HTML = 'html',
  JSON = 'json',
  CSV = 'csv',
}

/**
 * Report template types
 */
export enum ReportTemplate {
  STANDARD = 'standard',
  EXECUTIVE = 'executive',
  DETAILED = 'detailed',
  SUMMARY = 'summary',
  CUSTOM = 'custom',
}

/**
 * Report data structure
 */
export interface ReportData {
  /** Unique report identifier */
  id: string;
  /** Report title */
  title: string;
  /** Report reference number */
  reference: string;
  /** Generation timestamp */
  generatedAt: Date;
  /** Expiration timestamp */
  expiresAt?: Date;
  /** Analysis results data */
  analysisResults: AnalysisResults;
  /** Overall compliance score (0-100) */
  complianceScore: number;
  /** Report status */
  status: ReportStatus;
  /** Report template used */
  template: ReportTemplate;
  /** Report format */
  format: ReportFormat;
  /** File size in bytes */
  fileSize?: number;
  /** Download URL */
  downloadUrl?: string;
}

/**
 * Report generation options
 */
export interface ReportGenerationOptions {
  /** Report template to use */
  template: ReportTemplate;
  /** Output format */
  format: ReportFormat;
  /** Include executive summary */
  includeExecutiveSummary?: boolean;
  /** Include detailed findings */
  includeDetailedFindings?: boolean;
  /** Include remediation recommendations */
  includeRemediation?: boolean;
  /** Include regulatory references */
  includeRegulatory?: boolean;
  /** Custom branding options */
  branding?: ReportBranding;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Report branding customization
 */
export interface ReportBranding {
  /** Organization name */
  organizationName?: string;
  /** Organization logo URL */
  logoUrl?: string;
  /** Primary brand color */
  primaryColor?: string;
  /** Secondary brand color */
  secondaryColor?: string;
  /** Custom footer text */
  footerText?: string;
}

/**
 * Report preview component props
 */
export interface ReportPreviewProps {
  /** Whether the preview panel is visible */
  isVisible: boolean;
  /** Report data to display */
  reportData?: ReportData;
  /** Whether the report is being generated */
  isGenerating?: boolean;
  /** Callback when user downloads the report */
  onDownload?: (format: ReportFormat) => void;
  /** Callback when user opens report in fullscreen */
  onFullscreen?: () => void;
  /** Callback when user shares the report */
  onShare?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Report generation service interface
 */
export interface ReportService {
  /** Generate a new report */
  generateReport: (
    analysisResults: AnalysisResults,
    options: ReportGenerationOptions
  ) => Promise<ReportData>;

  /** Get report status */
  getReportStatus: (reportId: string) => Promise<ReportStatus>;

  /** Download report */
  downloadReport: (reportId: string, format?: ReportFormat) => Promise<Blob>;

  /** Delete report */
  deleteReport: (reportId: string) => Promise<void>;

  /** List user reports */
  listReports: (userId?: string) => Promise<ReportData[]>;
}

/**
 * Report metrics and analytics
 */
export interface ReportMetrics {
  /** Total reports generated */
  totalGenerated: number;
  /** Reports by format */
  byFormat: Record<ReportFormat, number>;
  /** Reports by template */
  byTemplate: Record<ReportTemplate, number>;
  /** Average generation time in ms */
  averageGenerationTime: number;
  /** Success rate percentage */
  successRate: number;
}
