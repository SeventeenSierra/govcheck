// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Upload Validation Utilities
 *
 * Provides comprehensive file validation functions for the Upload Manager component.
 * Implements requirements 1.1 (PDF format validation) and 1.2 (file size validation).
 */

import { errorConfig, uploadConfig, validationConfig } from '@/config/app';

/**
 * File validation result interface
 */
export interface FileValidationResult {
  /** Whether the file passes all validation checks */
  isValid: boolean;
  /** Human-readable error message if validation fails */
  error?: string;
  /** Machine-readable error code for programmatic handling */
  errorCode?: string;
  /** Additional validation details */
  details?: {
    fileType?: string;
    fileSize?: number;
    filename?: string;
  };
}

/**
 * Validates file type against accepted formats
 * Implements requirement 1.1: PDF format acceptance
 *
 * @param file The file to validate
 * @returns Validation result for file type
 */
export function validateFileType(file: File): FileValidationResult {
  const acceptedTypes = uploadConfig.acceptedTypes;

  if (!acceptedTypes.includes(file.type as (typeof acceptedTypes)[number])) {
    return {
      isValid: false,
      error: `Invalid file type. Only PDF files are accepted. Received: ${file.type || 'unknown'}`,
      errorCode: errorConfig.codes.VALIDATION_FAILED,
      details: {
        fileType: file.type,
      },
    };
  }

  return {
    isValid: true,
    details: {
      fileType: file.type,
    },
  };
}

/**
 * Validates file size against configured limits
 * Implements requirement 1.2: File size limit checking
 *
 * @param file The file to validate
 * @returns Validation result for file size
 */
export function validateFileSize(file: File): FileValidationResult {
  const { maxFileSize, minFileSize } = uploadConfig;

  if (file.size > maxFileSize) {
    const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));

    return {
      isValid: false,
      error: `File size (${fileSizeMB}MB) exceeds the maximum limit of ${maxSizeMB}MB.`,
      errorCode: errorConfig.codes.VALIDATION_FAILED,
      details: {
        fileSize: file.size,
      },
    };
  }

  if (file.size < minFileSize) {
    const minSizeKB = Math.round(minFileSize / 1024);
    const fileSizeKB = Math.round(file.size / 1024);

    return {
      isValid: false,
      error: `File size (${fileSizeKB}KB) is below the minimum requirement of ${minSizeKB}KB.`,
      errorCode: errorConfig.codes.VALIDATION_FAILED,
      details: {
        fileSize: file.size,
      },
    };
  }

  return {
    isValid: true,
    details: {
      fileSize: file.size,
    },
  };
}

/**
 * Validates filename against security and length requirements
 *
 * @param filename The filename to validate
 * @returns Validation result for filename
 */
export function validateFilename(filename: string): FileValidationResult {
  const { maxFilenameLength, filenamePattern } = validationConfig;

  if (filename.length > maxFilenameLength) {
    return {
      isValid: false,
      error: `Filename is too long (${filename.length} characters). Maximum allowed: ${maxFilenameLength} characters.`,
      errorCode: errorConfig.codes.VALIDATION_FAILED,
      details: {
        filename,
      },
    };
  }

  if (!filenamePattern.test(filename)) {
    return {
      isValid: false,
      error:
        'Filename contains invalid characters. Please use only letters, numbers, dots, hyphens, and underscores.',
      errorCode: errorConfig.codes.VALIDATION_FAILED,
      details: {
        filename,
      },
    };
  }

  return {
    isValid: true,
    details: {
      filename,
    },
  };
}

/**
 * Comprehensive file validation
 * Combines all validation checks for a complete file validation
 *
 * @param file The file to validate
 * @returns Combined validation result
 */
export function validateFile(file: File): FileValidationResult {
  // Validate file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Validate filename
  const filenameValidation = validateFilename(file.name);
  if (!filenameValidation.isValid) {
    return filenameValidation;
  }

  return {
    isValid: true,
    details: {
      fileType: file.type,
      fileSize: file.size,
      filename: file.name,
    },
  };
}

/**
 * Checks if a file is a valid PDF by examining its content
 * This provides additional security beyond MIME type checking
 *
 * @param file The file to check
 * @returns Promise resolving to validation result
 */
export async function validatePDFContent(file: File): Promise<FileValidationResult> {
  try {
    // Read the first few bytes to check PDF signature
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF files start with "%PDF-" (0x25, 0x50, 0x44, 0x46, 0x2D)
    const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2d];

    // Check if we have enough bytes
    if (bytes.length < pdfSignature.length) {
      return {
        isValid: false,
        error: 'File does not appear to be a valid PDF document.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    for (let i = 0; i < pdfSignature.length; i++) {
      if (bytes[i] !== pdfSignature[i]) {
        return {
          isValid: false,
          error: 'File does not appear to be a valid PDF document.',
          errorCode: errorConfig.codes.VALIDATION_FAILED,
        };
      }
    }

    return {
      isValid: true,
    };
  } catch (_error) {
    return {
      isValid: false,
      error: 'Unable to validate PDF content. Please try again.',
      errorCode: errorConfig.codes.VALIDATION_FAILED,
    };
  }
}

/**
 * Formats file size for human-readable display
 *
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Generates a secure session ID for upload tracking
 *
 * @returns Unique session identifier
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `upload-${timestamp}-${randomPart}`;
}
