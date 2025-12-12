// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Upload Manager Component
 *
 * Handles basic document upload functionality for the Proposal Prepper application.
 * Implements requirements 1.1, 1.2, 1.3, 1.4, and 1.5 for PDF upload, validation,
 * confirmation, error handling, and progress tracking.
 */

'use client';

import { Button } from '@17sierra/ui';
import { AlertCircle, CheckCircle, FileText, Upload, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { errorConfig, uploadConfig, validationConfig } from '@/config/app';
import { type UploadSession, UploadStatus } from '@/types/app';

/**
 * Upload Manager Props
 */
export interface UploadManagerProps {
  /** Callback when upload is successfully completed */
  onUploadComplete?: (session: UploadSession) => void;
  /** Callback when upload fails */
  onUploadError?: (error: string, session: UploadSession) => void;
  /** Callback for upload progress updates */
  onUploadProgress?: (progress: number, session: UploadSession) => void;
  /** Whether the upload manager is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * File validation result
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Upload Manager Component
 *
 * Provides a clean, functional interface for uploading PDF documents
 * with comprehensive validation, progress tracking, and error handling.
 */
export function UploadManager({
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  disabled = false,
  className = '',
}: UploadManagerProps) {
  const [currentUpload, setCurrentUpload] = useState<UploadSession | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates uploaded file against requirements
   * Implements requirements 1.1 (PDF format) and 1.2 (size limits)
   */
  const validateFile = useCallback((file: File): ValidationResult => {
    // Check file type (requirement 1.1: PDF format only)
    if (
      !uploadConfig.acceptedTypes.includes(file.type as (typeof uploadConfig.acceptedTypes)[number])
    ) {
      return {
        isValid: false,
        error: 'Only PDF files are accepted for upload.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    // Check file size limits (requirement 1.2)
    if (file.size > uploadConfig.maxFileSize) {
      const maxSizeMB = Math.round(uploadConfig.maxFileSize / (1024 * 1024));
      return {
        isValid: false,
        error: `File size exceeds the maximum limit of ${maxSizeMB}MB.`,
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    if (file.size < uploadConfig.minFileSize) {
      return {
        isValid: false,
        error: 'File is too small. Please select a valid PDF document.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    // Check filename validity
    if (file.name.length > validationConfig.maxFilenameLength) {
      return {
        isValid: false,
        error: 'Filename is too long. Please rename the file and try again.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    if (!validationConfig.filenamePattern.test(file.name)) {
      return {
        isValid: false,
        error:
          'Filename contains invalid characters. Please use only letters, numbers, dots, hyphens, and underscores.',
        errorCode: errorConfig.codes.VALIDATION_FAILED,
      };
    }

    return { isValid: true };
  }, []);

  /**
   * Creates a new upload session
   */
  const createUploadSession = useCallback((file: File): UploadSession => {
    return {
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      status: UploadStatus.PENDING,
      progress: 0,
      startedAt: new Date(),
    };
  }, []);

  /**
   * Simulates file upload with progress tracking
   * Implements requirement 1.5 (progress indication)
   */
  const simulateUpload = useCallback(
    async (session: UploadSession): Promise<void> => {
      return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15 + 5; // Random progress increment

          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Update session to completed
            const completedSession: UploadSession = {
              ...session,
              status: UploadStatus.COMPLETED,
              progress: 100,
              completedAt: new Date(),
            };

            setCurrentUpload(completedSession);
            onUploadComplete?.(completedSession);
            resolve();
          } else {
            // Update progress
            const updatedSession: UploadSession = {
              ...session,
              status: UploadStatus.UPLOADING,
              progress: Math.min(progress, 100),
            };

            setCurrentUpload(updatedSession);
            onUploadProgress?.(updatedSession.progress, updatedSession);
          }
        }, 200); // Update every 200ms for smooth progress

        // Simulate potential upload failure (5% chance for testing)
        if (Math.random() < 0.05) {
          setTimeout(
            () => {
              clearInterval(interval);
              const failedSession: UploadSession = {
                ...session,
                status: UploadStatus.FAILED,
                errorMessage: 'Upload failed due to network error. Please try again.',
              };
              setCurrentUpload(failedSession);
              onUploadError?.(failedSession.errorMessage!, failedSession);
              reject(new Error(failedSession.errorMessage));
            },
            1000 + Math.random() * 2000
          );
        }
      });
    },
    [onUploadComplete, onUploadError, onUploadProgress]
  );

  /**
   * Handles file upload process
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        const errorSession = createUploadSession(file);
        errorSession.status = UploadStatus.FAILED;
        errorSession.errorMessage = validation.error;
        setCurrentUpload(errorSession);
        onUploadError?.(validation.error!, errorSession);
        return;
      }

      // Create upload session
      const session = createUploadSession(file);
      setCurrentUpload(session);

      try {
        // Start upload simulation
        await simulateUpload(session);
      } catch (error) {
        // Error handling is done in simulateUpload
        console.error('Upload failed:', error);
      }
    },
    [validateFile, createUploadSession, simulateUpload, onUploadError]
  );

  /**
   * Handles file input change
   */
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  /**
   * Handles drag and drop events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [disabled, handleFileUpload]
  );

  /**
   * Triggers file input click
   */
  const handleUploadClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  /**
   * Clears current upload session
   */
  const clearUpload = useCallback(() => {
    setCurrentUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Retries failed upload
   */
  const retryUpload = useCallback(() => {
    if (currentUpload && currentUpload.status === UploadStatus.FAILED) {
      const retrySession: UploadSession = {
        ...currentUpload,
        status: UploadStatus.PENDING,
        progress: 0,
        errorMessage: undefined,
        startedAt: new Date(),
        completedAt: undefined,
      };
      setCurrentUpload(retrySession);

      // Re-create file object for retry (this is a simulation)
      // In a real implementation, you would store the original file
      const _mockFile = new File([''], currentUpload.filename, { type: currentUpload.mimeType });
      simulateUpload(retrySession).catch(() => {
        // Error handling is done in simulateUpload
      });
    }
  }, [currentUpload, simulateUpload]);

  const isUploading = currentUpload?.status === UploadStatus.UPLOADING;
  const isCompleted = currentUpload?.status === UploadStatus.COMPLETED;
  const hasFailed = currentUpload?.status === UploadStatus.FAILED;

  return (
    <div className={`upload-manager ${className}`}>
      {/* Upload Area */}
      {/* biome-ignore lint/a11y/useSemanticElements: div needed for drag-and-drop functionality */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        role="button"
        tabIndex={0}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleUploadClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          className="hidden"
          data-testid="file-input"
        />

        {!currentUpload && (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload your proposal document
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your PDF file here, or click to browse
            </p>
            <Button disabled={disabled}>Select PDF File</Button>
            <p className="text-xs text-gray-500 mt-2">
              Maximum file size: {Math.round(uploadConfig.maxFileSize / (1024 * 1024))}MB
            </p>
          </>
        )}

        {currentUpload && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{currentUpload.filename}</span>
              <span className="text-xs text-gray-500">
                ({Math.round(currentUpload.fileSize / 1024)} KB)
              </span>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(currentUpload.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentUpload.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success State */}
            {isCompleted && (
              <div className="text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-green-600 font-medium">Upload completed successfully!</p>
                <Button variant="outline" size="sm" onClick={clearUpload} className="mt-2">
                  Upload Another File
                </Button>
              </div>
            )}

            {/* Error State */}
            {hasFailed && (
              <div className="text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-sm text-red-600 font-medium mb-2">Upload Failed</p>
                <p className="text-xs text-red-500 mb-3">{currentUpload.errorMessage}</p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm" onClick={retryUpload}>
                    Retry Upload
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearUpload}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Status Summary */}
      {currentUpload && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Session ID: {currentUpload.id} | Started: {currentUpload.startedAt.toLocaleTimeString()}
          {currentUpload.completedAt && (
            <> | Completed: {currentUpload.completedAt.toLocaleTimeString()}</>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadManager;
