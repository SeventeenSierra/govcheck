// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Strands Integration Tests
 *
 * Unit tests for the Strands service integration utilities.
 * Tests service status monitoring, health checks, and error recovery.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StrandsIntegrationManager, StrandsIntegrationUtils } from './strands-integration';

// Mock the strands API client
vi.mock('./strands-api-client', () => ({
  strandsApiClient: {
    getServiceStatus: vi.fn(),
    isServiceHealthy: vi.fn(),
    getBaseUrl: vi.fn(() => 'http://localhost:8080'),
  },
  StrandsApiClient: vi.fn().mockImplementation(() => ({
    getServiceStatus: vi.fn(),
    isServiceHealthy: vi.fn(),
    getBaseUrl: vi.fn(() => 'http://localhost:8080'),
  })),
}));

// Mock the API config manager
vi.mock('../config/api-config', () => ({
  apiConfigManager: {
    subscribe: vi.fn(() => () => {}),
    updateConfiguration: vi.fn(),
  },
}));

describe('StrandsIntegrationManager', () => {
  let manager: StrandsIntegrationManager;

  beforeEach(() => {
    manager = StrandsIntegrationManager.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    manager.stopHealthMonitoring();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = StrandsIntegrationManager.getInstance();
      const instance2 = StrandsIntegrationManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getClient', () => {
    it('should return API client', () => {
      const client = manager.getClient();
      expect(client).toBeDefined();
      expect(typeof client.getBaseUrl).toBe('function');
    });
  });

  describe('checkServiceHealth', () => {
    it('should check service health and update status', async () => {
      const mockServiceStatus = {
        healthy: true,
        baseUrl: 'http://localhost:8080',
        status: 'healthy',
        version: '1.0.0',
        lastChecked: Date.now(),
      };

      const client = manager.getClient();
      vi.mocked(client.getServiceStatus).mockResolvedValue(mockServiceStatus);

      const status = await manager.checkServiceHealth();

      expect(status.healthy).toBe(true);
      expect(status.baseUrl).toBe('http://localhost:8080');
      expect(status.version).toBe('1.0.0');
    });

    it('should handle service health check errors', async () => {
      const client = manager.getClient();
      vi.mocked(client.getServiceStatus).mockRejectedValue(new Error('Connection failed'));

      const status = await manager.checkServiceHealth();

      expect(status.healthy).toBe(false);
      expect(status.connected).toBe(false);
      expect(status.error).toBe('Connection failed');
    });
  });

  describe('subscribeToStatus', () => {
    it('should allow subscribing to status changes', async () => {
      const listener = vi.fn();
      const unsubscribe = manager.subscribeToStatus(listener);

      // Mock service status
      const client = manager.getClient();
      vi.mocked(client.getServiceStatus).mockResolvedValue({
        healthy: true,
        baseUrl: 'http://localhost:8080',
        status: 'healthy',
        version: '1.0.0',
        lastChecked: Date.now(),
      });

      await manager.checkServiceHealth();

      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });
  });

  describe('isReadyForOperations', () => {
    it('should return true when service is healthy', async () => {
      const client = manager.getClient();
      vi.mocked(client.getServiceStatus).mockResolvedValue({
        healthy: true,
        baseUrl: 'http://localhost:8080',
        status: 'healthy',
        version: '1.0.0',
        lastChecked: Date.now(),
      });

      await manager.checkServiceHealth();
      expect(manager.isReadyForOperations()).toBe(true);
    });

    it('should return false when service is unhealthy', async () => {
      const client = manager.getClient();
      vi.mocked(client.getServiceStatus).mockResolvedValue({
        healthy: false,
        baseUrl: 'http://localhost:8080',
        error: 'Service unavailable',
        lastChecked: Date.now(),
      });

      await manager.checkServiceHealth();
      expect(manager.isReadyForOperations()).toBe(false);
    });
  });

  describe('getStatusMessage', () => {
    it('should return appropriate status messages', async () => {
      // Test healthy status
      const client = manager.getClient();
      vi.mocked(client.getServiceStatus).mockResolvedValue({
        healthy: true,
        baseUrl: 'http://localhost:8080',
        status: 'healthy',
        version: '1.0.0',
        lastChecked: Date.now(),
      });

      await manager.checkServiceHealth();
      expect(manager.getStatusMessage()).toContain('Service healthy');

      // Test unhealthy status
      vi.mocked(client.getServiceStatus).mockRejectedValue(new Error('Connection failed'));

      await manager.checkServiceHealth();
      expect(manager.getStatusMessage()).toContain('Service unavailable');
    });
  });
});

describe('StrandsIntegrationUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureServiceReady', () => {
    it('should return ready when service is healthy', async () => {
      const manager = StrandsIntegrationManager.getInstance();
      const client = manager.getClient();
      
      vi.mocked(client.getServiceStatus).mockResolvedValue({
        healthy: true,
        baseUrl: 'http://localhost:8080',
        status: 'healthy',
        version: '1.0.0',
        lastChecked: Date.now(),
      });

      const result = await StrandsIntegrationUtils.ensureServiceReady();
      expect(result.ready).toBe(true);
    });

    it('should return not ready when service is unhealthy', async () => {
      const manager = StrandsIntegrationManager.getInstance();
      const client = manager.getClient();
      
      vi.mocked(client.getServiceStatus).mockResolvedValue({
        healthy: false,
        baseUrl: 'http://localhost:8080',
        error: 'Service unavailable',
        lastChecked: Date.now(),
      });

      const result = await StrandsIntegrationUtils.ensureServiceReady();
      expect(result.ready).toBe(false);
      expect(result.message).toContain('analysis service is currently unavailable');
    });
  });

  describe('getServiceConfig', () => {
    it('should return service configuration', () => {
      const config = StrandsIntegrationUtils.getServiceConfig();
      expect(config).toHaveProperty('baseUrl');
      expect(config).toHaveProperty('healthy');
    });
  });
});