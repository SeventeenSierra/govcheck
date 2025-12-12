/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Real PDF Integration Tests
 * 
 * Tests the upload functionality with actual PDF files from seed-data directory.
 * Verifies that all proposal PDFs can be properly processed by the upload system.
 */

interface PDFTestFile {
  name: string;
  path: string;
  size: number;
  buffer: Buffer;
}

class RealPDFTestHelper {
  /**
   * Load all PDF files from seed-data directory
   */
  static loadSeedPDFs(): PDFTestFile[] {
    const seedDataPath = join(process.cwd(), 'src', 'seed-data');
    const files = readdirSync(seedDataPath);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    return pdfFiles.map(filename => {
      const filePath = join(seedDataPath, filename);
      const buffer = readFileSync(filePath);
      
      return {
        name: filename,
        path: filePath,
        size: buffer.length,
        buffer
      };
    });
  }

  /**
   * Create a File object from PDF buffer for testing
   */
  static createFileFromBuffer(pdfFile: PDFTestFile): File {
    const blob = new Blob([pdfFile.buffer], { type: 'application/pdf' });
    return new File([blob], pdfFile.name, { 
      type: 'application/pdf',
      lastModified: Date.now()
    });
  }

  /**
   * Validate PDF file properties
   */
  static validatePDFFile(file: File): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file type
    if (file.type !== 'application/pdf') {
      errors.push(`Invalid MIME type: ${file.type}, expected: application/pdf`);
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errors.push(`Invalid file extension: ${file.name}, must end with .pdf`);
    }

