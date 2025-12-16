/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Framework-Independent API Configuration
 *
 * Provides flexible configuration for different deployment scenarios
 * and framework integrations. Supports environment-based configuration
 * and runtime switching between real and mock APIs.
 */

export interface ApiEndpoints {
  upload: string;
  uploadStatus: (sessionId: string) => string;
  analysisStart: string;
  analysisStatus: (sessionId: string) => string;
  analysisResults: (sessionId: string) => string;
  issueDetails: (issueId: string) => string;
  health: string;
}

export interface ApiConfiguration {
  baseUrl: string;
  endpoints: ApiEndpoints;
  useMock: boolean;
  timeout: number;
  retries: number;
  retryDelay: number;
}

/**
 * Default API endpoints structure
 */
const DEFAULT_ENDPOINTS: ApiEndpoints = {
  upload: '/api/documents/upload',
  uploadStatus: (sessionId: string) => `/api/documents/upload/${sessionId}`,
  analysisStart: '/api/analysis/start',
  analysisStatus: (sessionId: string) => `/api/analysis/${sessionId}`,
  analysisResults: (sessionId: string) => `/api/analysis/${sessionId}/results`,
  issueDetails: (issueId: string) => `/api/results/issues/${issueId}`,
  health: '/api/health',
};

/**
 * Environment variable names for configuration
 */
const ENV_VARS = {
  STRANDS_API_URL: 'STRANDS_API_URL',
  MOCK_API_URL: 'MOCK_API_URL',
  USE_MOCK_API: 'USE_MOCK_API',
  API_TIMEOUT: 'API_TIMEOUT',
  API_RETRIES: 'API_RETRIES',
  API_RETRY_DELAY: 'API_RETRY_DELAY',
} as const;

/**
 * Get environment variable with fallback
 */
function getEnvVar(name: string, fallback: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || fallback;
  }
  return fallback;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(name: string, fallback: boolean = false): boolean {
  const value = getEnvVar(name);
  if (!value) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(name: string, fallback: number): number {
  const value = getEnvVar(name);
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Determine if we should use mock APIs
 */
function shouldUseMockApi(): boolean {
  // Explicit environment variable override
  if (getEnvVar(ENV_VARS.USE_MOCK_API)) {
    return getBooleanEnvVar(ENV_VARS.USE_MOCK_API);
  }

  // Development mode defaults to mock
  if (getEnvVar('NODE_ENV') === 'development') {
    return true;
  }

  // Browser-based detection for client-side
  if (typeof window !== 'undefined') {
    // Check URL path for mock indicator
    if (window.location.pathname.includes('/mock')) {
      return true;
    }

    // Check localStorage override
    const mockOverride = localStorage.getItem('use-mock-api');
    if (mockOverride !== null) {
      return mockOverride === 'true';
    }
  }

  return false;
}

/**
 * Get the appropriate API base URL
 */
function getApiBaseUrl(): string {
  const useMock = shouldUseMockApi();

  if (useMock) {
    // Mock API URL (could be Next.js routes, Express server, etc.)
    const mockUrl = getEnvVar(ENV_VARS.MOCK_API_URL);
    if (mockUrl) return mockUrl;

    // Default mock URLs for different environments
    if (typeof window !== 'undefined') {
      // Browser environment - use current origin for Next.js routes
      return window.location.origin;
    } else {
      // Server environment - default to localhost
      return 'http://localhost:3000';
    }
  }

  // Real Strands API URL - prioritize Docker container networking
  const realUrl = getEnvVar(ENV_VARS.STRANDS_API_URL) || getEnvVar('STRANDS_SERVICE_URL');
  if (realUrl) return realUrl;

  // Default real API URL - use Docker service name for server-side, localhost for client-side
  if (typeof window !== 'undefined') {
    // Browser environment - use localhost
    return 'http://localhost:8080';
  } else {
    // Server environment - use Docker service name
    return 'http://strands:8080';
  }
}

/**
 * Create API configuration based on environment
 */
export function createApiConfiguration(overrides?: Partial<ApiConfiguration>): ApiConfiguration {
  const baseConfig: ApiConfiguration = {
    baseUrl: getApiBaseUrl(),
    endpoints: DEFAULT_ENDPOINTS,
    useMock: shouldUseMockApi(),
    timeout: getNumberEnvVar(ENV_VARS.API_TIMEOUT, 30000), // 30 seconds
    retries: getNumberEnvVar(ENV_VARS.API_RETRIES, 3),
    retryDelay: getNumberEnvVar(ENV_VARS.API_RETRY_DELAY, 1000), // 1 second
  };

  return { ...baseConfig, ...overrides };
}

/**
 * Default API configuration instance
 */
export const apiConfiguration = createApiConfiguration();

/**
 * Runtime API configuration switching
 */
export class ApiConfigurationManager {
  private static instance: ApiConfigurationManager;
  private config: ApiConfiguration;
  private listeners: Set<(config: ApiConfiguration) => void> = new Set();

  private constructor() {
    this.config = createApiConfiguration();
  }

  static getInstance(): ApiConfigurationManager {
    if (!ApiConfigurationManager.instance) {
      ApiConfigurationManager.instance = new ApiConfigurationManager();
    }
    return ApiConfigurationManager.instance;
  }

  /**
   * Get current configuration
   */
  getConfiguration(): ApiConfiguration {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfiguration(updates: Partial<ApiConfiguration>): void {
    this.config = { ...this.config, ...updates };
    this.notifyListeners();
  }

  /**
   * Switch to mock API
   */
  useMockApi(mockBaseUrl?: string): void {
    this.updateConfiguration({
      useMock: true,
      baseUrl: mockBaseUrl || this.config.baseUrl,
    });
  }

  /**
   * Switch to real API
   */
  useRealApi(realBaseUrl?: string): void {
    this.updateConfiguration({
      useMock: false,
      baseUrl: realBaseUrl || getEnvVar(ENV_VARS.STRANDS_API_URL, 'http://localhost:8080'),
    });
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (config: ApiConfiguration) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.config);
    });
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.config = createApiConfiguration();
    this.notifyListeners();
  }
}

/**
 * Global configuration manager instance
 */
export const apiConfigManager = ApiConfigurationManager.getInstance();

/**
 * Utility functions for common configuration scenarios
 */
export const ApiConfigUtils = {
  /**
   * Configure for Next.js development
   */
  configureForNextJs(port = 3000): void {
    apiConfigManager.updateConfiguration({
      baseUrl: `http://localhost:${port}`,
      useMock: true,
    });
  },

  /**
   * Configure for Express server
   */
  configureForExpress(port = 8080): void {
    apiConfigManager.updateConfiguration({
      baseUrl: `http://localhost:${port}`,
      useMock: false,
    });
  },

  /**
   * Configure for standalone mock server
   */
  configureForStandaloneMock(port = 8081): void {
    apiConfigManager.updateConfiguration({
      baseUrl: `http://localhost:${port}`,
      useMock: true,
    });
  },

  /**
   * Configure for production
   */
  configureForProduction(apiUrl: string): void {
    apiConfigManager.updateConfiguration({
      baseUrl: apiUrl,
      useMock: false,
      timeout: 60000, // Longer timeout for production
      retries: 5, // More retries for production
    });
  },

  /**
   * Get configuration for current environment
   */
  getEnvironmentConfig(): ApiConfiguration {
    return apiConfigManager.getConfiguration();
  },
};
