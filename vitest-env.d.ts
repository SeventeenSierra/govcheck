// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Vitest Environment Type Declarations
 * 
 * This file extends Vitest's expect interface with Testing Library matchers
 * to ensure all DOM testing matchers are available in test files.
 * 
 * CRITICAL: This file must be included in both tsconfig.json and tsconfig.test.json
 * to ensure IDE TypeScript Language Service recognizes the type extensions.
 */

/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
}

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends TestingLibraryMatchers<T, void> {}
  }
  
  // Ensure expect is properly typed with Testing Library matchers
  namespace jest {
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}