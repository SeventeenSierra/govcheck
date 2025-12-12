// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Strands API Client
 *
 * HTTP/REST and WebSocket client for communicating with the Strands service.
 * Provides document upload, analysis orchestration, and results retrieval.
 * Implements requirements 1.1, 2.1, and 3.1 for API integration.
 */

import { apiConfig, errorConfig } from '../config/app';

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
  data: any;
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
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

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
        return { success: true, data };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
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
    
    return errorConfig.codes.NETWORK_ERROR;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
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
        } catch (error) {
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
    this.url = baseUrl.replace('http', 'ws') + '/ws';
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
      typeListeners.forEach(callback => callback(message));
    }
  }

  /**
   * Send message through WebSocket
   */
  send(message: any) {
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

  constructor(baseUrl: string = apiConfig.strandsBaseUrl) {
    this.httpClient = new HttpClient(baseUrl);
    this.wsClient = new WebSocketClient(baseUrl);
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
   * Get upload session status
   */
  async getUploadStatus(sessionId: string): Promise<ApiResponse<UploadSessionResponse>> {
    return this.httpClient.get<UploadSessionResponse>(`/api/documents/upload/${sessionId}`);
  }

  // Analysis Methods

  /**
   * Start compliance analysis
   * Requirement 2.1: Validate against core FAR/DFARS requirements
   */
  async startAnalysis(proposalId: string): Promise<ApiResponse<AnalysisSessionResponse>> {
    return this.httpClient.post<AnalysisSessionResponse>('/api/analysis/start', {
      proposalId,
      frameworks: ['FAR', 'DFARS'],
    });
  }

  /**
   * Get analysis session status
   */
  async getAnalysisStatus(sessionId: string): Promise<ApiResponse<AnalysisSessionResponse>> {
    return this.httpClient.get<AnalysisSessionResponse>(`/api/analysis/${sessionId}`);
  }

  /**
   * Cancel analysis session
   */
  async cancelAnalysis(sessionId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/analysis/${sessionId}`);
  }

  // Results Methods

  /**
   * Get compliance analysis results
   * Requirement 3.1: Show compliance status and findings
   */
  async getResults(proposalId: string): Promise<ApiResponse<ComplianceResultsResponse>> {
    return this.httpClient.get<ComplianceResultsResponse>(`/api/results/${proposalId}`);
  }

  /**
   * Get specific compliance issue details
   */
  async getIssueDetails(issueId: string): Promise<ApiResponse<ComplianceIssue>> {
    return this.httpClient.get<ComplianceIssue>(`/api/results/issues/${issueId}`);
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
  async healthCheck(): Promise<ApiResponse<{ status: string; version: string }>> {
    return this.httpClient.get<{ status: string; version: string }>('/api/health');
  }
}

/**
 * Default Strands API client instance
 */
export const strandsApiClient = new StrandsApiClient();