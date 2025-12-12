/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { ComplianceIssue, IssueSeverity, ValidationResult } from '@/components/analysis/types';

/**
 * FAR/DFARS validation rule definition
 */
export interface ValidationRule {
  id: string;
  name: string;
  section: string;
  pattern: RegExp;
  required: boolean;
  description: string;
  remediation: string;
}

/**
 * Core FAR/DFARS validation rules for threshold implementation
 * Implements Requirement 2.1: Validate against core FAR/DFARS requirements
 */
export const CORE_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'far_52_204_21',
    name: 'Basic Safeguarding of Covered Contractor Information Systems',
    section: 'FAR 52.204-21',
    pattern: /basic\s+safeguarding|cybersecurity|information\s+security|nist\s+800-171/i,
    required: true,
    description: 'Contractor must implement basic safeguarding requirements',
    remediation: 'Include basic safeguarding and cybersecurity measures in your proposal'
  },
  {
    id: 'dfars_252_204_7012',
    name: 'Safeguarding Covered Defense Information and Cyber Incident Reporting',
    section: 'DFARS 252.204-7012',
    pattern: /cybersecurity|nist\s+800-171|controlled\s+unclassified\s+information|cui|cyber\s+incident/i,
    required: true,
    description: 'Defense contractors must comply with cybersecurity requirements',
    remediation: 'Address NIST 800-171 compliance and cyber incident reporting procedures'
  },
  {
    id: 'far_52_219_8',
    name: 'Utilization of Small Business Concerns',
    section: 'FAR 52.219-8',
    pattern: /small\s+business|subcontracting\s+plan|socioeconomic|disadvantaged\s+business/i,
    required: false,
    description: 'Small business subcontracting requirements',
    remediation: 'Include small business utilization plan if applicable'
  },
  {
    id: 'far_52_203_13',
    name: 'Contractor Code of Business Ethics and Conduct',
    section: 'FAR 52.203-13',
    pattern: /business\s+ethics|code\s+of\s+conduct|ethics\s+training|compliance\s+program/i,
    required: true,
    description: 'Contractor must maintain business ethics and conduct standards',
    remediation: 'Describe your business ethics and conduct compliance program'
  },
  {
    id: 'far_52_222_50',
    name: 'Combating Trafficking in Persons',
    section: 'FAR 52.222-50',
    pattern: /trafficking\s+in\s+persons|human\s+trafficking|forced\s+labor|compliance\s+plan/i,
    required: true,
    description: 'Contractor must comply with anti-trafficking requirements',
    remediation: 'Include anti-trafficking compliance measures and training programs'
  }
];

/**
 * Validate text content against FAR/DFARS rules
 * @param text - Document text to validate
 * @param rules - Validation rules to apply (defaults to CORE_VALIDATION_RULES)
 * @returns Array of validation results
 */
export function validateFARDFARS(
  text: string, 
  rules: ValidationRule[] = CORE_VALIDATION_RULES
): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  for (const rule of rules) {
    const matches = rule.pattern.test(text);
    const issues: ComplianceIssue[] = [];
    
    // Generate compliance issue if required rule is not met
    if (rule.required && !matches) {
      issues.push({
        id: `issue_${rule.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        severity: IssueSeverity.CRITICAL,
        title: `Missing ${rule.name}`,
        description: rule.description,
        regulation: rule.section,
        remediation: rule.remediation
      });
    }
    
    // Calculate confidence based on pattern matching
    const confidence = matches ? 0.85 : (rule.required ? 0.6 : 0.8);
    
    results.push({
      ruleId: rule.id,
      ruleName: rule.name,
      passed: rule.required ? matches : true,
      issues,
      confidence
    });
  }
  
  return results;
}

/**
 * Extract compliance score from validation results
 * @param results - Validation results
 * @returns Compliance score (0-100)
 */
export function calculateComplianceScore(results: ValidationResult[]): number {
  if (results.length === 0) {
    return 0;
  }
  
  const totalRules = results.length;
  const passedRules = results.filter(r => r.passed).length;
  const criticalIssues = results.reduce((count, r) => 
    count + r.issues.filter(i => i.severity === IssueSeverity.CRITICAL).length, 0
  );
  
  // Base score from passed rules
  const baseScore = (passedRules / totalRules) * 100;
  
  // Penalty for critical issues
  const penalty = criticalIssues * 15;
  
  return Math.max(0, Math.min(100, baseScore - penalty));
}

/**
 * Check if document text contains basic compliance indicators
 * @param text - Document text to check
 * @returns Boolean indicating if basic compliance elements are present
 */
export function hasBasicComplianceElements(text: string): boolean {
  const basicPatterns = [
    /compliance/i,
    /requirements/i,
    /standards/i,
    /procedures/i,
    /policy/i
  ];
  
  return basicPatterns.some(pattern => pattern.test(text));
}

/**
 * Extract potential regulatory references from text
 * @param text - Document text to analyze
 * @returns Array of found regulatory references
 */
export function extractRegulatoryReferences(text: string): string[] {
  const references: string[] = [];
  
  // FAR references
  const farMatches = text.match(/FAR\s+\d+\.\d+(?:\.\d+)?(?:-\d+)?/gi);
  if (farMatches) {
    references.push(...farMatches);
  }
  
  // DFARS references
  const dfarsMatches = text.match(/DFARS\s+\d+\.\d+(?:\.\d+)?(?:-\d+)?/gi);
  if (dfarsMatches) {
    references.push(...dfarsMatches);
  }
  
  // CFR references
  const cfrMatches = text.match(/\d+\s+CFR\s+\d+\.\d+/gi);
  if (cfrMatches) {
    references.push(...cfrMatches);
  }
  
  return [...new Set(references)]; // Remove duplicates
}