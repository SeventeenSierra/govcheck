// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Services Layer
 *
 * Business logic and API integration services for the Proposal Prepper
 * threshold functionality. Handles communication with backend services
 * and orchestrates data flow between components.
 */

// Analysis Service
export {
  type AnalysisRequest,
  AnalysisService,
  type AnalysisServiceEvents,
  analysisService,
} from './analysis-service';
// Results Service
export {
  ResultsService,
  type ResultsServiceEvents,
  resultsService,
} from './results-service';
// Strands API Client
export {
  type AnalysisSessionResponse,
  type ApiResponse,
  type ComplianceIssue,
  type ComplianceResultsResponse,
  StrandsApiClient,
  strandsApiClient,
  type UploadSessionResponse,
  type WebSocketMessage,
} from './strands-api-client';
// Upload Service
export {
  UploadService,
  type UploadServiceEvents,
  uploadService,
} from './upload-service';
