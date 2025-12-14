/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * PDF Upload Demo Utility
 *
 * Provides utilities for testing PDF uploads with real seed data files.
 * This can be used for manual testing and demonstration purposes.
 */

export interface PDFDemoFile {
  name: string;
  displayName: string;
  author: string;
  year: number;
  proposalNumber: number;
  size: number;
  sizeFormatted: string;
  file: File;
  metadata: {
    uuid: string;
    category: 'small' | 'medium' | 'large';
    description: string;
  };
}

export class PDFUploadDemo {
  private static pdfFiles: PDFDemoFile[] | null = null;

  /**
   * Load and prepare all PDF files for demo
   */
  static async loadDemoFiles(): Promise<PDFDemoFile[]> {
    if (this.pdfFiles) {
      return this.pdfFiles;
    }

    const seedDataPath = join(process.cwd(), 'src', 'seed-data');
    const files = readdirSync(seedDataPath);
    const pdfFiles = files.filter((file) => file.endsWith('.pdf'));

    this.pdfFiles = pdfFiles.map((filename) => {
      const filePath = join(seedDataPath, filename);
      const buffer = readFileSync(filePath);

      // Extract metadata from filename
      const match = filename.match(/^(.+?)_(\d{4})_([a-f0-9-]+)_PROPOSAL_(\d+)\.pdf$/i);
      const author = match ? match[1].replace(/_/g, ' ') : 'Unknown';
      const year = match ? parseInt(match[2]) : 0;
      const uuid = match ? match[3] : '';
      const proposalNumber = match ? parseInt(match[4]) : 1;

      // Create File object
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const file = new File([blob], filename, {
        type: 'application/pdf',
        lastModified: Date.now(),
      });

      // Categorize by size
      const sizeInMB = buffer.length / (1024 * 1024);
      let category: 'small' | 'medium' | 'large';
      if (sizeInMB < 0.5) category = 'small';
      else if (sizeInMB < 2) category = 'medium';
      else category = 'large';

      return {
        name: filename,
        displayName: `${author} (${year}) - Proposal ${proposalNumber}`,
        author,
        year,
        proposalNumber,
        size: buffer.length,
        sizeFormatted: this.formatFileSize(buffer.length),
        file,
        metadata: {
          uuid,
          category,
          description: `${category.charAt(0).toUpperCase() + category.slice(1)} proposal by ${author}`,
        },
      };
    });

    // Sort by author name and year
    this.pdfFiles.sort((a, b) => {
      if (a.author !== b.author) {
        return a.author.localeCompare(b.author);
      }
      return a.year - b.year;
    });

    return this.pdfFiles;
  }

  /**
   * Get files by category
   */
  static async getFilesByCategory(category: 'small' | 'medium' | 'large'): Promise<PDFDemoFile[]> {
    const files = await this.loadDemoFiles();
    return files.filter((f) => f.metadata.category === category);
  }

  /**
   * Get files by author
   */
  static async getFilesByAuthor(author: string): Promise<PDFDemoFile[]> {
    const files = await this.loadDemoFiles();
    return files.filter((f) => f.author.toLowerCase().includes(author.toLowerCase()));
  }

