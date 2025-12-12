/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Upload Management Types
 * 
 * Type definitions for document upload functionality and validation.
 */

// Re-export from app types for convenience
export type { UploadSession } from '@/types/app';
export { UploadStatus } from '@/types/app';

// Import for local use
import type { UploadSession } from '@/types/app';

/**
 * File validation result
 */
export interface FileValidationResult {
  /** Whether the file is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Specific error code for programmatic handling */
  errorCode?: FileValidationError;
  /** Additional validation details */
  details?: FileValidationDetails;
}

/**
 * File validation error codes
 */
export enum FileValidationError {
  INVALID_TYPE = 'invalid_type',
  FILE_TOO_LARGE = 'file_too_large',
  FILE_TOO_SMALL = 'file_too_small',
  FILENAME_TOO_LONG = 'filename_too_long',
  FILENAME_INVALID = 'filename_invalid',
  FILE_CORRUPTED = 'file_corrupted',
  VIRUS_DETECTED = 'virus_detected',
  UNSUPPORTED_VERSION = 'unsupported_version',
}

/**
 * Detailed file validation information
 */
export interface FileValidationDetails {
  /** Detected file type */
  detectedType?: string;
  /** File size in bytes */
  fileSize: number;
  /** Filename length */
  filenameLength: number;
  /** Whether file appears to be corrupted */
  isCorrupted?: boolean;
  /** PDF version if applicable */
  pdfVersion?: string;
  /** Number of pages if applicable */
  pageCount?: number;
}

/**
 * Upload manager component props
 */
export interface UploadManagerProps {
  /** Callback when upload is successfully completed */
  onUploadComplete?: (session: UploadSession) => void;
  /** Callback when upload fails */
  onUploadError?: (error: string, session: UploadSession) => void;
  /** Callback for upload progress updates */
  onUploadProgress?: (progress: number, session: UploadSession) => void;
  /** Whether the upload manager is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Accepted file types */
  acceptedTypes?: string[];
  /** Whether to allow multiple files */
  multiple?: boolean;
  /** Custom validation function */
  customValidator?: (file: File) => FileValidationResult;
}

/**
 * Upload configuration
 */
export interface UploadConfig {
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Accepted MIME types */
  acceptedTypes: string[];
  /** Maximum filename length */
  maxFilenameLength: number;
  /** Whether to perform virus scanning */
  virusScanning: boolean;
  /** Upload chunk size for large files */
  chunkSize: number;
  /** Maximum concurrent uploads */
  maxConcurrentUploads: number;
}

/**
 * Upload progress information
 */
export interface UploadProgress {
  /** Upload session ID */
  sessionId: string;
  /** Filename being uploaded */
  filename: string;
  /** Bytes uploaded so far */
  bytesUploaded: number;
  /** Total file size in bytes */
  totalBytes: number;
  /** Progress percentage (0-100) */
  percentage: number;
  /** Upload speed in bytes per second */
  speed?: number;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
}

/**
 * Upload service interface
 */
export interface UploadService {
  /** Upload a file */
  uploadFile: (file: File, options?: UploadOptions) => Promise<UploadSession>;
  
  /** Cancel an upload */
  cancelUpload: (sessionId: string) => Promise<void>;
  
  /** Get upload progress */
  getUploadProgress: (sessionId: string) => Promise<UploadProgress>;
  
  /** Validate a file before upload */
  validateFile: (file: File) => FileValidationResult;
  
  /** Get upload configuration */
  getUploadConfig: () => Promise<UploadConfig>;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** Custom metadata to attach */
  metadata?: Record<string, any>;
  /** Whether to enable chunked upload */
  chunked?: boolean;
  /** Custom chunk size */
  chunkSize?: number;
  /** Upload timeout in milliseconds */
  timeout?: number;
  /** Whether to retry on failure */
  retry?: boolean;
  /** Number of retry attempts */
  retryAttempts?: number;
}

/**
 * Upload metrics and statistics
 */
export interface UploadMetrics {
  /** Total uploads attempted */
  totalAttempts: number;
  /** Successful uploads */
  successfulUploads: number;
  /** Failed uploads */
  failedUploads: number;
  /** Success rate percentage */
  successRate: number;
  /** Average upload time in ms */
  averageUploadTime: number;
  /** Total bytes uploaded */
  totalBytesUploaded: number;
  /** Common failure reasons */
  failureReasons: Record<FileValidationError, number>;
}