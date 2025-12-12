// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Upload Confirmation and Error Handling Tests
 *
 * Focused tests for upload confirmation and error handling functionality
 * as specified in requirements 1.3 and 1.4.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { strandsApiClient } from '@/services';
import { UploadStatus } from '@/types/app';
import { UploadManager } from './upload-manager';

// Mock the config imports
vi.mock('@/config/app', () => ({
  apiConfig: {
    strandsBaseUrl: 'http://localhost:8080',
    websocket: {
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
    },
  },
  uploadConfig: {
    acceptedTypes: ['application/pdf'],
    maxFileSize: 100 * 1024 * 1024,
    minFileSize: 1024,
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

// Mock the strands API client
vi.mock('@/services', () => ({
  strandsApiClient: {
    uploadDocument: vi.fn(),
    getUploadStatus: vi.fn(),
  },
}));

// Mock icons
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
  FileText: () => <div data-testid="file-icon" />,
  AlertCircle: () => <div data-testid="error-icon" />,
  CheckCircle: () => <div data-testid="success-icon" />,
  X: () => <div data-testid="close-icon" />,
}));

// Mock Button component
vi.mock('@17sierra/ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

describe('Upload Confirmation and Error Handling', () => {
  const mockOnUploadComplete = vi.fn();
  const mockOnUploadError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup successful upload mocks by default
    (strandsApiClient.uploadDocument as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        id: 'upload-123',
        filename: 'test.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        status: 'completed',
        progress: 100,
        startedAt: new Date().toISOString(),
      },
    });

    (strandsApiClient.getUploadStatus as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        id: 'upload-123',
        filename: 'test.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        status: 'completed',
        progress: 100,
        startedAt: new Date().toISOString(),
      },
    });
  });

  describe('Upload Confirmation (Requirement 1.3)', () => {
    it('should display success confirmation when upload completes', async () => {
      render(<UploadManager onUploadComplete={mockOnUploadComplete} />);

      // Upload a valid file
      const fileInput = screen.getByTestId('file-input');

      const validFile = new File(['x'.repeat(2048)], 'success-test.pdf', {
        type: 'application/pdf',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [validFile] } });
      }

      // Wait for upload to complete
      await waitFor(
        () => {
          expect(screen.getByText('Upload Complete')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify success confirmation elements
      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
      expect(screen.getByText('Upload Another')).toBeInTheDocument();

      // Verify callback was called
      expect(mockOnUploadComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'success-test.pdf',
          status: UploadStatus.COMPLETED,
          progress: 100,
        })
      );
    });

    it('should allow uploading another file after successful upload', async () => {
      render(<UploadManager />);

      // Complete an upload first
      const fileInput = screen.getByTestId('file-input');

      const validFile = new File(['x'.repeat(2048)], 'first-upload.pdf', {
        type: 'application/pdf',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [validFile] } });
      }

      await waitFor(
        () => {
          expect(screen.getByText('Upload Another')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Click "Upload Another"
      fireEvent.click(screen.getByText('Upload Another'));

      // Should return to initial upload state
      expect(screen.getByText('Upload your proposal document')).toBeInTheDocument();
      expect(screen.getByText('Select PDF File')).toBeInTheDocument();
    });
  });

  describe('Error Message Display (Requirement 1.4)', () => {
    it('should display clear error messages for invalid file types', async () => {
      render(<UploadManager onUploadError={mockOnUploadError} />);

      const fileInput = screen.getByTestId('file-input');

      // Upload invalid file type
      const invalidFile = new File(['content'], 'document.txt', {
        type: 'text/plain',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Upload Failed')).toBeInTheDocument();
      });

      // Verify error message elements
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      expect(screen.getByText(/Only PDF files are accepted/)).toBeInTheDocument();

      // Verify error callback was called
      expect(mockOnUploadError).toHaveBeenCalledWith(
        expect.stringContaining('Only PDF files are accepted'),
        expect.objectContaining({
          filename: 'document.txt',
          status: UploadStatus.FAILED,
        })
      );
    });

    it('should display clear error messages for oversized files', async () => {
      render(<UploadManager onUploadError={mockOnUploadError} />);

      const fileInput = screen.getByTestId('file-input');

      // Create oversized file
      const oversizedFile = new File(['x'.repeat(1000)], 'large.pdf', {
        type: 'application/pdf',
      });

      // Mock file size to exceed limit
      Object.defineProperty(oversizedFile, 'size', {
        value: 101 * 1024 * 1024, // 101MB
        writable: false,
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [oversizedFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Upload Failed')).toBeInTheDocument();
      });

      // Verify size limit error message
      expect(screen.getByText(/exceeds the maximum limit/)).toBeInTheDocument();
      expect(mockOnUploadError).toHaveBeenCalled();
    });

    it('should display clear error messages for long filenames', async () => {
      render(<UploadManager onUploadError={mockOnUploadError} />);

      const fileInput = screen.getByTestId('file-input');

      // Create file with filename that's too long (over 255 characters)
      const longFilename = `${'a'.repeat(252)}.pdf`; // 256 characters total
      const longNameFile = new File(['x'.repeat(2048)], longFilename, {
        type: 'application/pdf',
      });

      fireEvent.change(fileInput, { target: { files: [longNameFile] } });

      await waitFor(() => {
        expect(screen.getByText('Upload Failed')).toBeInTheDocument();
      });

      // Verify filename length error message
      expect(screen.getByText(/Filename is too long/)).toBeInTheDocument();
      expect(mockOnUploadError).toHaveBeenCalled();
    });
  });

  describe('Retry Mechanisms (Requirement 1.4)', () => {
    it('should provide retry option for failed uploads', async () => {
      render(<UploadManager />);

      const fileInput = screen.getByTestId('file-input');

      // Upload invalid file to trigger error
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Retry Upload')).toBeInTheDocument();
      });

      // Verify retry and clear buttons are available
      expect(screen.getByText('Retry Upload')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should allow clearing failed upload state', async () => {
      render(<UploadManager />);

      const fileInput = screen.getByTestId('file-input');

      // Upload invalid file to trigger error
      const invalidFile = new File(['content'], 'test.txt', {
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

    it('should maintain session information during error states', async () => {
      render(<UploadManager />);

      const fileInput = screen.getByTestId('file-input');

      // Upload invalid file
      const invalidFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      if (fileInput) {
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Upload Failed')).toBeInTheDocument();
      });

      // Should still show session information
      expect(screen.getByText(/Session:/)).toBeInTheDocument();
    });
  });
});
