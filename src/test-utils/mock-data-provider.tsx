/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import React from 'react';
import { MockStrandsAPIEnhanced } from './mock-strands-api-enhanced';
import {
  generateMockUploadSession,
  generateMockAnalysisSession,
  generateMockAnalysisResults,
  generateMockFile,
} from '@/seed-data/grants';

/**
 * Error scenarios for testing
 */
export enum ErrorScenario {
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  ANALYSIS_FAILED = 'analysis_failed',
  UPLOAD_FAILED = 'upload_failed',
  VALIDATION_ERROR = 'validation_error',
}
import { UploadStatus } from '@/types/app';

/**
 * Comprehensive mock data provider for Storybook stories
 * Centralizes all mock data generation and API mocking
 */

export interface MockDataConfig {
  uploadStatus?: UploadStatus;
  analysisStatus?: 'queued' | 'extracting' | 'analyzing' | 'validating' | 'completed' | 'failed';
  complianceStatus?: 'pass' | 'fail' | 'warning';
  errorScenario?: ErrorScenario;
  delay?: number;
}

/**
 * Mock data context for providing consistent mock data across components
 */
export interface MockDataContextValue {
  mockAPI: MockStrandsAPIEnhanced;
  mockData: {
    uploadSession: any;
    analysisSession: any;
    analysisResults: any;
    mockFile: File;
  };
  config: MockDataConfig;
  updateConfig: (newConfig: Partial<MockDataConfig>) => void;
}

const MockDataContext = React.createContext<MockDataContextValue | null>(null);

/**
 * Mock data provider component
 */
interface MockDataProviderProps {
  children: React.ReactNode;
  config?: MockDataConfig;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({
  children,
  config: initialConfig = {},
}) => {
  const [config, setConfig] = React.useState<MockDataConfig>(initialConfig);

  // Create mock API instance based on config
  const mockAPI = React.useMemo(() => {
    return new MockStrandsAPIEnhanced('http://localhost:8080', config.delay || 500);
  }, [config.delay]);

  // Generate mock data based on config
  const mockData = React.useMemo(() => ({
    uploadSession: generateMockUploadSession(config.uploadStatus),
    analysisSession: generateMockAnalysisSession(config.analysisStatus),
    analysisResults: generateMockAnalysisResults(config.complianceStatus),
    mockFile: generateMockFile(),
  }), [config.uploadStatus, config.analysisStatus, config.complianceStatus]);

  const updateConfig = React.useCallback((newConfig: Partial<MockDataConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const contextValue: MockDataContextValue = {
    mockAPI,
    mockData,
    config,
    updateConfig,
  };

  return (
    <MockDataContext.Provider value={contextValue}>
      {children}
    </MockDataContext.Provider>
  );
};

/**
 * Hook to use mock data context
 */
export const useMockData = (): MockDataContextValue => {
  const context = React.useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};

/**
 * Predefined mock data configurations for common scenarios
 */
export const mockDataConfigs = {
  // Upload scenarios
  uploadPending: {
    uploadStatus: UploadStatus.PENDING,
  },
  uploadInProgress: {
    uploadStatus: UploadStatus.UPLOADING,
  },
  uploadCompleted: {
    uploadStatus: UploadStatus.COMPLETED,
  },
  uploadFailed: {
    uploadStatus: UploadStatus.FAILED,
  },

  // Analysis scenarios
  analysisQueued: {
    analysisStatus: 'queued' as const,
  },
  analysisInProgress: {
    analysisStatus: 'analyzing' as const,
  },
  analysisCompleted: {
    analysisStatus: 'completed' as const,
  },
  analysisFailed: {
    analysisStatus: 'failed' as const,
  },

  // Compliance scenarios
  compliancePassed: {
    complianceStatus: 'pass' as const,
  },
  complianceWarning: {
    complianceStatus: 'warning' as const,
  },
  complianceFailed: {
    complianceStatus: 'fail' as const,
  },

  // Error scenarios
  networkError: {
    errorScenario: ErrorScenario.NETWORK_ERROR,
  },
  serverError: {
    errorScenario: ErrorScenario.SERVER_ERROR,
  },
  timeoutError: {
    errorScenario: ErrorScenario.TIMEOUT,
  },

  // Loading scenarios
  slowLoading: {
    delay: 2000,
  },
  fastLoading: {
    delay: 100,
  },

  // Combined scenarios
  fullWorkflowSuccess: {
    uploadStatus: UploadStatus.COMPLETED,
    analysisStatus: 'completed' as const,
    complianceStatus: 'pass' as const,
    delay: 500,
  },
  fullWorkflowWithIssues: {
    uploadStatus: UploadStatus.COMPLETED,
    analysisStatus: 'completed' as const,
    complianceStatus: 'warning' as const,
    delay: 500,
  },
  fullWorkflowFailure: {
    uploadStatus: UploadStatus.FAILED,
    analysisStatus: 'failed' as const,
    complianceStatus: 'fail' as const,
    delay: 500,
  },
} as const;

/**
 * Story decorator for providing mock data context
 */
export const withMockData = (config: MockDataConfig = {}) => {
  return (Story: React.ComponentType) => (
    <MockDataProvider config={config}>
      <Story />
    </MockDataProvider>
  );
};

/**
 * Utility functions for creating specific mock scenarios
 */
export const createMockScenario = {
  /**
   * Create upload scenario with specific state
   */
  upload: (status: UploadStatus, withError = false) => ({
    uploadStatus: status,
    ...(withError && { errorScenario: ErrorScenario.NETWORK_ERROR }),
  }),

  /**
   * Create analysis scenario with specific state
   */
  analysis: (status: 'queued' | 'extracting' | 'analyzing' | 'validating' | 'completed' | 'failed', withError = false) => ({
    analysisStatus: status,
    ...(withError && { errorScenario: ErrorScenario.ANALYSIS_FAILED }),
  }),

  /**
   * Create compliance scenario with specific result
   */
  compliance: (status: 'pass' | 'fail' | 'warning') => ({
    complianceStatus: status,
  }),

  /**
   * Create error scenario
   */
  error: (scenario: ErrorScenario, delay = 500) => ({
    errorScenario: scenario,
    delay,
  }),

  /**
   * Create loading scenario with specific delay
   */
  loading: (delay: number) => ({
    delay,
  }),
};

/**
 * Mock data validation utilities
 */
export const validateMockData = {
  /**
   * Validate upload session data
   */
  uploadSession: (session: any): boolean => {
    return (
      session &&
      typeof session.id === 'string' &&
      typeof session.filename === 'string' &&
      typeof session.fileSize === 'number' &&
      Object.values(UploadStatus).includes(session.status)
    );
  },

  /**
   * Validate analysis session data
   */
  analysisSession: (session: any): boolean => {
    return (
      session &&
      typeof session.id === 'string' &&
      typeof session.proposalId === 'string' &&
      typeof session.progress === 'number' &&
      session.progress >= 0 &&
      session.progress <= 100
    );
  },

  /**
   * Validate analysis results data
   */
  analysisResults: (results: any): boolean => {
    return (
      results &&
      typeof results.sessionId === 'string' &&
      typeof results.proposalId === 'string' &&
      ['pass', 'fail', 'warning'].includes(results.status) &&
      typeof results.overallScore === 'number' &&
      Array.isArray(results.issues)
    );
  },
};