// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Strands Service Integration Utilities
 *
 * Provides utilities for managing the integration between the web service
 * and the Strands service, including health monitoring, service discovery,
 * and error recovery.
 */

import { strandsApiClient, StrandsApiClient } from './strands-api-client';
import { apiConfigManager } from '../config/api-config';

/**
 * Service integration status
 */
export interface ServiceIntegrationStatus {
  connected: boolean;
  healthy: boolean;
  baseUrl: string;
  lastChecked: number;
  error?: string;
  checks?: Record<string, string>;
  version?: string;
}

/**
 * Service integration manager
 */
export class StrandsIntegrationManager {
  private static instance: StrandsIntegrationManager;
  private client: StrandsApiClient;
  private status: ServiceIntegrationStatus | null = null;
  private statusListeners: Set<(status: ServiceIntegrationStatus) => void> = new Set();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthCheckIntervalMs = 30000; // 30 seconds

  private constructor() {
    this.client = strandsApiClient;

    // Listen for configuration changes
    apiConfigManager.subscribe((config) => {
      this.client = new StrandsApiClient(config.baseUrl);
      this.checkServiceHealth();
    });
  }

  static getInstance(): StrandsIntegrationManager {
    if (!StrandsIntegrationManager.instance) {
      StrandsIntegrationManager.instance = new StrandsIntegrationManager();
    }
    return StrandsIntegrationManager.instance;
  }

  /**
   * Get the current Strands API client
   */
  getClient(): StrandsApiClient {
    return this.client;
  }

  /**
   * Get current service integration status
   */
  getStatus(): ServiceIntegrationStatus | null {
    return this.status;
  }

  /**
   * Check service health and update status
   */
  async checkServiceHealth(): Promise<ServiceIntegrationStatus> {
    try {
      const serviceStatus = await this.client.getServiceStatus();

      this.status = {
        connected: true,
        healthy: serviceStatus.healthy,
        baseUrl: serviceStatus.baseUrl,
        lastChecked: Date.now(),
        error: serviceStatus.error,
        checks: serviceStatus.checks,
        version: serviceStatus.version,
      };
    } catch (error) {
      this.status = {
        connected: false,
        healthy: false,
        baseUrl: this.client.getBaseUrl(),
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Notify listeners
    this.notifyStatusListeners();
    return this.status;
  }

  /**
   * Start periodic health monitoring
   */
  startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Initial check
    this.checkServiceHealth();

    // Periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.checkServiceHealth();
    }, this.healthCheckIntervalMs);
  }

  /**
   * Stop periodic health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Subscribe to status changes
   */
  subscribeToStatus(listener: (status: ServiceIntegrationStatus) => void): () => void {
    this.statusListeners.add(listener);

    // Send current status immediately if available
    if (this.status) {
      listener(this.status);
    }

    return () => this.statusListeners.delete(listener);
  }

  /**
   * Notify all status listeners
   */
  private notifyStatusListeners(): void {
    if (this.status) {
      this.statusListeners.forEach((listener) => listener(this.status!));
    }
  }

  /**
   * Wait for service to become available
   */
  async waitForService(timeoutMs: number = 60000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      await this.checkServiceHealth();

      if (this.status?.healthy) {
        return true;
      }

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return false;
  }

  /**
   * Attempt to recover service connection
   */
  async recoverConnection(): Promise<boolean> {
    // Try different base URLs if the current one fails
    const fallbackUrls = [
      'http://strands:8080', // Docker container name
      'http://localhost:8080', // Local development
      'http://127.0.0.1:8080', // Alternative localhost
    ];

    for (const url of fallbackUrls) {
      try {
        const testClient = new StrandsApiClient(url);
        const healthy = await testClient.isServiceHealthy();

        if (healthy) {
          // Update configuration to use this URL
          apiConfigManager.updateConfiguration({ baseUrl: url });
          await this.checkServiceHealth();
          return true;
        }
      } catch (error) {
        // Continue to next URL
        continue;
      }
    }

    return false;
  }

  /**
   * Get service readiness for operations
   */
  isReadyForOperations(): boolean {
    return this.status?.healthy === true;
  }

  /**
   * Get human-readable status message
   */
  getStatusMessage(): string {
    if (!this.status) {
      return 'Service status unknown';
    }

    if (this.status.healthy) {
      return `Service healthy (${this.status.version || 'unknown version'})`;
    }

    if (this.status.connected) {
      return `Service connected but unhealthy: ${this.status.error || 'Unknown issue'}`;
    }

    return `Service unavailable: ${this.status.error || 'Cannot connect'}`;
  }
}

/**
 * Global service integration manager instance
 */
export const strandsIntegration = StrandsIntegrationManager.getInstance();

/**
 * Utility functions for service integration
 */
export const StrandsIntegrationUtils = {
  /**
   * Initialize service integration for the application
   */
  async initialize(): Promise<void> {
    strandsIntegration.startHealthMonitoring();

    // Wait for initial health check
    await strandsIntegration.checkServiceHealth();
  },

  /**
   * Cleanup service integration
   */
  cleanup(): void {
    strandsIntegration.stopHealthMonitoring();
  },

  /**
   * Check if service is ready and show user-friendly error if not
   */
  async ensureServiceReady(): Promise<{ ready: boolean; message?: string }> {
    const status = await strandsIntegration.checkServiceHealth();

    if (status.healthy) {
      return { ready: true };
    }

    let message = 'The analysis service is currently unavailable.';

    if (!status.connected) {
      message += ' Please ensure the Strands service is running.';
    } else if (status.error) {
      message += ` Error: ${status.error}`;
    }

    return { ready: false, message };
  },

  /**
   * Get current service configuration
   */
  getServiceConfig(): { baseUrl: string; healthy: boolean; version?: string } {
    const status = strandsIntegration.getStatus();
    const client = strandsIntegration.getClient();

    return {
      baseUrl: client.getBaseUrl(),
      healthy: status?.healthy || false,
      version: status?.version,
    };
  },
};
