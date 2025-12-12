// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

/**
 * Upload Validation Tests
 *
 * Unit tests for upload validation utilities.
 * Tests specific examples and edge cases for file validation logic.
 */

import { describe, expect, it } from 'vitest';
import { uploadConfig } from '@/config/app';
import {
  formatFileSize,
  generateSessionId,
  validateFile,
  validateFilename,
  validateFileSize,
  validateFileType,
  validatePDFContent,
} from './upload-validation';

describe('Upload Validation', () => {
  describe('validateFileType', () => {
    it('should accept valid PDF files', () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = validateFileType(pdfFile);

      expect(result.isValid).toBe(true);
      expect(result.details?.fileType).toBe('application/pdf');
    });

    it('should reject non-PDF files', () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = validateFileType(textFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Only PDF files are accepted');
      expect(result.errorCode).toBeDefined();
    });

    it('should handle files with no MIME type', () => {
      const unknownFile = new File(['test'], 'test.unknown', { type: '' });
      const result = validateFileType(unknownFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('unknown');
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limits', () => {
      const validSize = 50 * 1024 * 1024; // 50MB
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      // Mock the size property to simulate a valid sized file
      Object.defineProperty(file, 'size', {
        value: validSize,
        writable: false,
      });

      const result = validateFileSize(file);

      expect(result.isValid).toBe(true);
      expect(result.details?.fileSize).toBe(validSize);
    });

    it('should reject files that are too large', () => {
      const oversizedFile = new File(['x'.repeat(1000)], 'large.pdf', {
        type: 'application/pdf',
      });

      // Mock the file size to be larger than the limit
      Object.defineProperty(oversizedFile, 'size', {
        value: uploadConfig.maxFileSize + 1,
        writable: false,
      });

      const result = validateFileSize(oversizedFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds the maximum limit');
      expect(result.errorCode).toBeDefined();
    });

    it('should reject files that are too small', () => {
      const tinyFile = new File(['x'], 'tiny.pdf', { type: 'application/pdf' });
      const result = validateFileSize(tinyFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('below the minimum requirement');
      expect(result.errorCode).toBeDefined();
    });
  });

  describe('validateFilename', () => {
    it('should accept valid filenames', () => {
      const validNames = [
        'document.pdf',
        'my-proposal_v2.pdf',
        'test123.pdf',
        'file.with.dots.pdf',
      ];

      validNames.forEach((filename) => {
        const result = validateFilename(filename);
        expect(result.isValid).toBe(true);
        expect(result.details?.filename).toBe(filename);
      });
    });

    it('should reject filenames with invalid characters', () => {
      const invalidNames = [
        'file with spaces.pdf',
        'file/with/slashes.pdf',
        'file<with>brackets.pdf',
        'file|with|pipes.pdf',
      ];

      invalidNames.forEach((filename) => {
        const result = validateFilename(filename);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('invalid characters');
      });
    });

    it('should reject filenames that are too long', () => {
      const longFilename = `${'x'.repeat(300)}.pdf`;
      const result = validateFilename(longFilename);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
      expect(result.errorCode).toBeDefined();
    });
  });

  describe('validateFile', () => {
    it('should pass comprehensive validation for valid PDF files', () => {
      // Create a file with sufficient size to pass minimum size validation
      const content = 'x'.repeat(2048); // 2KB content
      const validFile = new File([content], 'valid-document.pdf', {
        type: 'application/pdf',
      });
      const result = validateFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.details?.fileType).toBe('application/pdf');
      expect(result.details?.filename).toBe('valid-document.pdf');
      expect(result.details?.fileSize).toBeGreaterThan(1024);
    });

    it('should fail if any validation check fails', () => {
      const invalidFile = new File(['test'], 'invalid file.txt', {
        type: 'text/plain',
      });
      const result = validateFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.errorCode).toBeDefined();
    });
  });

  describe('validatePDFContent', () => {
    it('should handle PDF content validation', async () => {
      // Note: In a real browser environment, this would validate the actual PDF signature
      // For unit tests, we're testing the error handling path
      const textFile = new File(['This is not a PDF'], 'fake.pdf', { type: 'application/pdf' });

      const result = await validatePDFContent(textFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.errorCode).toBeDefined();
    });

    it('should handle validation errors gracefully', async () => {
      // Test with empty file
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });

      const result = await validatePDFContent(emptyFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^upload-[a-z0-9]+-[a-z0-9]+$/);
      expect(id2).toMatch(/^upload-[a-z0-9]+-[a-z0-9]+$/);
    });

    it('should generate IDs with consistent format', () => {
      const sessionId = generateSessionId();

      expect(sessionId).toMatch(/^upload-/);
      expect(sessionId.split('-')).toHaveLength(3);
    });
  });
});
