// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Utilities
 *
 * Shared utility functions and helpers for the Proposal Prepper
 * threshold functionality. Includes validation, formatting, and
 * common operations used across components.
 */

// Analysis validation utilities
export {
  CORE_VALIDATION_RULES,
  calculateComplianceScore,
  extractRegulatoryReferences,
  hasBasicComplianceElements,
  type ValidationRule,
  validateFARDFARS,
} from './analysis-validation';
// Compliance detection utilities
export {
  analyzeDocumentStructure,
  CRITICAL_VIOLATION_PATTERNS,
  detectCriticalViolations,
  detectWarningIssues,
  findIssueLocations,
  generateComplianceStatus,
  WARNING_VIOLATION_PATTERNS,
} from './compliance-detection';
// Performance utilities
export {
  apiCache,
  BrowserCache,
  debounce,
  lazyLoadImage,
  MemoryCache,
  memoize,
  PerformanceMonitor,
  preloadResource,
  resultsCache,
  throttle,
  uiStateCache,
} from './performance';
// Upload validation utilities
export {
  type FileValidationResult,
  formatFileSize,
  generateSessionId,
  validateFile,
  validateFilename,
  validateFileSize,
  validateFileType,
  validatePDFContent,
} from './upload-validation';