  /**
   * Get a random sample of files for testing
   */
  static async getRandomSample(count: number = 5): Promise<PDFDemoFile[]> {
    const files = await this.loadDemoFiles();
    const shuffled = [...files].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get demo files for different test scenarios
   */
  static async getTestScenarios(): Promise<{
    small: PDFDemoFile;
    medium: PDFDemoFile;
    large: PDFDemoFile;
    multipleFromSameAuthor: PDFDemoFile[];
    recentProposals: PDFDemoFile[];
  }> {
    const files = await this.loadDemoFiles();

    const smallFiles = files.filter((f) => f.metadata.category === 'small');
    const mediumFiles = files.filter((f) => f.metadata.category === 'medium');
    const largeFiles = files.filter((f) => f.metadata.category === 'large');

    // Find authors with multiple proposals
    const authorCounts = new Map<string, PDFDemoFile[]>();
    files.forEach((f) => {
      const existing = authorCounts.get(f.author) || [];
      existing.push(f);
      authorCounts.set(f.author, existing);
    });

    const multipleProposalAuthors = Array.from(authorCounts.entries()).filter(
      ([_, proposals]) => proposals.length > 1
    );

    // Get recent proposals (2020+)
    const recentProposals = files.filter((f) => f.year >= 2020);

    return {
      small: smallFiles[0],
      medium: mediumFiles[0],
      large: largeFiles[0],
      multipleFromSameAuthor: multipleProposalAuthors[0]?.[1] || [],
      recentProposals: recentProposals.slice(0, 5),
    };
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Generate demo statistics
   */
  static async getDemoStatistics(): Promise<{
    totalFiles: number;
    totalSize: string;
    averageSize: string;
    sizeDistribution: {
      small: number;
      medium: number;
      large: number;
    };
    yearRange: {
      earliest: number;
      latest: number;
    };
    uniqueAuthors: number;
    authorsWithMultipleProposals: number;
  }> {
    const files = await this.loadDemoFiles();

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const averageSize = totalSize / files.length;

    const sizeDistribution = {
      small: files.filter((f) => f.metadata.category === 'small').length,
      medium: files.filter((f) => f.metadata.category === 'medium').length,
      large: files.filter((f) => f.metadata.category === 'large').length,
    };

    const years = files.map((f) => f.year).filter((y) => y > 0);
    const yearRange = {
      earliest: Math.min(...years),
      latest: Math.max(...years),
    };

    const uniqueAuthors = new Set(files.map((f) => f.author)).size;

    const authorCounts = new Map<string, number>();
    files.forEach((f) => {
      authorCounts.set(f.author, (authorCounts.get(f.author) || 0) + 1);
    });
    const authorsWithMultipleProposals = Array.from(authorCounts.values()).filter(
      (count) => count > 1
    ).length;

    return {
      totalFiles: files.length,
      totalSize: this.formatFileSize(totalSize),
      averageSize: this.formatFileSize(averageSize),
      sizeDistribution,
      yearRange,
      uniqueAuthors,
      authorsWithMultipleProposals,
    };
  }

  /**
   * Create a demo file list for display
   */
  static async createDemoFileList(): Promise<string> {
    const files = await this.loadDemoFiles();
    const stats = await this.getDemoStatistics();

    let output = '# PDF Upload Demo Files\n\n';
    output += `## Statistics\n`;
    output += `- **Total Files**: ${stats.totalFiles}\n`;
    output += `- **Total Size**: ${stats.totalSize}\n`;
    output += `- **Average Size**: ${stats.averageSize}\n`;
    output += `- **Year Range**: ${stats.yearRange.earliest} - ${stats.yearRange.latest}\n`;
    output += `- **Unique Authors**: ${stats.uniqueAuthors}\n`;
    output += `- **Authors with Multiple Proposals**: ${stats.authorsWithMultipleProposals}\n\n`;

    output += `## Size Distribution\n`;
    output += `- **Small** (< 0.5MB): ${stats.sizeDistribution.small} files\n`;
    output += `- **Medium** (0.5-2MB): ${stats.sizeDistribution.medium} files\n`;
    output += `- **Large** (> 2MB): ${stats.sizeDistribution.large} files\n\n`;

    output += `## Available Files\n\n`;

    files.forEach((file, index) => {
      output += `${index + 1}. **${file.displayName}**\n`;
      output += `   - File: \`${file.name}\`\n`;
      output += `   - Size: ${file.sizeFormatted} (${file.metadata.category})\n`;
      output += `   - Description: ${file.metadata.description}\n\n`;
    });

    return output;
  }
}

/**
 * Export for easy access in tests and demos
 */
export default PDFUploadDemo;
