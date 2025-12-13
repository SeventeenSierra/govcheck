/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Upload Workflow Component Tests
 * 
 * Tests for the end-to-end workflow integration component.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UploadWorkflow } from './upload-workflow';
import type { UploadSession } from '@/types/app';
import { UploadStatus } from '@/types/app';

// Mock the services
vi.mock('@/services/strands-api-client', () => {
  const mockClient = {
    startAnalysis: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        id: 'analysis-session-456',
        status: 'queued',
        progress: 0,
        currentStep: 'Analysis queued'
      }
    })),
    getAnalysisStatus: vi.fn(),
    getResults: vi.fn(),
    healthCheck: vi.fn(),
    getServiceStatus: vi.fn(() => Promise.resolve({ healthy: true, baseUrl: 'http://localhost:3000' })),
    getBaseUrl: vi.fn(() => 'http://localhost:3000'),
    isWebSocketConnected: vi.fn(() => false),
    connectWebSocket: vi.fn(),
    subscribeToUploadProgress: vi.fn(),
    subscribeToAnalysisProgress: vi.fn(),
    subscribeToAnalysisComplete: vi.fn(),
    subscribeToErrors: vi.fn(),
    disconnectWebSocket: vi.fn()
  };

  return {
    strandsApiClient: mockClient,
    StrandsApiClient: vi.fn(() => mockClient),
    createStrandsApiClientWithConfig: vi.fn(() => mockClient)
  };
});

// Mock the real-time updates hook
vi.mock('./use-real-time-updates', () => ({
  useRealTimeUpdates: vi.fn(() => ({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    isConnected: false
  }))
}));

// Mock the upload manager
vi.mock('./upload-manager', () => ({
  UploadManager: vi.fn(({ onUploadComplete }) => (
    <div data-testid="upload-manager">
      <button
        onClick={() => {
          const mockSession: UploadSession = {
            id: 'test-session-123',
            filename: 'test-proposal.pdf',
            fileSize: 1024000,
            mimeType: 'application/pdf',
            status: UploadStatus.COMPLETED,
            progress: 100,
            startedAt: new Date(),
            completedAt: new Date(),
            analysisSessionId: 'analysis-session-456'
          };
          onUploadComplete?.(mockSession);
        }}
      >
        Mock Upload Complete
      </button>
    </div>
  ))
}));

describe('UploadWorkflow', () => {
  const mockOnWorkflowComplete = vi.fn();
  const mockOnWorkflowError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload manager initially', () => {
    render(
      <UploadWorkflow
        onWorkflowComplete={mockOnWorkflowComplete}
        onWorkflowError={mockOnWorkflowError}
      />
    );

    expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
  });

  it('shows analysis section after upload completion', async () => {
    render(
      <UploadWorkflow
        onWorkflowComplete={mockOnWorkflowComplete}
        onWorkflowError={mockOnWorkflowError}
      />
    );

    // Trigger upload completion
    fireEvent.click(screen.getByText('Mock Upload Complete'));

    await waitFor(() => {
      expect(screen.getByText('Analyzing Document')).toBeInTheDocument();
    });

    // Should show analysis section title
    expect(screen.getByText('Analyzing Document')).toBeInTheDocument();
  });

  it('handles workflow completion correctly', async () => {
    const { strandsApiClient } = await import('@/services/strands-api-client');
    
    // Mock successful analysis results
    vi.mocked(strandsApiClient.getResults).mockResolvedValue({
      success: true,
      data: {
        id: 'results-123',
        status: 'pass',
        summary: {
          total_issues: 2,
          critical_count: 0,
          warning_count: 2
        }
      }
    });

    render(
      <UploadWorkflow
        onWorkflowComplete={mockOnWorkflowComplete}
        onWorkflowError={mockOnWorkflowError}
      />
    );

    // Trigger upload completion
    fireEvent.click(screen.getByText('Mock Upload Complete'));

    await waitFor(() => {
      expect(screen.getByText('Analyzing Document')).toBeInTheDocument();
    });
  });

  it('handles disabled state correctly', () => {
    render(
      <UploadWorkflow
        onWorkflowComplete={mockOnWorkflowComplete}
        onWorkflowError={mockOnWorkflowError}
        disabled={true}
      />
    );

    expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
  });

  it('shows debug information in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <UploadWorkflow
        onWorkflowComplete={mockOnWorkflowComplete}
        onWorkflowError={mockOnWorkflowError}
      />
    );

    expect(screen.getByText('Debug Information')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});