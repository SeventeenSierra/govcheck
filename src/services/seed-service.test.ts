/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SeedService } from './seed-service';

// Mock fetch globally
global.fetch = vi.fn();

describe('SeedService', () => {
  let seedService: SeedService;

  beforeEach(() => {
    seedService = new SeedService('/api/seed');
    vi.clearAllMocks();
  });

  describe('getSeedingStatus', () => {
    it('should return seeding status successfully', async () => {
      const mockStatus = {
        seeded_count: 30,
        expected_count: 30,
        is_complete: true,
        completion_percentage: 100,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { seeding_status: mockStatus },
        }),
      });

      const result = await seedService.getSeedingStatus();

      expect(result).toEqual(mockStatus);
      expect(global.fetch).toHaveBeenCalledWith('/api/seed?action=status');
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(seedService.getSeedingStatus()).rejects.toThrow(
        'Failed to get seeding status: Internal Server Error'
      );
    });
  });

  describe('getSeededDocuments', () => {
    it('should return list of seeded documents', async () => {
      const mockDocuments = [
        {
          document_id: 'test-id-1',
          filename: 'test_document_1.pdf',
          original_filename: 'test_document_1.pdf',
          file_size: 1024000,
          s3_key: 'seed-data/test_document_1.pdf',
          metadata: { author: 'Test Author', year: 2023 },
          uploaded_at: '2023-01-01T00:00:00Z',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { documents: mockDocuments },
        }),
      });

      const result = await seedService.getSeededDocuments();

      expect(result).toEqual(mockDocuments);
      expect(global.fetch).toHaveBeenCalledWith('/api/seed?action=documents');
    });
  });

  describe('verifySeededFiles', () => {
    it('should return file verification results', async () => {
      const mockVerification = {
        total_expected: 30,
        existing_files: 30,
        missing_files: 0,
        missing_file_details: [],
        existing_file_details: [],
        verification_complete: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { verification: mockVerification },
        }),
      });

      const result = await seedService.verifySeededFiles();

      expect(result).toEqual(mockVerification);
      expect(global.fetch).toHaveBeenCalledWith('/api/seed?action=verify');
    });
  });

  describe('reseedDatabase', () => {
    it('should trigger database reseeding', async () => {
      const mockResult = {
        success: true,
        message: 'Successfully seeded 30 documents',
        seeded_count: 30,
        errors: [],
        skipped: false,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { result: mockResult },
        }),
      });

      const result = await seedService.reseedDatabase();

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('getSeededDocumentById', () => {
    it('should return document by ID', async () => {
      const mockDocuments = [
        {
          document_id: 'test-id-1',
          filename: 'test_document_1.pdf',
          original_filename: 'test_document_1.pdf',
          file_size: 1024000,
          s3_key: 'seed-data/test_document_1.pdf',
          metadata: { author: 'Test Author', year: 2023 },
          uploaded_at: '2023-01-01T00:00:00Z',
        },
        {
          document_id: 'test-id-2',
          filename: 'test_document_2.pdf',
          original_filename: 'test_document_2.pdf',
          file_size: 1024000,
          s3_key: 'seed-data/test_document_2.pdf',
          metadata: { author: 'Another Author', year: 2023 },
          uploaded_at: '2023-01-01T00:00:00Z',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { documents: mockDocuments },
        }),
      });

      const result = await seedService.getSeededDocumentById('test-id-1');

      expect(result).toEqual(mockDocuments[0]);
    });

    it('should return null for non-existent document', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { documents: [] },
        }),
      });

      const result = await seedService.getSeededDocumentById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('searchSeededDocuments', () => {
    it('should search documents by query', async () => {
      const mockDocuments = [
        {
          document_id: 'test-id-1',
          filename: 'jensen_jan_2015_proposal.pdf',
          original_filename: 'jensen_jan_2015_proposal.pdf',
          file_size: 1024000,
          s3_key: 'seed-data/jensen_jan_2015_proposal.pdf',
          metadata: { author: 'Jan Jensen', year: 2015, title: 'pKa Prediction' },
          uploaded_at: '2023-01-01T00:00:00Z',
        },
        {
          document_id: 'test-id-2',
          filename: 'smith_john_2020_proposal.pdf',
          original_filename: 'smith_john_2020_proposal.pdf',
          file_size: 1024000,
          s3_key: 'seed-data/smith_john_2020_proposal.pdf',
          metadata: { author: 'John Smith', year: 2020, title: 'AI Research' },
          uploaded_at: '2023-01-01T00:00:00Z',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { documents: mockDocuments },
        }),
      });

      const result = await seedService.searchSeededDocuments('jensen');

      expect(result).toHaveLength(1);
      expect(result[0].metadata.author).toBe('Jan Jensen');
    });
  });

  describe('getSeedingStatistics', () => {
    it('should return comprehensive seeding statistics', async () => {
      const mockStatus = {
        seeded_count: 2,
        expected_count: 30,
        is_complete: false,
        completion_percentage: 6.67,
      };

      const mockVerification = {
        total_expected: 30,
        existing_files: 2,
        missing_files: 28,
        missing_file_details: [],
        existing_file_details: [],
        verification_complete: false,
      };

      const mockDocuments = [
        {
          document_id: 'test-id-1',
          filename: 'test1.pdf',
          original_filename: 'test1.pdf',
          file_size: 1000000,
          s3_key: 'seed-data/test1.pdf',
          metadata: { author: 'Author A', year: 2020, funder: 'NSF' },
          uploaded_at: '2023-01-01T00:00:00Z',
        },
        {
          document_id: 'test-id-2',
          filename: 'test2.pdf',
          original_filename: 'test2.pdf',
          file_size: 2000000,
          s3_key: 'seed-data/test2.pdf',
          metadata: { author: 'Author B', year: 2021, funder: 'NIH' },
          uploaded_at: '2023-01-01T00:00:00Z',
        },
      ];

      // Mock the three API calls
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { seeding_status: mockStatus } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { verification: mockVerification } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { documents: mockDocuments } }),
        });

      const result = await seedService.getSeedingStatistics();

      expect(result.status).toEqual(mockStatus);
      expect(result.verification).toEqual(mockVerification);
      expect(result.documents).toEqual(mockDocuments);
      expect(result.statistics.total_documents).toBe(2);
      expect(result.statistics.by_funder).toEqual({ NSF: 1, NIH: 1 });
      expect(result.statistics.by_year).toEqual({ '2020': 1, '2021': 1 });
      expect(result.statistics.average_file_size).toBe(1500000);
      expect(result.statistics.total_file_size).toBe(3000000);
    });
  });
});
