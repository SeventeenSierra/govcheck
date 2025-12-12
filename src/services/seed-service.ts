/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Service for managing seeded documents and database seeding operations.
 * 
 * This service provides functionality to:
 * - Check seeding status
 * - Get list of seeded documents
 * - Verify file availability
 * - Trigger reseeding operations
 */

export interface SeedingStatus {
  seeded_count: number;
  expected_count: number;
  is_complete: boolean;
  completion_percentage: number;
  error?: string;
}

export interface SeededDocument {
  document_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  s3_key: string;
  metadata: Record<string, any>;
  uploaded_at: string | null;
}

export interface FileVerification {
  total_expected: number;
  existing_files: number;
  missing_files: number;
  missing_file_details: Array<{
    document_id: string;
    filename: string;
    expected_path: string;
  }>;
  existing_file_details: Array<{
    document_id: string;
    filename: string;
    file_size: number;
  }>;
  verification_complete: boolean;
  error?: string;
}

export interface SeedingResult {
  success: boolean;
  message: string;
  seeded_count: number;
  errors: string[];
  skipped: boolean;
}

export class SeedService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/seed') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get current seeding status
   */
  async getSeedingStatus(): Promise<SeedingStatus> {
    try {
      const response = await fetch(`${this.baseUrl}?action=status`);
      
      if (!response.ok) {
        throw new Error(`Failed to get seeding status: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get seeding status');
      }

      return result.data.seeding_status;
    } catch (error) {
      console.error('Error getting seeding status:', error);
      throw error;
    }
  }

  /**
   * Get list of all seeded documents
   */
  async getSeededDocuments(): Promise<SeededDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=documents`);
      
      if (!response.ok) {
        throw new Error(`Failed to get seeded documents: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get seeded documents');
      }

      return result.data.documents;
    } catch (error) {
      console.error('Error getting seeded documents:', error);
      throw error;
    }
  }

  /**
   * Verify that all seeded documents have corresponding files
   */
  async verifySeededFiles(): Promise<FileVerification> {
    try {
      const response = await fetch(`${this.baseUrl}?action=verify`);
      
      if (!response.ok) {
        throw new Error(`Failed to verify seeded files: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify seeded files');
      }

      return result.data.verification;
    } catch (error) {
      console.error('Error verifying seeded files:', error);
      throw error;
    }
  }

  /**
   * Trigger database reseeding
   */
  async reseedDatabase(): Promise<SeedingResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reseed database: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reseed database');
      }

      return result.data.result;
    } catch (error) {
      console.error('Error reseeding database:', error);
      throw error;
    }
  }

  /**
   * Get seeded document by ID
   */
  async getSeededDocumentById(documentId: string): Promise<SeededDocument | null> {
    try {
      const documents = await this.getSeededDocuments();
      return documents.find(doc => doc.document_id === documentId) || null;
    } catch (error) {
      console.error('Error getting seeded document by ID:', error);
      throw error;
    }
  }

  /**
   * Get seeded documents by author
   */
  async getSeededDocumentsByAuthor(author: string): Promise<SeededDocument[]> {
    try {
      const documents = await this.getSeededDocuments();
      return documents.filter(doc => 
        doc.metadata.author && 
        doc.metadata.author.toLowerCase().includes(author.toLowerCase())
      );
    } catch (error) {
      console.error('Error getting seeded documents by author:', error);
      throw error;
    }
  }

  /**
   * Get seeded documents by funder
   */
  async getSeededDocumentsByFunder(funder: string): Promise<SeededDocument[]> {
    try {
      const documents = await this.getSeededDocuments();
      return documents.filter(doc => 
        doc.metadata.funder && 
        doc.metadata.funder.toLowerCase().includes(funder.toLowerCase())
      );
    } catch (error) {
      console.error('Error getting seeded documents by funder:', error);
      throw error;
    }
  }

  /**
   * Get seeded documents by year
   */
  async getSeededDocumentsByYear(year: number): Promise<SeededDocument[]> {
    try {
      const documents = await this.getSeededDocuments();
      return documents.filter(doc => 
        doc.metadata.year === year
      );
    } catch (error) {
      console.error('Error getting seeded documents by year:', error);
      throw error;
    }
  }

  /**
   * Search seeded documents by title or content
   */
  async searchSeededDocuments(query: string): Promise<SeededDocument[]> {
    try {
      const documents = await this.getSeededDocuments();
      const lowerQuery = query.toLowerCase();
      
      return documents.filter(doc => 
        doc.filename.toLowerCase().includes(lowerQuery) ||
        doc.original_filename.toLowerCase().includes(lowerQuery) ||
        (doc.metadata.title && doc.metadata.title.toLowerCase().includes(lowerQuery)) ||
        (doc.metadata.author && doc.metadata.author.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching seeded documents:', error);
      throw error;
    }
  }

  /**
   * Get seeding statistics
   */
  async getSeedingStatistics(): Promise<{
    status: SeedingStatus;
    verification: FileVerification;
    documents: SeededDocument[];
    statistics: {
      total_documents: number;
      by_funder: Record<string, number>;
      by_year: Record<string, number>;
      by_author: Record<string, number>;
      average_file_size: number;
      total_file_size: number;
    };
  }> {
    try {
      const [status, verification, documents] = await Promise.all([
        this.getSeedingStatus(),
        this.verifySeededFiles(),
        this.getSeededDocuments(),
      ]);

      // Calculate statistics
      const byFunder: Record<string, number> = {};
      const byYear: Record<string, number> = {};
      const byAuthor: Record<string, number> = {};
      let totalFileSize = 0;

      documents.forEach(doc => {
        // Count by funder
        const funder = doc.metadata.funder || 'Unknown';
        byFunder[funder] = (byFunder[funder] || 0) + 1;

        // Count by year
        const year = doc.metadata.year?.toString() || 'Unknown';
        byYear[year] = (byYear[year] || 0) + 1;

        // Count by author
        const author = doc.metadata.author || 'Unknown';
        byAuthor[author] = (byAuthor[author] || 0) + 1;

        // Sum file sizes
        totalFileSize += doc.file_size || 0;
      });

      const averageFileSize = documents.length > 0 ? totalFileSize / documents.length : 0;

      return {
        status,
        verification,
        documents,
        statistics: {
          total_documents: documents.length,
          by_funder: byFunder,
          by_year: byYear,
          by_author: byAuthor,
          average_file_size: averageFileSize,
          total_file_size: totalFileSize,
        },
      };
    } catch (error) {
      console.error('Error getting seeding statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const seedService = new SeedService();