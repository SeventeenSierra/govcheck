/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { describe, it, expect } from 'vitest';
import {
  detectCriticalViolations,
  detectWarningIssues,
  generateComplianceStatus,
  analyzeDocumentStructure,
  findIssueLocations,
  CRITICAL_VIOLATION_PATTERNS,
  WARNING_VIOLATION_PATTERNS
} from './compliance-detection';
import { IssueSeverity } from '@/components/analysis/types';

describe('Compliance Detection Utilities', () => {
  describe('detectCriticalViolations', () => {
    it('should detect missing cybersecurity requirements', () => {
      const textWithoutCybersecurity = 'This is a basic proposal without security measures';
      const violations = detectCriticalViolations(textWithoutCybersecurity);
      
      const cybersecurityViolation = violations.find(v => v.title.includes('Cybersecurity'));
      expect(cybersecurityViolation).toBeDefined();
      expect(cybersecurityViolation?.severity).toBe(IssueSeverity.CRITICAL);
    });

    it('should not flag documents with proper cybersecurity content', () => {
      const compliantText = `
        This proposal includes cybersecurity measures and NIST 800-171 compliance.
        We have implemented basic safeguarding requirements for information security.
        Our business ethics and code of conduct program ensures compliance.
        We have policies against trafficking in persons and training programs are in place.
      `;
      
      const violations = detectCriticalViolations(compliantText);
      expect(violations).toHaveLength(0);
    });

    it('should detect missing business ethics requirements', () => {
      const textWithoutEthics = `
        This proposal includes cybersecurity and NIST 800-171 compliance.
        Anti-trafficking policies are in place.
      `;
      
      const violations = detectCriticalViolations(textWithoutEthics);
      const ethicsViolation = violations.find(v => v.title.includes('Business Ethics'));
      expect(ethicsViolation).toBeDefined();
    });

    it('should detect missing anti-trafficking requirements', () => {
      const textWithoutTrafficking = `
        This proposal includes cybersecurity and NIST 800-171 compliance.
        Our business ethics program ensures compliance.
      `;
      
      const violations = detectCriticalViolations(textWithoutTrafficking);
      const traffickingViolation = violations.find(v => v.title.includes('Anti-Trafficking'));
      expect(traffickingViolation).toBeDefined();
    });

    it('should generate unique violation IDs', () => {
      const nonCompliantText = 'Basic proposal without compliance content';
      
      const violations1 = detectCriticalViolations(nonCompliantText);
      const violations2 = detectCriticalViolations(nonCompliantText);
      
      if (violations1.length > 0 && violations2.length > 0) {
        expect(violations1[0].id).not.toBe(violations2[0].id);
      }
    });

    it('should include proper remediation guidance', () => {
      const nonCompliantText = 'Basic proposal';
      const violations = detectCriticalViolations(nonCompliantText);
      
      violations.forEach(violation => {
        expect(violation.remediation).toBeDefined();
        expect(violation.remediation!.length).toBeGreaterThan(0);
        expect(violation.regulation).toBeDefined();
      });
    });
  });

  describe('detectWarningIssues', () => {
    it('should detect incomplete small business requirements', () => {
      const textWithIncompleteSmallBiz = 'We will work with small business partners';
      const warnings = detectWarningIssues(textWithIncompleteSmallBiz);
      
      const smallBizWarning = warnings.find(w => w.title.includes('Small Business'));
      expect(smallBizWarning).toBeDefined();
      expect(smallBizWarning?.severity).toBe(IssueSeverity.WARNING);
    });

    it('should not flag complete small business plans', () => {
      const completeSmallBizText = `
        Our small business subcontracting plan includes detailed utilization plan
        for disadvantaged business enterprises.
      `;
      
      const warnings = detectWarningIssues(completeSmallBizText);
      const smallBizWarning = warnings.find(w => w.title.includes('Small Business'));
      expect(smallBizWarning).toBeUndefined();
    });

    it('should detect vague compliance language', () => {
      const vagueText = 'We will comply with all requirements and plan to implement security measures';
      const warnings = detectWarningIssues(vagueText);
      
      const vagueWarning = warnings.find(w => w.title.includes('Vague Compliance'));
      expect(vagueWarning).toBeDefined();
    });

    it('should not flag present-tense compliance statements', () => {
      const presentTenseText = `
        We have implemented security measures and currently maintain compliance programs.
        Our organization has established procedures for all requirements.
      `;
      
      const warnings = detectWarningIssues(presentTenseText);
      const vagueWarning = warnings.find(w => w.title.includes('Vague Compliance'));
      expect(vagueWarning).toBeUndefined();
    });
  });

  describe('generateComplianceStatus', () => {
    it('should return pass status for no issues', () => {
      const status = generateComplianceStatus([]);
      
      expect(status.status).toBe('pass');
      expect(status.overallScore).toBe(100);
      expect(status.summary).toContain('meets all critical');
    });

    it('should return fail status for critical issues', () => {
      const criticalIssues = [
        {
          id: 'test1',
          severity: IssueSeverity.CRITICAL,
          title: 'Critical Issue',
          description: 'Test critical issue',
          regulation: 'TEST 1.0'
        }
      ];
      
      const status = generateComplianceStatus(criticalIssues);
      
      expect(status.status).toBe('fail');
      expect(status.overallScore).toBeLessThan(100);
      expect(status.summary).toContain('critical issue');
    });

    it('should return warning status for warning issues only', () => {
      const warningIssues = [
        {
          id: 'test1',
          severity: IssueSeverity.WARNING,
          title: 'Warning Issue',
          description: 'Test warning issue',
          regulation: 'TEST 1.0'
        }
      ];
      
      const status = generateComplianceStatus(warningIssues);
      
      expect(status.status).toBe('warning');
      expect(status.overallScore).toBeLessThan(100);
      expect(status.summary).toContain('warning');
    });

    it('should prioritize critical over warning issues', () => {
      const mixedIssues = [
        {
          id: 'critical1',
          severity: IssueSeverity.CRITICAL,
          title: 'Critical Issue',
          description: 'Test critical issue',
          regulation: 'TEST 1.0'
        },
        {
          id: 'warning1',
          severity: IssueSeverity.WARNING,
          title: 'Warning Issue',
          description: 'Test warning issue',
          regulation: 'TEST 2.0'
        }
      ];
      
      const status = generateComplianceStatus(mixedIssues);
      expect(status.status).toBe('fail');
    });

    it('should calculate score based on issue penalties', () => {
      const multipleIssues = [
        {
          id: 'critical1',
          severity: IssueSeverity.CRITICAL,
          title: 'Critical Issue 1',
          description: 'Test',
          regulation: 'TEST 1.0'
        },
        {
          id: 'critical2',
          severity: IssueSeverity.CRITICAL,
          title: 'Critical Issue 2',
          description: 'Test',
          regulation: 'TEST 2.0'
        },
        {
          id: 'warning1',
          severity: IssueSeverity.WARNING,
          title: 'Warning Issue',
          description: 'Test',
          regulation: 'TEST 3.0'
        }
      ];
      
      const status = generateComplianceStatus(multipleIssues);
      
      // 100 - (2 * 25) - (1 * 10) = 40
      expect(status.overallScore).toBe(40);
    });
  });

  describe('analyzeDocumentStructure', () => {
    it('should detect table of contents', () => {
      const textWithTOC = 'Table of Contents\n1. Introduction\n2. Requirements';
      const structure = analyzeDocumentStructure(textWithTOC);
      
      expect(structure.hasTableOfContents).toBe(true);
    });

    it('should detect executive summary', () => {
      const textWithSummary = 'Executive Summary\nThis proposal outlines our approach';
      const structure = analyzeDocumentStructure(textWithSummary);
      
      expect(structure.hasExecutiveSummary).toBe(true);
    });

    it('should detect compliance section', () => {
      const textWithCompliance = 'Compliance Section\nWe meet all regulatory requirements';
      const structure = analyzeDocumentStructure(textWithCompliance);
      
      expect(structure.hasComplianceSection).toBe(true);
    });

    it('should estimate number of sections', () => {
      const structuredText = `
        1. Introduction
        2. Technical Approach
        3. Management Plan
        4. Compliance
        5. Conclusion
      `;
      
      const structure = analyzeDocumentStructure(structuredText);
      expect(structure.estimatedSections).toBeGreaterThan(0);
    });

    it('should handle documents without structure', () => {
      const unstructuredText = 'This is just plain text without any structure or sections';
      const structure = analyzeDocumentStructure(unstructuredText);
      
      expect(structure.hasTableOfContents).toBe(false);
      expect(structure.hasExecutiveSummary).toBe(false);
      expect(structure.hasComplianceSection).toBe(false);
    });
  });

  describe('findIssueLocations', () => {
    it('should find pattern locations in text', () => {
      const text = `Line 1: Normal text
Line 2: This has cybersecurity content
Line 3: More normal text
Line 4: Another cybersecurity mention`;
      
      const locations = findIssueLocations(text, /cybersecurity/gi);
      
      expect(locations).toHaveLength(2);
      expect(locations[0].line).toBe(2);
      expect(locations[1].line).toBe(4);
    });

    it('should provide context for each location', () => {
      const text = 'This line contains the pattern we are searching for';
      const locations = findIssueLocations(text, /pattern/i);
      
      expect(locations).toHaveLength(1);
      expect(locations[0].context).toContain('pattern');
    });

    it('should return empty array for no matches', () => {
      const text = 'This text has no matches';
      const locations = findIssueLocations(text, /nonexistent/i);
      
      expect(locations).toHaveLength(0);
    });

    it('should handle multiline text correctly', () => {
      const multilineText = `First line
Second line with pattern
Third line
Fourth line with pattern`;
      
      const locations = findIssueLocations(multilineText, /pattern/gi);
      
      expect(locations).toHaveLength(2);
      expect(locations[0].line).toBe(2);
      expect(locations[1].line).toBe(4);
    });
  });

  describe('Pattern Constants', () => {
    it('should have valid critical violation patterns', () => {
      expect(CRITICAL_VIOLATION_PATTERNS.length).toBeGreaterThan(0);
      
      CRITICAL_VIOLATION_PATTERNS.forEach(pattern => {
        expect(pattern.id).toBeDefined();
        expect(pattern.pattern).toBeInstanceOf(RegExp);
        expect(pattern.title).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.regulation).toBeDefined();
        expect(pattern.severity).toBe(IssueSeverity.CRITICAL);
        expect(pattern.remediation).toBeDefined();
      });
    });

    it('should have valid warning violation patterns', () => {
      expect(WARNING_VIOLATION_PATTERNS.length).toBeGreaterThan(0);
      
      WARNING_VIOLATION_PATTERNS.forEach(pattern => {
        expect(pattern.id).toBeDefined();
        expect(pattern.pattern).toBeInstanceOf(RegExp);
        expect(pattern.title).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.regulation).toBeDefined();
        expect(pattern.severity).toBe(IssueSeverity.WARNING);
        expect(pattern.remediation).toBeDefined();
      });
    });
  });
});