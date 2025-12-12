// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Global type declarations for test files
 * Provides more permissive typing for testing scenarios
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toHaveValue(value: string | number): R;
    }
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
