/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RFPInterface } from './rfp-interface';

// Mock the strands API client
vi.mock('@/services', () => ({
  strandsApiClient: {
    startAnalysis: vi.fn(),
    getResults: vi.fn(),
  },
}));

// Mock the upload workflow
vi.mock('@/components/upload/upload-workflow', () => ({
  UploadWorkflow: vi.fn(
    ({ onWorkflowComplete }: { onWorkflowComplete: (session: any) => void }) => (
      <div data-testid="upload-workflow">
        <button
          onClick={() =>
            onWorkflowComplete({
              id: 'test-upload-123',
              filename: 'test-proposal.pdf',
              fileSize: 1024000,
              mimeType: 'application/pdf',
              status: 'completed',
              progress: 100,
            })
          }
        >
          Mock Upload Complete
        </button>
      </div>
    )
  ),
}));

describe('RFPInterface', () => {
  const mockProps = {
    activeProject: null,
    onProjectStart: vi.fn(),
    onAnalysisComplete: vi.fn(),
    onStartNew: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome state initially', () => {
    render(<RFPInterface {...mockProps} />);

    expect(screen.getByText('RFP Compliance Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Upload & Analyze Proposal')).toBeInTheDocument();
    expect(screen.getByTestId('upload-workflow')).toBeInTheDocument();
  });

  it('should handle upload completion and start analysis', async () => {
    const { strandsApiClient } = await import('@/services');

    // Mock successful analysis start
    (strandsApiClient.startAnalysis as any).mockResolvedValue({
      success: true,
      data: { id: 'analysis-123' },
    });

    // Mock successful results
    (strandsApiClient.getResults as any).mockResolvedValue({
      success: true,
      data: { complianceScore: 92 },
    });

    render(<RFPInterface {...mockProps} />);

    // Trigger upload completion
    const uploadButton = screen.getByText('Mock Upload Complete');
    fireEvent.click(uploadButton);

    // Should call onProjectStart
    expect(mockProps.onProjectStart).toHaveBeenCalledWith('test-upload-123');

    // Should show analysis complete state (since mock completes immediately)
    await waitFor(() => {
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
    });
  });

  it('should show chat interface when analysis is complete', async () => {
    render(<RFPInterface {...mockProps} activeProject="test-project" />);

    // Should show chat input when project is active
    expect(
      screen.getByPlaceholderText(/Ask questions about your proposal analysis/)
    ).toBeInTheDocument();
  });
});
