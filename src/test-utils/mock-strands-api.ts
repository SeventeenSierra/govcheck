// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Mock utilities for StrandsApiClient in tests
 */

import { vi } from 'vitest';

export type MockStrandsApiClient = {
  // Analysis methods
  startAnalysis: ReturnType<typeof vi.fn>;
  getAnalysisStatus: ReturnType<typeof vi.fn>;
  cancelAnalysis: ReturnType<typeof vi.fn>;

  // Upload methods
  uploadDocument: ReturnType<typeof vi.fn>;
  getUploadStatus: ReturnType<typeof vi.fn>;

  // Results methods
  getResults: ReturnType<typeof vi.fn>;
  getIssueDetails: ReturnType<typeof vi.fn>;

  // WebSocket methods
  connectWebSocket: ReturnType<typeof vi.fn>;
  disconnectWebSocket: ReturnType<typeof vi.fn>;
  subscribeToAnalysisProgress: ReturnType<typeof vi.fn>;
  subscribeToAnalysisComplete: ReturnType<typeof vi.fn>;
  subscribeToUploadProgress: ReturnType<typeof vi.fn>;
  subscribeToErrors: ReturnType<typeof vi.fn>;
};

export function createMockStrandsApiClient(): MockStrandsApiClient {
  return {
    startAnalysis: vi.fn(),
    getAnalysisStatus: vi.fn(),
    cancelAnalysis: vi.fn(),
    uploadDocument: vi.fn(),
    getUploadStatus: vi.fn(),
    getResults: vi.fn(),
    getIssueDetails: vi.fn(),
    connectWebSocket: vi.fn(),
    disconnectWebSocket: vi.fn(),
    subscribeToAnalysisProgress: vi.fn(),
    subscribeToAnalysisComplete: vi.fn(),
    subscribeToUploadProgress: vi.fn(),
    subscribeToErrors: vi.fn(),
  };
}
