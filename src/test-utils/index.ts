// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Test Utilities
 * 
 * Centralized exports for all testing utilities used across the
 * threshold functionality tests.
 */

export * from './property-testing';

/**
 * Common Test Helpers
 * 
 * Shared utilities for setting up test environments and mocking
 * common dependencies.
 */

/**
 * Mock Upload Session
 * 
 * Creates a mock upload session for testing components that
 * depend on upload state.
 */
export function createMockUploadSession(overrides = {}) {
  return {
    id: 'test-upload-123',
    filename: 'test-proposal.pdf',
    fileSize: 1024 * 1024, // 1MB
    mimeType: 'application/pdf',
    status: 'pending' as const,
    progress: 0,
    startedAt: new Date(),
    ...overrides,
  };
}

/**
 * Mock Analysis Session
 * 
 * Creates a mock analysis session for testing components that
 * depend on analysis state.
 */
export function createMockAnalysisSession(overrides = {}) {
  return {
    id: 'test-analysis-456',
    proposalId: 'test-proposal-789',
    status: 'queued' as const,
    progress: 0,
    startedAt: new Date(),
    currentStep: 'Initializing analysis',
    ...overrides,
  };
}

/**
 * Mock UI State
 * 
 * Creates a mock UI state for testing navigation and state
 * management components.
 */
export function createMockUIState(overrides = {}) {
  return {
    currentView: 'dashboard' as const,
    navigationHistory: ['/dashboard'],
    notifications: [],
    preferences: {
      theme: 'system' as const,
      showDetailedProgress: true,
      autoDismissNotifications: true,
      notificationTimeout: 5000,
      showAdvancedOptions: false,
    },
    ...overrides,
  };
}