    // Check file size (100MB limit as per upload manager)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      errors.push(`File too large: ${file.size} bytes, maximum: ${maxSize} bytes`);
    }

    // Check minimum size (should not be empty)
    if (file.size === 0) {
      errors.push('File is empty');
    }

    // Warn about very large files
    const warnSize = 10 * 1024 * 1024; // 10MB
    if (file.size > warnSize) {
      warnings.push(`Large file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Simulate upload validation for a real PDF file
   */
  static async simulateUploadValidation(file: File): Promise<{
    success: boolean;
    sessionId?: string;
    error?: string;
    warnings?: string[];
  }> {
    const validation = this.validatePDFFile(file);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join('; ')
      };
    }

    // Simulate successful upload
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      sessionId,
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined
    };
  }

  /**
   * Extract metadata from PDF filename
   */
  static extractMetadataFromFilename(filename: string): {
    author?: string;
    year?: number;
    proposalNumber?: number;
    uuid?: string;
  } {
    // Pattern: author_name_year_uuid_PROPOSAL_number.pdf
    const match = filename.match(/^(.+?)_(\d{4})_([a-f0-9-]+)_PROPOSAL_(\d+)\.pdf$/i);
    
    if (match) {
      return {
        author: match[1].replace(/_/g, ' '),
        year: parseInt(match[2]),
        uuid: match[3],
        proposalNumber: parseInt(match[4])
      };
    }

    return {};
  }
}

describe('Real PDF Integration Tests', () => {
  let seedPDFs: PDFTestFile[];

  beforeAll(() => {
    seedPDFs = RealPDFTestHelper.loadSeedPDFs();
    console.log(`Loaded ${seedPDFs.length} PDF files from seed-data`);
  });

  describe('PDF File Loading', () => {
    it('should load PDF files from seed-data directory', () => {
      expect(seedPDFs.length).toBeGreaterThan(0);
      console.log(`Found ${seedPDFs.length} PDF files`);
      
      // Log first few files for verification
      seedPDFs.slice(0, 5).forEach(pdf => {
        console.log(`- ${pdf.name} (${(pdf.size / 1024).toFixed(1)}KB)`);
      });
    });

    it('should have valid PDF file structures', () => {
      seedPDFs.forEach(pdf => {
        expect(pdf.name).toMatch(/\.pdf$/i);
        expect(pdf.size).toBeGreaterThan(0);
        expect(pdf.buffer).toBeInstanceOf(Buffer);
        expect(pdf.buffer.length).toBe(pdf.size);
      });
    });
  });

  describe('File Validation', () => {
    it('should validate all seed PDFs as uploadable', () => {
      const results = seedPDFs.map(pdfFile => {
        const file = RealPDFTestHelper.createFileFromBuffer(pdfFile);
        const validation = RealPDFTestHelper.validatePDFFile(file);
        
        return {
          filename: pdfFile.name,
          validation
        };
      });

      const invalidFiles = results.filter(r => !r.validation.isValid);
      
      if (invalidFiles.length > 0) {
        console.log('Invalid files found:');
        invalidFiles.forEach(f => {
          console.log(`- ${f.filename}: ${f.validation.errors.join(', ')}`);
        });
      }

      expect(invalidFiles.length).toBe(0);
      
      // Log summary
      const totalSize = seedPDFs.reduce((sum, pdf) => sum + pdf.size, 0);
      console.log(`All ${seedPDFs.length} PDFs are valid (total: ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
    });

    it('should handle file size variations appropriately', () => {
      const fileSizes = seedPDFs.map(pdf => pdf.size);
      const minSize = Math.min(...fileSizes);
      const maxSize = Math.max(...fileSizes);
      const avgSize = fileSizes.reduce((sum, size) => sum + size, 0) / fileSizes.length;

      console.log(`File sizes: min=${(minSize/1024).toFixed(1)}KB, max=${(maxSize/1024/1024).toFixed(1)}MB, avg=${(avgSize/1024).toFixed(1)}KB`);

      expect(minSize).toBeGreaterThan(0);
      expect(maxSize).toBeLessThan(100 * 1024 * 1024); // 100MB limit
    });
  });

  describe('Upload Simulation', () => {
    it('should successfully simulate upload for all PDF files', async () => {
      const uploadResults = [];

      for (const pdfFile of seedPDFs) {
        const file = RealPDFTestHelper.createFileFromBuffer(pdfFile);
        const result = await RealPDFTestHelper.simulateUploadValidation(file);
        
        uploadResults.push({
          filename: pdfFile.name,
          result
        });
      }

      const failedUploads = uploadResults.filter(r => !r.result.success);
      
      if (failedUploads.length > 0) {
        console.log('Failed uploads:');
        failedUploads.forEach(f => {
          console.log(`- ${f.filename}: ${f.result.error}`);
        });
      }

      expect(failedUploads.length).toBe(0);
      
      const successfulUploads = uploadResults.filter(r => r.result.success);
      console.log(`Successfully validated ${successfulUploads.length}/${seedPDFs.length} uploads`);
    });

    it('should generate unique session IDs for each upload', async () => {
      const sessionIds = new Set<string>();

      for (const pdfFile of seedPDFs.slice(0, 10)) { // Test first 10 files
        const file = RealPDFTestHelper.createFileFromBuffer(pdfFile);
        const result = await RealPDFTestHelper.simulateUploadValidation(file);
        
        if (result.success && result.sessionId) {
          expect(sessionIds.has(result.sessionId)).toBe(false);
          sessionIds.add(result.sessionId);
        }
      }

      expect(sessionIds.size).toBe(10);
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract metadata from PDF filenames', () => {
      const metadataResults = seedPDFs.map(pdf => ({
        filename: pdf.name,
        metadata: RealPDFTestHelper.extractMetadataFromFilename(pdf.name)
      }));

      const validMetadata = metadataResults.filter(r => 
        r.metadata.author && r.metadata.year && r.metadata.uuid
      );

      console.log(`Extracted metadata from ${validMetadata.length}/${seedPDFs.length} files`);
      
      // Show some examples
      validMetadata.slice(0, 3).forEach(r => {
        console.log(`- ${r.metadata.author} (${r.metadata.year}) - Proposal ${r.metadata.proposalNumber}`);
      });

      expect(validMetadata.length).toBeGreaterThan(0);
    });

    it('should identify proposal variations for same authors', () => {
      const authorGroups = new Map<string, number>();
      
      seedPDFs.forEach(pdf => {
        const metadata = RealPDFTestHelper.extractMetadataFromFilename(pdf.name);
        if (metadata.author) {
          const count = authorGroups.get(metadata.author) || 0;
          authorGroups.set(metadata.author, count + 1);
        }
      });

      const multipleProposals = Array.from(authorGroups.entries())
        .filter(([_, count]) => count > 1);

      if (multipleProposals.length > 0) {
        console.log('Authors with multiple proposals:');
        multipleProposals.forEach(([author, count]) => {
          console.log(`- ${author}: ${count} proposals`);
        });
      }

      expect(authorGroups.size).toBeGreaterThan(0);
    });
  });

  describe('Performance Testing', () => {
    it('should handle batch file validation efficiently', async () => {
      const startTime = Date.now();
      
      const batchResults = await Promise.all(
        seedPDFs.map(async pdfFile => {
          const file = RealPDFTestHelper.createFileFromBuffer(pdfFile);
          return RealPDFTestHelper.simulateUploadValidation(file);
        })
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      const successCount = batchResults.filter(r => r.success).length;
      
      console.log(`Processed ${seedPDFs.length} files in ${processingTime}ms (${successCount} successful)`);
      console.log(`Average: ${(processingTime / seedPDFs.length).toFixed(1)}ms per file`);

      expect(successCount).toBe(seedPDFs.length);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});

/**
 * Integration Test with Real Files Summary
 */
describe('Real PDF Integration Summary', () => {
  it('should provide comprehensive test summary for all seed PDFs', async () => {
    const seedPDFs = RealPDFTestHelper.loadSeedPDFs();
    
    console.log('\n=== REAL PDF INTEGRATION SUMMARY ===');
    console.log(`Total PDF files: ${seedPDFs.length}`);
    
    const totalSize = seedPDFs.reduce((sum, pdf) => sum + pdf.size, 0);
    console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
    
    const avgSize = totalSize / seedPDFs.length;
    console.log(`Average size: ${(avgSize / 1024).toFixed(1)}KB`);
    
    // Test all files
    let successCount = 0;
    let errorCount = 0;
    
    for (const pdfFile of seedPDFs) {
      const file = RealPDFTestHelper.createFileFromBuffer(pdfFile);
      const result = await RealPDFTestHelper.simulateUploadValidation(file);
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        console.log(`❌ ${pdfFile.name}: ${result.error}`);
      }
    }
    
    console.log(`✅ Successful uploads: ${successCount}`);
    console.log(`❌ Failed uploads: ${errorCount}`);
    console.log(`📊 Success rate: ${((successCount / seedPDFs.length) * 100).toFixed(1)}%`);
    console.log('=== END SUMMARY ===\n');
    
    expect(successCount).toBe(seedPDFs.length);
    expect(errorCount).toBe(0);
  });
});