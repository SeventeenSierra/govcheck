// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Upload Manager Component Tests
 *
 * Unit tests for the Upload Manager component.
 * Tests specific examples and user interaction scenarios.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadStatus } from '@/types/app';
import { UploadManager } from './upload-manager';

// Mock the config imports
vi.mock('@/config/app', () => ({
  uploadConfig: {
    acceptedTypes: ['application/pdf'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    minFileSize: 1024, // 1KB
    chunkSize: 1024 * 1024,
    maxConcurrentUploads: 1,
    uploadTimeout: 5 * 60 * 1000,
  },
  validationConfig: {
    maxFilenameLength: 255,
    filenamePattern: /^[a-zA-Z0-9._-]+$/,
  },
  errorConfig: {
    codes: {
      VALIDATION_FAILED: 'VALIDATION_001',
      UPLOAD_FAILED: 'UPLOAD_001',
    },
  },
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  AlertCircle: () => <div data-testid="error-icon" />,
  CheckCircle: () => <div data-testid="success-icon" />,
  X: () => <div data-testid="close-icon" />,
}));

// Mock @17sierra/ui Button component
vi.mock('@17sierra/ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

describe('UploadManager', () => {
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();
  const mockOnUploadProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should render upload area with instructions', () => {
      render(<UploadManager />);

      expect(screen.getByText('Upload your proposal document')).toBeInTheDocument();
      expect(
        screen.getByText('Drag and drop your PDF file here, or click to browse')
      ).toBeInTheDocument();
      expect(screen.getByText('Select PDF File')).toBeInTheDocument();
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    it('should show file size limit information', () => {
      render(<UploadManager />);

      expect(screen.getByText('Maximum file size: 100MB')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<UploadManager disabled={true} />);

      const button = screen.getByText('Select PDF File');
      expect(button).toBeDisabled();
    });
  });

  describe('File Selection', () => {
    it('should handle valid PDF file selection', async () => {
      render(
        <UploadManager
          onUploadComplete={mockOnUploadComplete}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const fileInput = screen.getByText('Select PDF File').closest('button');
      expect(fileInput).toBeInTheDocument();

      // Create a valid PDF file with sufficient size
      const content = 'x'.repeat(2048); // 2KB content
      const validFile = new File([content], 'test-document.pdf', {
        type: 'application/pdf',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [validFile] } });
      }

      // Should show file info
      await waitFor(() => {
        expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
      });
    });

    it('should reject invalid file types', async () => {
      render(<UploadManager onUploadError={mockOnUploadError} />);

      const fileInput = screen.getByText('Select PDF File').closest('button');

      // Create an invalid file type
      const invalidFile = new File(['test content'], 'document.txt', {
        type: 'text/plain',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      }

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Upload Failed')).toBeInTheDocument();
        expect(screen.getByText(/Only PDF files are accepted/)).toBeInTheDocument();
      });

      expect(mockOnUploadError).toHaveBeenCalledWith(
        expect.stringContaining('Only PDF files are accepted'),
        expect.objectContaining({
          filename: 'document.txt',
          status: UploadStatus.FAILED,
        })
      );
    });

    it('should reject files that are too large', async () => {
      render(<UploadManager onUploadError={mockOnUploadError} />);

      const fileInput = screen.getByTestId('file-input');

      // Create a file that's too large (mock by setting size property)
      const largeFile = new File(['x'.repeat(1000)], 'large-document.pdf', {
        type: 'application/pdf',
      });

      // Mock the file size to be larger than the limit
      Object.defineProperty(largeFile, 'size', {
        value: 101 * 1024 * 1024, // 101MB
        writable: false,
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [largeFile] } });
      }

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Upload Failed')).toBeInTheDocument();
        expect(screen.getByText(/exceeds the maximum limit/)).toBeInTheDocument();
      });

      expect(mockOnUploadError).toHaveBeenCalled();
    });
  });

  describe('Upload Progress', () => {
    it('should show progress during upload', async () => {
      render(
        <UploadManager
          onUploadProgress={mockOnUploadProgress}
          onUploadComplete={mockOnUploadComplete}
        />
      );

      const fileInput = screen.getByTestId('file-input');

      // Create a file with sufficient size to pass validation
      const content = 'x'.repeat(2048); // 2KB content
      const validFile = new File([content], 'test.pdf', {
        type: 'application/pdf',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [validFile] } });
      }

      // Should show uploading state
      await waitFor(() => {
        expect(screen.getByText('Uploading...')).toBeInTheDocument();
      });

      // Should show progress bar
      expect(document.querySelector('.bg-blue-600')).toBeInTheDocument();
    });
  });

  describe('Upload Success', () => {
    it('should show success state when upload completes', async () => {
      render(<UploadManager onUploadComplete={mockOnUploadComplete} />);

      const fileInput = screen.getByTestId('file-input');

      // Create a file with sufficient size to pass validation
      const content = 'x'.repeat(2048); // 2KB content
      const validFile = new File([content], 'test.pdf', {
        type: 'application/pdf',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [validFile] } });
      }

      // Wait for upload to complete
      await waitFor(
        () => {
          expect(screen.getByText('Upload completed successfully!')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
      expect(screen.getByText('Upload Another File')).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'test.pdf',
          status: UploadStatus.COMPLETED,
          progress: 100,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should show retry option for failed uploads', async () => {
      render(<UploadManager onUploadError={mockOnUploadError} />);

      const fileInput = screen.getByTestId('file-input');

      // Create invalid file to trigger error
      const invalidFile = new File(['test'], 'test.txt', {
        type: 'text/plain',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Upload Failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Retry Upload')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('should clear upload state when clear button is clicked', async () => {
      render(<UploadManager />);

      const fileInput = screen.getByTestId('file-input');

      // Upload invalid file to get error state
      const invalidFile = new File(['test'], 'test.txt', {
        type: 'text/plain',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });

      // Click clear button
      fireEvent.click(screen.getByText('Clear'));

      // Should return to initial state
      expect(screen.getByText('Upload your proposal document')).toBeInTheDocument();
      expect(screen.queryByText('Upload Failed')).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag events', () => {
      render(<UploadManager />);

      const dropZone = screen.getByText('Upload your proposal document').closest('div');

      // Simulate drag enter
      fireEvent.dragEnter(dropZone!, {
        dataTransfer: {
          files: [],
        },
      });

      // Should add active drag styling (this would be tested via class changes)
      expect(dropZone).toBeInTheDocument();
    });

    it('should handle file drop', async () => {
      render(<UploadManager onUploadComplete={mockOnUploadComplete} />);

      const dropZone = screen.getByText('Upload your proposal document').closest('div');

      // Create a file with sufficient size
      const content = 'x'.repeat(2048); // 2KB content
      const validFile = new File([content], 'dropped.pdf', {
        type: 'application/pdf',
      });

      // Simulate file drop
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [validFile],
        },
      });

      // Should show file info
      await waitFor(() => {
        expect(screen.getByText('dropped.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Session Information', () => {
    it('should display session information', async () => {
      render(<UploadManager />);

      const fileInput = screen.getByTestId('file-input');

      // Create a file with sufficient size
      const content = 'x'.repeat(2048); // 2KB content
      const validFile = new File([content], 'test.pdf', {
        type: 'application/pdf',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [validFile] } });
      }

      // Should show session ID and timestamp
      await waitFor(() => {
        expect(screen.getByText(/Session ID:/)).toBeInTheDocument();
        expect(screen.getByText(/Started:/)).toBeInTheDocument();
      });
    });
  });
});
