// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Application Configuration
 * 
 * Configuration constants and settings for the Proposal Prepper application.
 * Centralizes all configurable values used across components, services, and utilities.
 */

/**
 * File Upload Configuration
 * 
 * Settings for file upload validation and processing.
 * Based on requirements 1.1 and 1.2 for PDF acceptance and validation.
 */
export const uploadConfig = {
  /** Accepted file types (PDF only for MVP) */
  acceptedTypes: ['application/pdf'] as const,
  /** Maximum file size in bytes (100MB) */
  maxFileSize: 100 * 1024 * 1024,
  /** Minimum file size in bytes (1KB) */
  minFileSize: 1024,
  /** Upload chunk size for progress tracking */
  chunkSize: 1024 * 1024, // 1MB chunks
  /** Maximum concurrent uploads */
  maxConcurrentUploads: 1,
  /** Upload timeout in milliseconds */
  uploadTimeout: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Analysis Configuration
 * 
 * Settings for compliance analysis processing.
 * Based on requirements 2.1-2.5 for FAR/DFARS validation.
 */
export const analysisConfig = {
  /** Analysis timeout in milliseconds */
  analysisTimeout: 10 * 60 * 1000, // 10 minutes
  /** Progress update interval in milliseconds */
  progressUpdateInterval: 1000, // 1 second
  /** Maximum retry attempts for failed analysis */
  maxRetryAttempts: 3,
  /** Retry delay in milliseconds */
  retryDelay: 5000, // 5 seconds
  /** Supported compliance frameworks */
  frameworks: ['FAR', 'DFARS'] as const,
} as const;

/**
 * UI Configuration
 * 
 * Settings for user interface behavior and appearance.
 * Based on requirements 4.1-4.5 and 5.1-5.5 for interface functionality.
 */
export const uiConfig = {
  /** Page load timeout target in milliseconds */
  loadTimeTarget: 5000, // 5 seconds (requirement 5.1)
  /** Navigation transition duration in milliseconds */
  transitionDuration: 200,
  /** Progress update frequency in milliseconds */
  progressUpdateFrequency: 500,
  /** Notification auto-dismiss timeout in milliseconds */
  notificationTimeout: 5000,
  /** Maximum notifications to display simultaneously */
  maxNotifications: 5,
  /** Breakpoints for responsive design */
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
} as const;

/**
 * API Configuration
 * 
 * Settings for backend service communication.
 * Configured for the federated mesh architecture.
 */
export const apiConfig = {
  /** Base URL for Strands service */
  strandsBaseUrl: process.env.NEXT_PUBLIC_STRANDS_URL || 'http://localhost:8080',
  /** Base URL for Genkit service */
  genkitBaseUrl: process.env.NEXT_PUBLIC_GENKIT_URL || 'http://localhost:8081',
  /** API request timeout in milliseconds */
  requestTimeout: 30000, // 30 seconds
  /** Maximum retry attempts for API requests */
  maxRetries: 3,
  /** Retry delay in milliseconds */
  retryDelay: 1000,
  /** WebSocket reconnection settings */
  websocket: {
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
} as const;

/**
 * Validation Configuration
 * 
 * Settings for input validation and sanitization.
 */
export const validationConfig = {
  /** Maximum filename length */
  maxFilenameLength: 255,
  /** Allowed filename characters pattern */
  filenamePattern: /^[a-zA-Z0-9._-]+$/,
  /** Maximum session ID length */
  maxSessionIdLength: 128,
  /** Session ID pattern */
  sessionIdPattern: /^[a-zA-Z0-9-]+$/,
} as const;

/**
 * Error Configuration
 * 
 * Settings for error handling and recovery.
 */
export const errorConfig = {
  /** Default error message for unknown errors */
  defaultErrorMessage: 'An unexpected error occurred. Please try again.',
  /** Error codes for specific error types */
  codes: {
    UPLOAD_FAILED: 'UPLOAD_001',
    ANALYSIS_FAILED: 'ANALYSIS_001',
    VALIDATION_FAILED: 'VALIDATION_001',
    NETWORK_ERROR: 'NETWORK_001',
    TIMEOUT_ERROR: 'TIMEOUT_001',
  },
  /** Error recovery strategies */
  recovery: {
    autoRetry: true,
    maxAutoRetries: 2,
    retryDelay: 2000,
  },
} as const;

/**
 * Feature Flags
 * 
 * Configuration for enabling/disabling features during development
 * and deployment phases.
 */
export const featureFlags = {
  /** Enable detailed logging for debugging */
  enableDetailedLogging: process.env.NODE_ENV === 'development',
  /** Enable performance monitoring */
  enablePerformanceMonitoring: true,
  /** Enable error reporting */
  enableErrorReporting: process.env.NODE_ENV === 'production',
  /** Enable advanced analysis features (future enhancement) */
  enableAdvancedAnalysis: false,
  /** Enable real-time progress updates */
  enableRealTimeUpdates: true,
} as const;