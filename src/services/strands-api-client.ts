// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Strands API Client
 *
 * HTTP/REST and WebSocket client for communicating with the Strands service.
 * Provides document upload, analysis orchestration, and results retrieval.
 * Implements requirements 1.1, 2.1, and 3.1 for API integration.
 *
 * Performance optimizations for Requirement 5.1: Load time performance
 */

import { apiConfig, errorConfig } from '../config/app';
import { apiCache, PerformanceMonitor } from '../utils/performance';

/**
 * API Response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Upload session data from Strands API
 */
export interface UploadSessionResponse {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

/**
 * Analysis session data from Strands API
 */
export interface AnalysisSessionResponse {
  id: string;
  proposalId: string;
  status: 'queued' | 'extracting' | 'analyzing' | 'validating' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  estimatedCompletion?: string;
  currentStep: string;
}

/**
 * Compliance results from Strands API
 */
export interface ComplianceResultsResponse {
  id: string;
  proposalId: string;
  status: 'pass' | 'fail' | 'warning';
  issues: ComplianceIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    warningIssues: number;
  };
  generatedAt: string;
}

/**
 * Individual compliance issue
 */
export interface ComplianceIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  regulation: {
    framework: 'FAR' | 'DFARS';
    section: string;
    reference: string;
  };
  location?: {
    page: number;
    section: string;
    text: string;
  };
  remediation?: string;
}

/**
 * WebSocket message types for real-time updates
 */
export interface WebSocketMessage {
  type: 'upload_progress' | 'analysis_progress' | 'analysis_complete' | 'error';
  sessionId: string;
  data: unknown;
}

/**
 * HTTP client with retry logic and error handling
 */
class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.timeout = apiConfig.requestTimeout;
    this.maxRetries = apiConfig.maxRetries;
    this.retryDelay = apiConfig.retryDelay;
  }

  /**
   * Make HTTP request with retry logic and caching
   * Performance optimization for Requirement 5.1
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<ApiResponse<T>> {
    // Check cache for GET requests
    if (options.method === 'GET' && cacheKey) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached as T };
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    // Performance monitoring
    const requestId = `api-request-${Date.now()}`;
    PerformanceMonitor.mark(`${requestId}-start`);

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful GET responses
        if (options.method === 'GET' && cacheKey && data) {
          apiCache.set(cacheKey, data, cacheTTL);
        }

        // Performance monitoring
        PerformanceMonitor.mark(`${requestId}-end`);
        const duration = PerformanceMonitor.measure(
          requestId,
          `${requestId}-start`,
          `${requestId}-end`
        );
        if (duration && duration > 1000) {
          console.warn(`Slow API request: ${endpoint} took ${duration}ms`);
        }

        return { success: true, data };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || errorConfig.defaultErrorMessage,
      code: this.getErrorCode(lastError),
    };
  }

  /**
   * Get appropriate error code based on error type
   */
  private getErrorCode(error: Error | null): string {
    if (!error) return errorConfig.codes.NETWORK_ERROR;

    if (error.name === 'AbortError') {
      return errorConfig.codes.TIMEOUT_ERROR;
    }

    if (error.message.includes('HTTP 4')) {
      return errorConfig.codes.VALIDATION_FAILED;
    }

    // Check for specific connection errors
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNRESET')
    ) {
      return 'SERVICE_UNAVAILABLE';
    }

    if (error.message.includes('HTTP 5')) {
      return 'SERVICE_ERROR';
    }

    return errorConfig.codes.NETWORK_ERROR;
  }

  /**
   * GET request with caching
   */
  async get<T>(endpoint: string, cacheTTL?: number): Promise<ApiResponse<T>> {
    const cacheKey = `GET:${endpoint}`;
    return this.makeRequest<T>(endpoint, { method: 'GET' }, cacheKey, cacheTTL);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadSessionResponse>> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve({ success: true, data });
          } else {
            resolve({
              success: false,
              error: `Upload failed: ${xhr.statusText}`,
              code: errorConfig.codes.UPLOAD_FAILED,
            });
          }
        } catch (_error) {
          resolve({
            success: false,
            error: 'Failed to parse upload response',
            code: errorConfig.codes.UPLOAD_FAILED,
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Upload network error',
          code: errorConfig.codes.NETWORK_ERROR,
        });
      });

      xhr.addEventListener('timeout', () => {
        resolve({
          success: false,
          error: 'Upload timeout',
          code: errorConfig.codes.TIMEOUT_ERROR,
        });
      });

      xhr.timeout = this.timeout;
      xhr.open('POST', `${this.baseUrl}${endpoint}`);
      xhr.send(formData);
    });
  }
}

