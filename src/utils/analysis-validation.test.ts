/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, expect, it } from 'vitest';
import { IssueSeverity } from '@/types/app';
import {
  CORE_VALIDATION_RULES,
  calculateComplianceScore,
  extractRegulatoryReferences,
  hasBasicComplianceElements,
  type ValidationRule,
  validateFARDFARS,
} from './analysis-validation';

describe('Analysis Validation Utilities', () => {
  describe('validateFARDFARS', () => {
    it('should validate compliant text against FAR/DFARS rules', () => {
      const compliantText = `
        This proposal includes basic safeguarding measures and cybersecurity protocols.
        We comply with NIST 800-171 requirements for controlled unclassified information.
        Our business ethics and code of conduct program ensures compliance.
        We have anti-trafficking policies and training programs in place.
        Small business subcontracting plan is included as required.
      `;

      const results = validateFARDFARS(compliantText);

      expect(results).toHaveLength(CORE_VALIDATION_RULES.length);

      // Should pass most required rules
      const passedResults = results.filter((r) => r.passed);
      expect(passedResults.length).toBeGreaterThan(3);

      // Should have minimal issues
      const allIssues = results.flatMap((r) => r.issues);
      expect(allIssues.length).toBeLessThan(3);
    });

    it('should flag non-compliant text', () => {
      const nonCompliantText = 'Basic proposal without any compliance information';

      const results = validateFARDFARS(nonCompliantText);

      expect(results).toHaveLength(CORE_VALIDATION_RULES.length);

      // Should fail required rules
      const failedResults = results.filter((r) => !r.passed);
      expect(failedResults.length).toBeGreaterThan(0);

      // Should have critical issues
      const criticalIssues = results
        .flatMap((r) => r.issues)
        .filter((issue) => issue.severity === IssueSeverity.CRITICAL);
      expect(criticalIssues.length).toBeGreaterThan(0);
    });

    it('should use custom validation rules when provided', () => {
      const customRules: ValidationRule[] = [
        {
          id: 'custom_rule',
          name: 'Custom Test Rule',
          section: 'TEST 1.0',
          pattern: /custom\s+requirement/i,
          required: true,
          description: 'Test custom rule',
          remediation: 'Add custom requirement',
        },
      ];

      const text = 'This text has custom requirement mentioned';
      const results = validateFARDFARS(text, customRules);

      expect(results).toHaveLength(1);
      expect(results[0].ruleId).toBe('custom_rule');
      expect(results[0].passed).toBe(true);
    });

    it('should generate unique issue IDs', () => {
      const nonCompliantText = 'Non-compliant text';

      const results1 = validateFARDFARS(nonCompliantText);
      const results2 = validateFARDFARS(nonCompliantText);

      const issues1 = results1.flatMap((r) => r.issues);
      const issues2 = results2.flatMap((r) => r.issues);

      if (issues1.length > 0 && issues2.length > 0) {
        expect(issues1[0].id).not.toBe(issues2[0].id);
      }
    });

    it('should include proper remediation guidance', () => {
      const nonCompliantText = 'Basic proposal';

      const results = validateFARDFARS(nonCompliantText);
      const issues = results.flatMap((r) => r.issues);

      issues.forEach((issue) => {
        expect(issue.remediation).toBeDefined();
        expect(issue.remediation?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateComplianceScore', () => {
    it('should calculate perfect score for all passed rules', () => {
      const allPassedResults = CORE_VALIDATION_RULES.map((rule) => ({
        ruleId: rule.id,
        ruleName: rule.name,
        passed: true,
        issues: [],
        confidence: 0.9,
      }));

      const score = calculateComplianceScore(allPassedResults);
      expect(score).toBe(100);
    });

    it('should penalize critical issues', () => {
      const resultsWithCriticalIssues = [
        {
          ruleId: 'test_rule',
          ruleName: 'Test Rule',
          passed: false,
          issues: [
            {
              id: 'issue1',
              severity: IssueSeverity.CRITICAL,
              title: 'Critical Issue',
              description: 'Test critical issue',
              regulation: 'TEST 1.0',
            },
          ],
          confidence: 0.8,
        },
      ];

      const score = calculateComplianceScore(resultsWithCriticalIssues);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should not go below zero', () => {
      const manyFailedResults = Array(10)
        .fill(null)
        .map((_, i) => ({
          ruleId: `rule_${i}`,
          ruleName: `Rule ${i}`,
          passed: false,
          issues: [
            {
              id: `issue_${i}`,
              severity: IssueSeverity.CRITICAL,
              title: 'Critical Issue',
              description: 'Test issue',
              regulation: 'TEST 1.0',
            },
          ],
          confidence: 0.5,
        }));

      const score = calculateComplianceScore(manyFailedResults);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty results array', () => {
      const score = calculateComplianceScore([]);
      expect(score).toBe(0);
    });
  });

  describe('hasBasicComplianceElements', () => {
    it('should detect basic compliance keywords', () => {
      const textWithCompliance =
        'This document outlines our compliance procedures and requirements';
      expect(hasBasicComplianceElements(textWithCompliance)).toBe(true);
    });

    it('should detect standards and policies', () => {
      const textWithStandards = 'We follow industry standards and company policies';
      expect(hasBasicComplianceElements(textWithStandards)).toBe(true);
    });

    it('should return false for text without compliance elements', () => {
      const basicText = 'This is just a regular document about general topics';
      expect(hasBasicComplianceElements(basicText)).toBe(false);
    });

    it('should be case insensitive', () => {
      const upperCaseText = 'COMPLIANCE AND REQUIREMENTS ARE IMPORTANT';
      expect(hasBasicComplianceElements(upperCaseText)).toBe(true);
    });
  });

  describe('extractRegulatoryReferences', () => {
    it('should extract FAR references', () => {
      const textWithFAR = 'According to FAR 52.204-21 and FAR 15.306, we must comply';
      const references = extractRegulatoryReferences(textWithFAR);

      expect(references).toContain('FAR 52.204-21');
      expect(references).toContain('FAR 15.306');
    });

    it('should extract DFARS references', () => {
      const textWithDFARS = 'DFARS 252.204-7012 requires cybersecurity measures';
      const references = extractRegulatoryReferences(textWithDFARS);

      expect(references).toContain('DFARS 252.204-7012');
    });

    it('should extract CFR references', () => {
      const textWithCFR = 'Per 48 CFR 2.101 definitions apply';
      const references = extractRegulatoryReferences(textWithCFR);

      expect(references).toContain('48 CFR 2.101');
    });

    it('should handle mixed case references', () => {
      const mixedCaseText = 'far 52.204-21 and DFARS 252.204-7012';
      const references = extractRegulatoryReferences(mixedCaseText);

      expect(references.length).toBeGreaterThan(0);
    });

    it('should remove duplicate references', () => {
      const textWithDuplicates = 'FAR 52.204-21 is important. FAR 52.204-21 must be followed.';
      const references = extractRegulatoryReferences(textWithDuplicates);

      const farCount = references.filter((ref) => ref === 'FAR 52.204-21').length;
      expect(farCount).toBe(1);
    });

    it('should return empty array for text without references', () => {
      const textWithoutRefs = 'This document has no regulatory references';
      const references = extractRegulatoryReferences(textWithoutRefs);

      expect(references).toEqual([]);
    });

    it('should handle complex reference formats', () => {
      const complexText = 'FAR 52.204-21(b)(1) and DFARS 252.204-7012(c)(2)(i)';
      const references = extractRegulatoryReferences(complexText);

      expect(references.length).toBeGreaterThan(0);
    });
  });

  describe('CORE_VALIDATION_RULES', () => {
    it('should have required validation rules', () => {
      expect(CORE_VALIDATION_RULES.length).toBeGreaterThan(0);

      // Should include key FAR/DFARS rules
      const ruleIds = CORE_VALIDATION_RULES.map((rule) => rule.id);
      expect(ruleIds).toContain('far_52_204_21');
      expect(ruleIds).toContain('dfars_252_204_7012');
    });

    it('should have properly formatted rules', () => {
      CORE_VALIDATION_RULES.forEach((rule) => {
        expect(rule.id).toBeDefined();
        expect(rule.name).toBeDefined();
        expect(rule.section).toBeDefined();
        expect(rule.pattern).toBeInstanceOf(RegExp);
        expect(typeof rule.required).toBe('boolean');
        expect(rule.description).toBeDefined();
        expect(rule.remediation).toBeDefined();
      });
    });

    it('should have working regex patterns', () => {
      CORE_VALIDATION_RULES.forEach((rule) => {
        // Pattern should be a valid regex
        expect(() => new RegExp(rule.pattern)).not.toThrow();

        // Pattern should be case insensitive
        expect(rule.pattern.flags).toContain('i');
      });
    });
  });
});
