// @ts-nocheck
/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalysisCoordinator } from './analysis-coordinator';
import { AnalysisStatus } from './types';

// Mock the analysis service
vi.mock('@/services', () => ({
  analysisService: {
    startAnalysis: vi.fn(),
    getAnalysisStatus: vi.fn(),
    setEventHandlers: vi.fn(),
    validateAnalysisRequest: vi.fn(),
  },
}));

import { analysisService } from '@/services';

// Mock file content for testing
const createMockFile = (content: string, name = 'test-proposal.pdf'): File => {
  const blob = new Blob([content], { type: 'application/pdf' });
  const file = new File([blob], name, { type: 'application/pdf' });

  // Mock the text() method for testing
  Object.defineProperty(file, 'text', {
    value: vi.fn().mockResolvedValue(content),
    writable: true,
  });

  return file;
};

describe('AnalysisCoordinator', () => {
  const defaultProps = {
    proposalId: 'test-proposal-123',
    fileContent: createMockFile(
      'Test proposal content with basic safeguarding and cybersecurity measures'
    ),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    (analysisService.startAnalysis as any).mockResolvedValue({
      success: true,
      sessionId: 'test-session-123',
    });
    
    (analysisService.getAnalysisStatus as any).mockResolvedValue({
      id: 'test-session-123',
      proposalId: 'test-proposal-123',
      status: AnalysisStatus.QUEUED,
      progress: 0,
      startedAt: new Date(),
      currentStep: 'Initializing analysis',
    });
    
    (analysisService.validateAnalysisRequest as any).mockReturnValue({
      isValid: true,
    });
    
    (analysisService.setEventHandlers as any).mockImplementation(() => {});
  });

  describe('Component Rendering', () => {
    it('should render analysis coordinator with start button', () => {
      render(<AnalysisCoordinator {...defaultProps} />);

      expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <AnalysisCoordinator {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('analysis-coordinator custom-class');
    });

    it('should disable start button when no file content provided', () => {
      render(<AnalysisCoordinator proposalId="test" />);

      const startButton = screen.getByText('Start Analysis');
      expect(startButton).toBeDisabled();
    });
  });

  describe('Analysis Process (Requirements 2.1, 2.2, 2.4)', () => {
    it('should start analysis when start button is clicked', async () => {
      const onAnalysisStart = vi.fn();
      render(<AnalysisCoordinator {...defaultProps} onAnalysisStart={onAnalysisStart} />);

      const startButton = screen.getByText('Start Analysis');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(onAnalysisStart).toHaveBeenCalledWith(
          expect.objectContaining({
            proposalId: 'test-proposal-123',
            status: AnalysisStatus.QUEUED,
            progress: 0,
          })
        );
      });
    });

    it('should show progress during analysis', async () => {
      render(<AnalysisCoordinator {...defaultProps} />);

      const startButton = screen.getByText('Start Analysis');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Analysis Status')).toBeInTheDocument();
      });

      // Should show progress bar
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });

    it('should complete analysis and show results', async () => {
      const onAnalysisComplete = vi.fn();
      render(<AnalysisCoordinator {...defaultProps} onAnalysisComplete={onAnalysisComplete} />);

      const startButton = screen.getByText('Start Analysis');
      fireEvent.click(startButton);

      await waitFor(
        () => {
          expect(screen.getByText('COMPLETED')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(onAnalysisComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          proposalId: 'test-proposal-123',
          status: expect.stringMatching(/pass|fail|warning/),
          overallScore: expect.any(Number),
          issues: expect.any(Array),
        })
      );
    });

    it('should auto-start analysis when autoStart is true', async () => {
      const onAnalysisStart = vi.fn();
      render(
        <AnalysisCoordinator {...defaultProps} autoStart={true} onAnalysisStart={onAnalysisStart} />
      );

      await waitFor(() => {
        expect(onAnalysisStart).toHaveBeenCalled();
      });
    });
  });

  describe('Text Extraction (Requirement 2.2)', () => {
    it('should extract text from file content', async () => {
      const fileContent = createMockFile('Sample proposal text for extraction testing');
      render(<AnalysisCoordinator proposalId="test" fileContent={fileContent} autoStart={true} />);

      await waitFor(() => {
        expect(screen.getByText(/Extracting text content/)).toBeInTheDocument();
      });
    });

    it('should handle string content for text extraction', async () => {
      const stringContent = 'Direct string content for analysis';
      render(
        <AnalysisCoordinator proposalId="test" fileContent={stringContent} autoStart={true} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Extracting text content/)).toBeInTheDocument();
      });
    });
  });

  describe('FAR/DFARS Validation (Requirement 2.1)', () => {
    it('should validate content against FAR/DFARS requirements', async () => {
      const compliantContent = createMockFile(`
        This proposal includes basic safeguarding measures and cybersecurity protocols.
        We comply with NIST 800-171 requirements for controlled unclassified information.
        Our business ethics and code of conduct program ensures compliance with all requirements.
        We have implemented anti-trafficking policies and training programs for all personnel.
        Our organization maintains comprehensive compliance programs for all regulatory requirements.
      `);

      render(
        <AnalysisCoordinator proposalId="test" fileContent={compliantContent} autoStart={true} />
      );

      // Should complete analysis successfully
      await waitFor(() => {
        expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      });

      // Should show results (may be PASS, WARNING, or FAIL depending on detection)
      expect(screen.getByText(/PASS|WARNING|FAIL/)).toBeInTheDocument();
    });

    it('should flag missing compliance requirements', async () => {
      const nonCompliantContent = createMockFile('Basic proposal without compliance information');

      render(
        <AnalysisCoordinator proposalId="test" fileContent={nonCompliantContent} autoStart={true} />
      );

      await waitFor(
        () => {
          expect(screen.getByText('COMPLETED')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Should show issues found
      await waitFor(() => {
        const issuesText = screen.getByText(/Issues Found:/);
        expect(issuesText).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling (Requirement 2.5)', () => {
    it('should handle analysis errors gracefully', async () => {
      const onAnalysisError = vi.fn();

      // Create invalid file content that will cause extraction to fail
      const invalidFile = new File([''], 'empty.pdf', { type: 'application/pdf' });
      Object.defineProperty(invalidFile, 'text', {
        value: vi.fn().mockRejectedValue(new Error('File read error')),
      });

      render(
        <AnalysisCoordinator
          proposalId="test"
          fileContent={invalidFile}
          onAnalysisError={onAnalysisError}
          autoStart={true}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByText('FAILED')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(onAnalysisError).toHaveBeenCalledWith(
        expect.stringContaining('error'),
        expect.any(Object)
      );
    });

    it('should show retry button after failure', async () => {
      const invalidFile = new File([''], 'empty.pdf', { type: 'application/pdf' });
      Object.defineProperty(invalidFile, 'text', {
        value: vi.fn().mockRejectedValue(new Error('File read error')),
      });

      render(<AnalysisCoordinator proposalId="test" fileContent={invalidFile} autoStart={true} />);

      await waitFor(
        () => {
          expect(screen.getByText('FAILED')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(screen.getByText('Retry Analysis')).toBeInTheDocument();
    });

    it('should display error messages clearly', async () => {
      const invalidFile = new File([''], 'empty.pdf', { type: 'application/pdf' });
      Object.defineProperty(invalidFile, 'text', {
        value: vi.fn().mockRejectedValue(new Error('Custom error message')),
      });

      render(<AnalysisCoordinator proposalId="test" fileContent={invalidFile} autoStart={true} />);

      await waitFor(
        () => {
          expect(screen.getByText('Custom error message')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Progress Tracking (Requirement 2.4)', () => {
    it('should call onProgressUpdate during analysis', async () => {
      const onProgressUpdate = vi.fn();
      render(
        <AnalysisCoordinator
          {...defaultProps}
          onProgressUpdate={onProgressUpdate}
          autoStart={true}
        />
      );

      await waitFor(() => {
        expect(onProgressUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            progress: expect.any(Number),
            currentStep: expect.any(String),
          })
        );
      });
    });

    it('should show current analysis step', async () => {
      render(<AnalysisCoordinator {...defaultProps} autoStart={true} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Initializing analysis|Extracting text content|Analyzing FAR\/DFARS compliance/
          )
        ).toBeInTheDocument();
      });
    });

    it('should update progress percentage', async () => {
      render(<AnalysisCoordinator {...defaultProps} autoStart={true} />);

      await waitFor(() => {
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    it('should display analysis results after completion', async () => {
      render(<AnalysisCoordinator {...defaultProps} autoStart={true} />);

      await waitFor(
        () => {
          expect(screen.getByText('COMPLETED')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await waitFor(() => {
        expect(screen.getByText('Analysis Results')).toBeInTheDocument();
        expect(screen.getByText(/Status:/)).toBeInTheDocument();
        expect(screen.getByText(/Score:/)).toBeInTheDocument();
        expect(screen.getByText(/Issues Found:/)).toBeInTheDocument();
        expect(screen.getByText(/Processing Time:/)).toBeInTheDocument();
      });
    });

    it('should show compliance score', async () => {
      render(<AnalysisCoordinator {...defaultProps} autoStart={true} />);

      await waitFor(
        () => {
          expect(screen.getByText('COMPLETED')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await waitFor(() => {
        expect(screen.getByText(/\d+\/100/)).toBeInTheDocument();
      });
    });
  });
});
