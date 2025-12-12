// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Utilities
 * 
 * Shared utility functions and helpers for the Proposal Prepper
 * threshold functionality. Includes validation, formatting, and
 * common operations used across components.
 */

// Upload validation utilities
export {
  validateFile,
  validateFileType,
  validateFileSize,
  validateFilename,
  validatePDFContent,
  formatFileSize,
  generateSessionId,
  type FileValidationResult,
} from './upload-validation';