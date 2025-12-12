// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Global type declarations for test files
 * Provides more permissive typing for testing scenarios
 */

import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }
}

// Allow accessing private members in tests
declare module '*.test.ts' {
  interface AnalysisService {
    activeSessions: Map<string, unknown>;
    eventHandlers: Record<string, unknown>;
    mapApiResponseToSession: (response: unknown) => unknown;
  }

  interface UploadService {
    activeSessions: Map<string, unknown>;
  }
}

export {};
