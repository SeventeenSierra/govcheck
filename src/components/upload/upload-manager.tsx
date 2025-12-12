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
}: UploadManagerProps): React.JSX.Element {
  const [currentUpload, setCurrentUpload] = useState<UploadSession | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates uploaded file against requirements
   * Implements requirements 1.1 (PDF format) and 1.2 (size limits)
   */
  const validateFile = useCallback((file: File): ValidationResult => {
    // Check file type (requirement 1.1: PDF format only)
    if (!uploadConfig.acceptedTypes.includes(file.type as (typeof uploadConfig.acceptedTypes)[number])) {
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
        error: `Filename is too long. Maximum ${validationConfig.maxFilenameLength} characters allowed.`,
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
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
   * Implements requirement 1.5 (progress tracking)
   */
  const simulateUpload = useCallback((session: UploadSession) => {
    const updatedSession = { ...session, status: UploadStatus.UPLOADING };
    setCurrentUpload(updatedSession);

    return new Promise<UploadSession>((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress increment
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          const completedSession: UploadSession = {
            ...updatedSession,
            status: UploadStatus.COMPLETED,
            progress: 100,
            completedAt: new Date(),
          };
          
          setCurrentUpload(completedSession);
          onUploadProgress?.(100, completedSession);
          resolve(completedSession);
        } else {
          const progressSession = { ...updatedSession, progress };
          setCurrentUpload(progressSession);
          onUploadProgress?.(progress, progressSession);
        }
      }, 200);
    });
  }, [onUploadProgress]);

  /**
   * Handles file selection and upload
   * Implements requirements 1.1, 1.2, 1.3, 1.4 (validation, confirmation, error handling)
   */
  const handleFileUpload = useCallback(async (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      const session = createUploadSession(file);
      const failedSession = {
        ...session,
        status: UploadStatus.FAILED,
        errorMessage: validation.error,
      };
      setCurrentUpload(failedSession);
      onUploadError?.(validation.error!, failedSession);
      return;
    }

    try {
      const session = createUploadSession(file);
      const completedSession = await simulateUpload(session);
      onUploadComplete?.(completedSession);
    } catch (error) {
      const session = createUploadSession(file);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      const failedSession = {
        ...session,
        status: UploadStatus.FAILED,
        errorMessage,
      };
      setCurrentUpload(failedSession);
      onUploadError?.(errorMessage, failedSession);
    }
  }, [validateFile, createUploadSession, simulateUpload, onUploadComplete, onUploadError]);

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [disabled, handleFileUpload]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [disabled, handleFileUpload]);

  /**
   * Handle click to open file dialog
   */
  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  /**
   * Clear current upload
   */
  const handleClear = useCallback(() => {
    setCurrentUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Retry failed upload
   */
  const handleRetry = useCallback(() => {
    if (currentUpload && currentUpload.status === UploadStatus.FAILED) {
      // Create a new file object for retry (simplified for demo)
      const mockFile = new File([''], currentUpload.filename, { type: currentUpload.mimeType });
      handleFileUpload(mockFile);
    }
  }, [currentUpload, handleFileUpload]);

  // Component state checks
  const isUploading = currentUpload?.status === UploadStatus.UPLOADING;
  const hasCompleted = currentUpload?.status === UploadStatus.COMPLETED;
  const hasFailed = currentUpload?.status === UploadStatus.FAILED;

  return (
    <div className={`upload-manager ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${isUploading ? 'border-blue-400 bg-blue-50' : ''}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
          data-testid="file-input"
        />

        <div className="mb-4" data-testid="upload-icon">
          {isUploading ? (
            <Upload className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
          ) : hasCompleted ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          ) : hasFailed ? (
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          ) : (
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
          )}
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isUploading ? 'Uploading...' : 
           hasCompleted ? 'Upload Complete' :
           hasFailed ? 'Upload Failed' :
           'Upload your proposal document'}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {isUploading ? `Uploading ${currentUpload?.filename}` :
           hasCompleted ? `Successfully uploaded ${currentUpload?.filename}` :
           hasFailed ? currentUpload?.errorMessage :
           'Drag and drop your PDF file here, or click to browse'}
        </p>

        {!isUploading && !hasCompleted && (
          <Button variant="outline" disabled={disabled}>
            Select PDF File
          </Button>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Maximum file size: {Math.round(uploadConfig.maxFileSize / (1024 * 1024))}MB
        </p>
      </div>

      {/* Progress Bar */}
      {isUploading && currentUpload && (
        <div className="mt-4">
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

      {/* Success/Error Actions */}
      {(hasCompleted || hasFailed) && (
        <div className="mt-4 flex gap-2 justify-center">
          {hasFailed && (
            <Button onClick={handleRetry} variant="outline" size="sm">
              Retry Upload
            </Button>
          )}
          <Button onClick={handleClear} variant="outline" size="sm">
            <X className="h-4 w-4 mr-1" />
            {hasCompleted ? 'Upload Another' : 'Clear'}
          </Button>
        </div>
      )}

      {/* Session Info */}
      {currentUpload && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Session: {currentUpload.id}
        </div>
      )}
    </div>
  );
}