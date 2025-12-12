// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Application Type Definitions
 *
 * Core TypeScript interfaces and types for the Proposal Prepper application.
 * These types define the data models used across the upload, analysis,
 * and results presentation components.
 */

/**
 * Upload Session Management
 *
 * Tracks the state and progress of document upload operations.
 * Used by the Upload Manager component to provide user feedback
 * and handle upload lifecycle events.
 */
export interface UploadSession {
  /** Unique identifier for the upload session */
  id: string;
  /** Original filename of the uploaded document */
  filename: string;
  /** File size in bytes */
  fileSize: number;
  /** MIME type of the uploaded file */
  mimeType: string;
  /** Current status of the upload operation */
  status: UploadStatus;
  /** Upload progress as percentage (0-100) */
  progress: number;
  /** Timestamp when upload was initiated */
  startedAt: Date;
  /** Timestamp when upload completed (if applicable) */
  completedAt?: Date;
  /** Error message if upload failed */
  errorMessage?: string;
}

/**
 * Upload Status Enumeration
 *
 * Defines the possible states of an upload operation throughout
 * its lifecycle from initiation to completion or failure.
 */
export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Analysis Session Management
 *
 * Tracks the state and progress of compliance analysis operations.
 * Used by the Analysis Coordinator component to orchestrate the
 * analysis workflow and provide progress feedback.
 */
export interface AnalysisSession {
  /** Unique identifier for the analysis session */
  id: string;
  /** Reference to the proposal being analyzed */
  proposalId: string;
  /** Current status of the analysis operation */
  status: AnalysisStatus;
  /** Analysis progress as percentage (0-100) */
  progress: number;
  /** Timestamp when analysis was initiated */
  startedAt: Date;
  /** Timestamp when analysis completed (if applicable) */
  completedAt?: Date;
  /** Estimated completion time (if available) */
  estimatedCompletion?: Date;
  /** Description of current analysis step */
  currentStep: string;
}

/**
 * Analysis Status Enumeration
 *
 * Defines the possible states of an analysis operation throughout
 * the compliance checking workflow.
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
 * User Interface State Management
 *
 * Manages the overall state of the user interface including
 * navigation, active sessions, and user preferences.
 * Used by the Navigation Controller and UI components.
 */
export interface UIState {
  /** Current view being displayed */
  currentView: ViewType;
  /** History of navigation for breadcrumbs and back navigation */
  navigationHistory: string[];
  /** Currently active upload session (if any) */
  activeUpload?: UploadSession;
  /** Currently active analysis session (if any) */
  activeAnalysis?: AnalysisSession;
  /** System notifications and messages */
  notifications: Notification[];
  /** User preferences and settings */
  preferences: UserPreferences;
}

/**
 * View Type Enumeration
 *
 * Defines the different views/pages available in the application
 * for navigation and routing purposes.
 */
export enum ViewType {
  DASHBOARD = 'dashboard',
  UPLOAD = 'upload',
  ANALYSIS = 'analysis',
  RESULTS = 'results',
  SETTINGS = 'settings',
}

/**
 * System Notification
 *
 * Represents user-facing notifications for system events,
 * errors, and status updates.
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** Notification type for styling and behavior */
  type: NotificationType;
  /** Main notification message */
  message: string;
  /** Optional detailed description */
  description?: string;
  /** Timestamp when notification was created */
  timestamp: Date;
  /** Whether notification has been read by user */
  read: boolean;
  /** Auto-dismiss timeout in milliseconds (if applicable) */
  timeout?: number;
}

/**
 * Notification Type Enumeration
 *
 * Defines the different types of notifications for appropriate
 * styling and user interaction patterns.
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Issue Severity Enumeration
 *
 * Defines the severity levels for compliance issues found during analysis.
 * Used across analysis, validation, and results components.
 */
export enum IssueSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * User Preferences
 *
 * Stores user-configurable settings and preferences for
 * personalizing the application experience.
 */
export interface UserPreferences {
  /** Preferred theme (light/dark) */
  theme: 'light' | 'dark' | 'system';
  /** Whether to show detailed progress information */
  showDetailedProgress: boolean;
  /** Whether to auto-dismiss success notifications */
  autoDismissNotifications: boolean;
  /** Preferred notification timeout in milliseconds */
  notificationTimeout: number;
  /** Whether to show advanced analysis options */
  showAdvancedOptions: boolean;
}
