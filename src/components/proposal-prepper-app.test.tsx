/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProposalPrepperApp } from './proposal-prepper-app';

// Mock React.lazy to return components immediately
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    lazy: (fn: any) => {
      const Component = fn().then((module: any) => module.default || module);
      return Component;
    },
  };
});

// Mock the components directly
vi.mock('@/components/upload/upload-manager', () => ({
  UploadManager: ({ onUploadComplete, onUploadError }: any) => (
    <div data-testid="upload-manager">
      <div>Upload Manager Component</div>
      <button
        type="button"
        onClick={() =>
          onUploadComplete({
            id: 'test-upload-123',
            filename: 'test-proposal.pdf',
            fileSize: 1024000,
            mimeType: 'application/pdf',
            status: 'completed',
            progress: 100,
            startedAt: new Date(),
            completedAt: new Date(),
          })
        }
      >
        Complete Upload
      </button>
      <button
        type="button"
        onClick={() =>
          onUploadError('Upload failed', {
            id: 'test-upload-123',
            filename: 'test-proposal.pdf',
            fileSize: 1024000,
            mimeType: 'application/pdf',
            status: 'failed',
            progress: 0,
            startedAt: new Date(),
            errorMessage: 'Upload failed',
          })
        }
      >
        Fail Upload
      </button>
    </div>
  ),
}));

