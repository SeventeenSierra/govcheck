// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Services Layer
 *
 * Business logic and API integration services for the Proposal Prepper
 * threshold functionality. Handles communication with backend services
 * and orchestrates data flow between components.
 */

// Strands API Client
export {
  StrandsApiClient,
  strandsApiClient,
  type ApiResponse,
  type UploadSessionResponse,
  type AnalysisSessionResponse,
  type ComplianceResultsResponse,
  type ComplianceIssue,
  type WebSocketMessage,
} from './strands-api-client';

// Upload Service
export {
  UploadService,
  uploadService,
  type UploadServiceEvents,
} from './upload-service';

// Analysis Service
export {
  AnalysisService,
  analysisService,
  type AnalysisServiceEvents,
  type AnalysisRequest,
} from './analysis-service';

// Results Service
export {
  ResultsService,
  resultsService,
  type ResultsServiceEvents,
} from './results-service';