/**
 * WebSocket client for real-time updates
 */
class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();

  constructor(baseUrl: string) {
    this.url = `${baseUrl.replace('http', 'ws')}/ws`;
    this.maxReconnectAttempts = apiConfig.websocket.maxReconnectAttempts;
    this.reconnectInterval = apiConfig.websocket.reconnectInterval;
  }

  /**
   * Connect to WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.notifyListeners(message.type, message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          this.handleDisconnection();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle WebSocket disconnection with reconnection logic
   */
  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  /**
   * Subscribe to WebSocket messages of a specific type
   */
  subscribe(type: string, callback: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  /**
   * Unsubscribe from WebSocket messages
   */
  unsubscribe(type: string, callback: (message: WebSocketMessage) => void) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(callback);
    }
  }

  /**
   * Notify all listeners of a message type
   */
  private notifyListeners(type: string, message: WebSocketMessage) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach((callback) => {
        callback(message);
      });
    }
  }

  /**
   * Send message through WebSocket
   */
  send(message: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

/**
 * Main Strands API Client
 *
 * Provides HTTP/REST and WebSocket communication with the Strands service.
 * Implements error handling, retry logic, and real-time updates.
 */
export class StrandsApiClient {
  private httpClient: HttpClient;
  private wsClient: WebSocketClient;
  private baseUrl: string;
  private lastHealthCheck: { timestamp: number; healthy: boolean } | null = null;
  private healthCheckCacheMs = 30000; // Cache health check for 30 seconds

  constructor(baseUrl: string = apiConfig.strandsBaseUrl) {
    this.baseUrl = baseUrl;
    this.httpClient = new HttpClient(baseUrl);
    this.wsClient = new WebSocketClient(baseUrl);
  }

  /**
   * Get the base URL being used by this client
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Document Upload Methods

  /**
   * Upload a document file
   * Requirement 1.1: Accept PDF format files
   */
  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadSessionResponse>> {
    return this.httpClient.uploadFile('/api/documents/upload', file, onProgress);
  }

  /**
   * Get upload session status with short-term caching
   */
  async getUploadStatus(sessionId: string): Promise<ApiResponse<UploadSessionResponse>> {
    return this.httpClient.get<UploadSessionResponse>(`/api/documents/upload/${sessionId}`, 30000); // 30 seconds cache
  }

  // Analysis Methods

  /**
   * Start compliance analysis
   * Requirement 2.1: Validate against core FAR/DFARS requirements
   */
  async startAnalysis(
    proposalId: string,
    documentId?: string,
    filename?: string
  ): Promise<ApiResponse<AnalysisSessionResponse>> {
    // Check service health before attempting analysis
    if (!(await this.isServiceHealthy())) {
      return {
        success: false,
        error: 'Strands service is not available. Please try again later.',
        code: 'SERVICE_UNAVAILABLE',
      };
    }

    return this.httpClient.post<AnalysisSessionResponse>('/api/analysis/start', {
      proposal_id: proposalId,
      document_id: documentId || proposalId,
      filename: filename || 'document.pdf',
      frameworks: ['FAR', 'DFARS'],
    });
  }

  /**
   * Get analysis session status with short-term caching
   */
  async getAnalysisStatus(sessionId: string): Promise<ApiResponse<AnalysisSessionResponse>> {
    return this.httpClient.get<AnalysisSessionResponse>(`/api/analysis/${sessionId}`, 15000); // 15 seconds cache
  }

  /**
   * Cancel analysis session
   */
  async cancelAnalysis(sessionId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/analysis/${sessionId}`);
  }

  // Results Methods

  /**
   * Get compliance analysis results with longer caching
   * Requirement 3.1: Show compliance status and findings
   */
  async getResults(sessionId: string): Promise<ApiResponse<ComplianceResultsResponse>> {
    return this.httpClient.get<ComplianceResultsResponse>(
      `/api/analysis/${sessionId}/results`,
      300000
    ); // 5 minutes cache
  }

  /**
   * Get specific compliance issue details with caching
   */
  async getIssueDetails(issueId: string): Promise<ApiResponse<ComplianceIssue>> {
    return this.httpClient.get<ComplianceIssue>(`/api/results/issues/${issueId}`, 600000); // 10 minutes cache
  }

  // WebSocket Methods

  /**
   * Connect to real-time updates
   */
  async connectWebSocket(): Promise<void> {
    return this.wsClient.connect();
  }

  /**
   * Subscribe to upload progress updates
   */
  subscribeToUploadProgress(callback: (progress: WebSocketMessage) => void) {
    this.wsClient.subscribe('upload_progress', callback);
  }

  /**
   * Subscribe to analysis progress updates
   */
  subscribeToAnalysisProgress(callback: (progress: WebSocketMessage) => void) {
    this.wsClient.subscribe('analysis_progress', callback);
  }

  /**
   * Subscribe to analysis completion
   */
  subscribeToAnalysisComplete(callback: (result: WebSocketMessage) => void) {
    this.wsClient.subscribe('analysis_complete', callback);
  }

  /**
   * Subscribe to error notifications
   */
  subscribeToErrors(callback: (error: WebSocketMessage) => void) {
    this.wsClient.subscribe('error', callback);
  }

  /**
   * Unsubscribe from WebSocket updates
   */
  unsubscribe(type: string, callback: (message: WebSocketMessage) => void) {
    this.wsClient.unsubscribe(type, callback);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnectWebSocket() {
    this.wsClient.disconnect();
  }

  /**
   * Check WebSocket connection status
   */
  isWebSocketConnected(): boolean {
    return this.wsClient.isConnected();
  }

  // Health Check

  /**
   * Check if Strands service is available
   */
  async healthCheck(): Promise<
    ApiResponse<{ status: string; version: string; checks?: Record<string, string> }>
  > {
    const result = await this.httpClient.get<{
      status: string;
      version: string;
      checks?: Record<string, string>;
    }>('/api/health');

    // Update health check cache
    this.lastHealthCheck = {
      timestamp: Date.now(),
      healthy:
        result.success && (result.data?.status === 'healthy' || result.data?.status === 'degraded'),
    };

    return result;
  }

  /**
   * Check if Strands service is healthy and ready for requests
   * Uses cached result if available and recent
   */
  async isServiceHealthy(): Promise<boolean> {
    // Use cached result if available and recent
    if (
      this.lastHealthCheck &&
      Date.now() - this.lastHealthCheck.timestamp < this.healthCheckCacheMs
    ) {
      return this.lastHealthCheck.healthy;
    }

    try {
      const result = await this.healthCheck();
      return (
        result.success && (result.data?.status === 'healthy' || result.data?.status === 'degraded')
      );
    } catch (error) {
      // Update cache with failure
      this.lastHealthCheck = {
        timestamp: Date.now(),
        healthy: false,
      };
      return false;
    }
  }

  /**
   * Wait for service to become healthy with timeout
   */
  async waitForService(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 2000; // Check every 2 seconds

    while (Date.now() - startTime < timeoutMs) {
      if (await this.isServiceHealthy()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }
    return false;
  }

  /**
   * Get detailed service status including all health checks
   */
  async getServiceStatus(): Promise<{
    healthy: boolean;
    baseUrl: string;
    status?: string;
    version?: string;
    checks?: Record<string, string>;
    lastChecked?: number;
    error?: string;
  }> {
    try {
      const result = await this.healthCheck();

      return {
        healthy:
          result.success &&
          (result.data?.status === 'healthy' || result.data?.status === 'degraded'),
        baseUrl: this.baseUrl,
        status: result.data?.status,
        version: result.data?.version,
        checks: result.data?.checks,
        lastChecked: Date.now(),
        error: result.success ? undefined : result.error,
      };
    } catch (error) {
      return {
        healthy: false,
        baseUrl: this.baseUrl,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Smart API client factory that switches between real and mock APIs
 * Now uses framework-independent configuration with Docker support
 */
function createStrandsApiClient() {
  // Import configuration dynamically to avoid circular dependencies
  let config;
  try {
    const configModule = require('../config/api-config');
    config = configModule.apiConfiguration;
  } catch (error) {
    // Fallback configuration if api-config is not available
    const baseUrl = apiConfig.useMockApis ? 'http://localhost:3000' : apiConfig.strandsBaseUrl;

    config = {
      baseUrl,
      useMock: apiConfig.useMockApis,
    };
  }

  return new StrandsApiClient(config.baseUrl);
}

/**
 * Create a Strands API client with explicit configuration
 * Useful for testing or specific deployment scenarios
 */
export function createStrandsApiClientWithConfig(baseUrl: string, useMock: boolean = false) {
  return new StrandsApiClient(baseUrl);
}

/**
 * Default Strands API client instance
 * Automatically switches between real and mock APIs based on environment
 */
export const strandsApiClient = createStrandsApiClient();