vi.mock('@/components/analysis/analysis-coordinator', () => ({
  AnalysisCoordinator: ({ onAnalysisStart, onAnalysisComplete, onAnalysisError, autoStart }: any) => {
    // Use React.useEffect to handle auto-start
    const React = require('react');
    React.useEffect(() => {
      if (autoStart) {
        // Start analysis immediately
        onAnalysisStart({
          id: 'test-analysis-123',
          proposalId: 'test-upload-123',
          status: 'analyzing',
          progress: 0,
          startedAt: new Date(),
          currentStep: 'Starting analysis',
        });

        // Complete analysis after a short delay
        const timer = setTimeout(() => {
          onAnalysisComplete({
            sessionId: 'test-analysis-123',
            proposalId: 'test-upload-123',
            status: 'pass',
            overallScore: 85,
            issues: [
              {
                id: 'issue-1',
                type: 'compliance',
                severity: 'warning',
                title: 'Missing section reference',
                description: 'FAR 52.204-8 reference not found',
                location: { page: 1, section: 'Introduction' },
                regulation: { section: 'FAR 52.204-8', title: 'Annual Representations and Certifications' },
                remediation: 'Add required FAR 52.204-8 reference',
              },
            ],
            analysisMetadata: {
              totalPages: 10,
              processingTime: 5000,
              completedAt: new Date().toISOString(),
              rulesChecked: 25,
            },
          });
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [autoStart, onAnalysisStart, onAnalysisComplete]);

    return (
      <div data-testid="analysis-coordinator">
        <div>Analyzing document...</div>
        <button
          type="button"
          onClick={() =>
            onAnalysisError('Analysis failed', {
              id: 'test-analysis-123',
              proposalId: 'test-upload-123',
              status: 'failed',
              progress: 50,
              startedAt: new Date(),
              currentStep: 'Failed during validation',
            })
          }
        >
          Fail Analysis
        </button>
      </div>
    );
  },
}));

vi.mock('@/components/results/results-presenter', () => ({
  ResultsPresenter: ({ results, onStartNewAnalysis }: any) => (
    <div data-testid="results-presenter">
      <div>Analysis Results</div>
      <div>Status: {results?.status}</div>
      <div>Score: {results?.overallScore}</div>
      <div>Issues: {results?.issues?.length || 0}</div>
      <button type="button" onClick={onStartNewAnalysis}>
        Start New Analysis
      </button>
    </div>
  ),
}));

vi.mock('@/components/navigation/navigation-controller', () => ({
  NavigationController: ({ steps, onNavigateToStep, onStartOver }: any) => (
    <div data-testid="navigation-controller">
      <div>Navigation Controller</div>
      {steps.map((step: any) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onNavigateToStep(step.id)}
          disabled={!step.isAccessible}
          data-testid={`nav-${step.id}`}
        >
          {step.label} {step.isCurrent && '(current)'} {step.isCompleted && '(completed)'}
        </button>
      ))}
      <button type="button" onClick={onStartOver} data-testid="nav-start-over">
        Start Over
      </button>
    </div>
  ),
}));

// Mock performance monitoring
vi.mock('@/utils/performance', () => ({
  PerformanceMonitor: {
    mark: vi.fn(),
    measure: vi.fn(() => 1000),
    getNavigationTiming: vi.fn(() => ({
      loadComplete: 2000,
      domContentLoaded: 1500,
      firstPaint: 1000,
    })),
  },
}));

describe('ProposalPrepperApp - End-to-End Workflow', () => {
  it('should render the main application interface', async () => {
    render(<ProposalPrepperApp />);

    // Verify initial state - should be on upload step
    expect(screen.getByText('Upload Proposal Document')).toBeInTheDocument();
    expect(screen.getByText('Proposal Prepper')).toBeInTheDocument();
    
    // Wait for navigation controller to load
    await waitFor(() => {
      expect(screen.getByTestId('navigation-controller')).toBeInTheDocument();
    });

    // Wait for upload manager to load
    await waitFor(() => {
      expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
    });
  });

  it('should complete the upload step and navigate to analysis', async () => {
    const user = userEvent.setup();
    render(<ProposalPrepperApp />);

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
    });

    // Complete upload
    await user.click(screen.getByText('Complete Upload'));

    // Should automatically navigate to analysis step
    await waitFor(() => {
      expect(screen.getByText('Analyzing Document')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('analysis-coordinator')).toBeInTheDocument();
    });
  });

  it('should handle upload errors gracefully', async () => {
    const user = userEvent.setup();
    render(<ProposalPrepperApp />);

    // Wait for upload manager to load
    await waitFor(() => {
      expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
    });

    // Trigger upload error
    await user.click(screen.getByText('Fail Upload'));

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/Upload failed/)).toBeInTheDocument();
    });

    // Should remain on upload step
    expect(screen.getByText('Upload Proposal Document')).toBeInTheDocument();
  });

  it('should complete the full workflow from upload to results', async () => {
    const user = userEvent.setup();
    render(<ProposalPrepperApp />);

    // Wait for upload manager to load
    await waitFor(() => {
      expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
    });

    // Complete upload
    await user.click(screen.getByText('Complete Upload'));

    // Wait for analysis to start
    await waitFor(() => {
      expect(screen.getByTestId('analysis-coordinator')).toBeInTheDocument();
    });

    // Analysis should auto-complete and show results
    await waitFor(() => {
      expect(screen.getByTestId('results-presenter')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify results display
    expect(screen.getByText('Status: pass')).toBeInTheDocument();
    expect(screen.getByText('Score: 85')).toBeInTheDocument();
    expect(screen.getByText('Issues: 1')).toBeInTheDocument();
  }, 10000);

  it('should allow starting a new workflow from results', async () => {
    const user = userEvent.setup();
    render(<ProposalPrepperApp />);

    // Complete the full workflow first
    await waitFor(() => {
      expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Complete Upload'));

    await waitFor(() => {
      expect(screen.getByTestId('results-presenter')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Start new workflow
    await user.click(screen.getByText('Start New Analysis'));

    // Should return to upload step
    await waitFor(() => {
      expect(screen.getByText('Upload Proposal Document')).toBeInTheDocument();
    });
  });

  it('should show navigation controller with proper step states', async () => {
    render(<ProposalPrepperApp />);

    // Wait for navigation controller to load
    await waitFor(() => {
      expect(screen.getByTestId('navigation-controller')).toBeInTheDocument();
    });

    // Should show navigation steps
    expect(screen.getByText('Navigation Controller')).toBeInTheDocument();
    
    // Check for navigation buttons (they should exist even if not accessible)
    await waitFor(() => {
      expect(screen.getByTestId('nav-upload')).toBeInTheDocument();
    });
  });

  it('should handle analysis errors appropriately', async () => {
    const user = userEvent.setup();
    render(<ProposalPrepperApp />);

    // Complete upload first
    await waitFor(() => {
      expect(screen.getByTestId('upload-manager')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Complete Upload'));

    // Wait for analysis to start
    await waitFor(() => {
      expect(screen.getByTestId('analysis-coordinator')).toBeInTheDocument();
    });

    // Trigger analysis error
    await user.click(screen.getByText('Fail Analysis'));

    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/Analysis failed/)).toBeInTheDocument();
    });
  });
});