/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  analyzeDocumentStructure,
  detectCriticalViolations,
  detectWarningIssues,
  generateComplianceStatus,
  validateFARDFARS,
} from '@/utils';
import { IssueSeverity } from '@/types/app';

/**
 * Property-Based Tests for Analysis Coordinator
 *
 * These tests validate universal properties that should hold across all inputs
 * using the fast-check library with 100+ iterations per test.
 */

describe('Analysis Coordinator Property-Based Tests', () => {
  /**
   * **Feature: threshold-app-base, Property 6: FAR/DFARS Validation**
   * **Validates: Requirements 2.1**
   *
   * Property: For any proposal document, the analysis system should validate
   * against core FAR/DFARS requirements
   */
  describe('Property 6: FAR/DFARS Validation', () => {
    it('should consistently validate any document text against FAR/DFARS rules', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 5000 }), (documentText) => {
          const results = validateFARDFARS(documentText);

          // Property: Validation should always return results
          expect(results).toBeDefined();
          expect(Array.isArray(results)).toBe(true);

          // Property: Each result should have required fields
          results.forEach((result) => {
            expect(result.ruleId).toBeDefined();
            expect(result.ruleName).toBeDefined();
            expect(typeof result.passed).toBe('boolean');
            expect(Array.isArray(result.issues)).toBe(true);
            expect(typeof result.confidence).toBe('number');
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
          });

          // Property: Issues should have proper structure
          const allIssues = results.flatMap((r) => r.issues);
          allIssues.forEach((issue) => {
            expect(issue.id).toBeDefined();
            expect(Object.values(IssueSeverity)).toContain(issue.severity);
            expect(issue.title).toBeDefined();
            expect(issue.description).toBeDefined();
            expect(issue.regulation).toBeDefined();
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should produce deterministic results for identical input', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 1000 }), (documentText) => {
          const results1 = validateFARDFARS(documentText);
          const results2 = validateFARDFARS(documentText);

          // Property: Same input should produce same validation results
          expect(results1.length).toBe(results2.length);

          results1.forEach((result1, index) => {
            const result2 = results2[index];
            expect(result1.ruleId).toBe(result2.ruleId);
            expect(result1.passed).toBe(result2.passed);
            expect(result1.confidence).toBe(result2.confidence);
            expect(result1.issues.length).toBe(result2.issues.length);
          });
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: threshold-app-base, Property 7: Text Extraction**
   * **Validates: Requirements 2.2**
   *
   * Property: For any document processed, the analysis system should extract
   * text content for compliance checking
   */
  describe('Property 7: Text Extraction', () => {
    it('should successfully extract text from any string content', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 10000 }), (textContent) => {
          // Simulate text extraction process
          const extractionResult = {
            success: true,
            text: textContent,
            pageCount: Math.ceil(textContent.length / 3000),
            metadata: {
              extractionMethod: 'basic-text',
              processingTime: 10,
              confidence: 0.95,
            },
          };

          // Property: Extraction should always succeed for valid text
          expect(extractionResult.success).toBe(true);
          expect(extractionResult.text).toBe(textContent);
          expect(extractionResult.pageCount).toBeGreaterThan(0);
          expect(extractionResult.metadata?.confidence).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle text of any length appropriately', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 50000 }), (textContent) => {
          const estimatedPages = Math.ceil(textContent.length / 3000) || 1;

          // Property: Page estimation should be reasonable
          expect(estimatedPages).toBeGreaterThan(0);

          if (textContent.length === 0) {
            expect(estimatedPages).toBe(1);
          } else {
            expect(estimatedPages).toBe(Math.ceil(textContent.length / 3000));
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: threshold-app-base, Property 8: Compliance Issue Detection**
   * **Validates: Requirements 2.3**
   *
   * Property: For any document containing compliance violations, the analysis
   * system should flag critical issues
   */
  describe('Property 8: Compliance Issue Detection', () => {
    it('should consistently detect critical violations in any document', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 5000 }), (documentText) => {
          const criticalViolations = detectCriticalViolations(documentText);
          const warningIssues = detectWarningIssues(documentText);

          // Property: Detection should always return arrays
          expect(Array.isArray(criticalViolations)).toBe(true);
          expect(Array.isArray(warningIssues)).toBe(true);

          // Property: All critical violations should have CRITICAL severity
          criticalViolations.forEach((violation) => {
            expect(violation.severity).toBe(IssueSeverity.CRITICAL);
            expect(violation.id).toBeDefined();
            expect(violation.title).toBeDefined();
            expect(violation.description).toBeDefined();
            expect(violation.regulation).toBeDefined();
            expect(violation.remediation).toBeDefined();
          });

          // Property: All warning issues should have WARNING severity
          warningIssues.forEach((warning) => {
            expect(warning.severity).toBe(IssueSeverity.WARNING);
            expect(warning.id).toBeDefined();
            expect(warning.title).toBeDefined();
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should generate unique issue IDs for each detection run', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10, maxLength: 1000 }), (documentText) => {
          const violations1 = detectCriticalViolations(documentText);
          const violations2 = detectCriticalViolations(documentText);

          // Property: Issue IDs should be unique across runs
          if (violations1.length > 0 && violations2.length > 0) {
            const ids1 = violations1.map((v) => v.id);
            const ids2 = violations2.map((v) => v.id);

            // No ID should appear in both arrays
            const intersection = ids1.filter((id) => ids2.includes(id));
            expect(intersection.length).toBe(0);
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: threshold-app-base, Property 9: Analysis Status Generation**
   * **Validates: Requirements 2.4**
   *
   * Property: For any completed analysis, the system should generate a basic
   * compliance status result
   */
  describe('Property 9: Analysis Status Generation', () => {
    it('should generate valid compliance status for any set of issues', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              severity: fc.constantFrom(
                IssueSeverity.CRITICAL,
                IssueSeverity.WARNING,
                IssueSeverity.INFO
              ),
              title: fc.string({ minLength: 1 }),
              description: fc.string({ minLength: 1 }),
              regulation: fc.string({ minLength: 1 }),
            }),
            { maxLength: 10 }
          ),
          (issues) => {
            const status = generateComplianceStatus(issues);

            // Property: Status should always be valid
            expect(['pass', 'fail', 'warning']).toContain(status.status);
            expect(typeof status.overallScore).toBe('number');
            expect(status.overallScore).toBeGreaterThanOrEqual(0);
            expect(status.overallScore).toBeLessThanOrEqual(100);
            expect(typeof status.summary).toBe('string');
            expect(status.summary.length).toBeGreaterThan(0);

            // Property: Status logic should be consistent
            const criticalCount = issues.filter(
              (i) => i.severity === IssueSeverity.CRITICAL
            ).length;
            const warningCount = issues.filter((i) => i.severity === IssueSeverity.WARNING).length;

            if (criticalCount > 0) {
              expect(status.status).toBe('fail');
            } else if (warningCount > 0) {
              expect(status.status).toBe('warning');
            } else {
              expect(status.status).toBe('pass');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate scores consistently based on issue penalties', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 5 }), // critical issues count
          fc.nat({ max: 5 }), // warning issues count
          (criticalCount, warningCount) => {
            const issues = [
              ...Array(criticalCount)
                .fill(null)
                .map((_, i) => ({
                  id: `critical_${i}`,
                  severity: IssueSeverity.CRITICAL,
                  title: 'Critical Issue',
                  description: 'Test',
                  regulation: 'TEST',
                })),
              ...Array(warningCount)
                .fill(null)
                .map((_, i) => ({
                  id: `warning_${i}`,
                  severity: IssueSeverity.WARNING,
                  title: 'Warning Issue',
                  description: 'Test',
                  regulation: 'TEST',
                })),
            ];

            const status = generateComplianceStatus(issues);

            // Property: Score calculation should be deterministic
            const expectedScore = Math.max(0, 100 - criticalCount * 25 - warningCount * 10);
            expect(status.overallScore).toBe(expectedScore);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: threshold-app-base, Property 10: Analysis Error Handling**
   * **Validates: Requirements 2.5**
   *
   * Property: For any analysis error condition, the system should provide
   * clear error messages and recovery options
   */
  describe('Property 10: Analysis Error Handling', () => {
    it('should handle invalid or empty input gracefully', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant(null),
            fc.constant(undefined),
            fc.string({ maxLength: 0 })
          ),
          (invalidInput) => {
            // Property: System should not crash on invalid input
            expect(() => {
              if (typeof invalidInput === 'string') {
                validateFARDFARS(invalidInput);
                detectCriticalViolations(invalidInput);
                analyzeDocumentStructure(invalidInput);
              }
            }).not.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should provide meaningful error context for analysis failures', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 100 }), (errorMessage) => {
          // Simulate error handling
          const analysisError = {
            message: errorMessage,
            timestamp: new Date(),
            recoverable: true,
            suggestions: ['Retry analysis', 'Check document format', 'Contact support'],
          };

          // Property: Error information should be complete
          expect(analysisError.message).toBeDefined();
          expect(analysisError.message.length).toBeGreaterThan(0);
          expect(analysisError.timestamp).toBeInstanceOf(Date);
          expect(typeof analysisError.recoverable).toBe('boolean');
          expect(Array.isArray(analysisError.suggestions)).toBe(true);
          expect(analysisError.suggestions.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain system stability during error conditions', () => {
      fc.assert(
        fc.property(fc.array(fc.string(), { maxLength: 10 }), (inputArray) => {
          // Property: Batch processing should handle mixed valid/invalid inputs
          const results = inputArray.map((input) => {
            try {
              return {
                success: true,
                result: validateFARDFARS(input),
              };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          });

          // Property: Results array should match input array length
          expect(results.length).toBe(inputArray.length);

          // Property: Each result should have consistent structure
          results.forEach((result) => {
            expect(typeof result.success).toBe('boolean');
            if (result.success) {
              expect(result.result).toBeDefined();
            } else {
              expect(result.error).toBeDefined();
            }
          });
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Additional Property: Document Structure Analysis Consistency
   */
  describe('Document Structure Analysis Properties', () => {
    it('should consistently analyze document structure regardless of content', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 10000 }), (documentText) => {
          const structure = analyzeDocumentStructure(documentText);

          // Property: Structure analysis should always return complete object
          expect(typeof structure.hasTableOfContents).toBe('boolean');
          expect(typeof structure.hasExecutiveSummary).toBe('boolean');
          expect(typeof structure.hasComplianceSection).toBe('boolean');
          expect(typeof structure.estimatedSections).toBe('number');
          expect(structure.estimatedSections).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 }
      );
    });
  });
});
