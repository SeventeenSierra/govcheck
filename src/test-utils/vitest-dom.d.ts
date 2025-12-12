// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Comprehensive Vitest DOM Type Declarations
 * 
 * This file provides multiple approaches to ensure DOM matchers are available
 * in both the TypeScript compiler and IDE environments.
 */

/// <reference types="@testing-library/jest-dom" />
/// <reference types="vitest/globals" />

import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Extend Vitest's Assertion interface
declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
}

// Global namespace extensions for broader compatibility
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends TestingLibraryMatchers<T, void> {}
  }
  
  namespace jest {
    interface Matchers<R> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
  
  // Direct expect interface extension as fallback
  interface Expect {
    <T = any>(actual: T): TestingLibraryMatchers<T, void> & import('vitest').Assertion<T>;
  }
}

// Module augmentation for @testing-library/jest-dom
declare module '@testing-library/jest-dom' {
  interface TestingLibraryMatchers<R = void, T = {}> {
    toBeInTheDocument(): R;
    toHaveValue(value?: string | string[] | number): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toHaveClass(...classNames: string[]): R;
    toHaveAttribute(attr: string, value?: string): R;
    toBeVisible(): R;
    toBeChecked(): R;
    toHaveTextContent(text: string | RegExp): R;
  }
}

export {};