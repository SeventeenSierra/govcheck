/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { type ComplianceIssue, IssueSeverity } from '@/components/analysis/types';

/**
 * Critical compliance violation patterns
 * Implements Requirement 2.3: Flag critical compliance violations
 */
export const CRITICAL_VIOLATION_PATTERNS = [
  {
    id: 'missing_cybersecurity',
    pattern: /(?!.*(?:cybersecurity|nist\s+800-171|information\s+security|basic\s+safeguarding))/i,
    title: 'Missing Cybersecurity Requirements',
    description: 'Document lacks required cybersecurity and information security measures',
    regulation: 'FAR 52.204-21, DFARS 252.204-7012',
    severity: IssueSeverity.CRITICAL,
    remediation:
      'Include cybersecurity measures, NIST 800-171 compliance, and basic safeguarding requirements',
  },
  {
    id: 'missing_business_ethics',
    pattern:
      /(?!.*(?:business\s+ethics|code\s+of\s+conduct|ethics\s+training|compliance\s+program))/i,
    title: 'Missing Business Ethics Requirements',
    description: 'Document does not address business ethics and conduct requirements',
    regulation: 'FAR 52.203-13',
    severity: IssueSeverity.CRITICAL,
    remediation: 'Include business ethics code, conduct standards, and compliance program details',
  },
  {
    id: 'missing_trafficking_compliance',
    pattern: /(?!.*(?:trafficking\s+in\s+persons|human\s+trafficking|forced\s+labor))/i,
    title: 'Missing Anti-Trafficking Requirements',
    description: 'Document lacks required anti-trafficking in persons compliance',
    regulation: 'FAR 52.222-50',
    severity: IssueSeverity.CRITICAL,
    remediation: 'Include anti-trafficking policies, training programs, and compliance measures',
  },
];

/**
 * Warning-level compliance patterns
 */
export const WARNING_VIOLATION_PATTERNS = [
  {
    id: 'incomplete_small_business',
    pattern: /small\s+business(?!.*(?:subcontracting\s+plan|utilization\s+plan))/i,
    title: 'Incomplete Small Business Requirements',
    description: 'Small business mentioned but subcontracting plan details are incomplete',
    regulation: 'FAR 52.219-8',
    severity: IssueSeverity.WARNING,
    remediation: 'Provide complete small business subcontracting plan with utilization details',
  },
  {
    id: 'vague_compliance_language',
    pattern:
      /(?:will\s+comply|intend\s+to|plan\s+to\s+implement)(?!.*(?:have\s+implemented|currently\s+maintain))/i,
    title: 'Vague Compliance Language',
    description:
      'Compliance statements use future tense rather than demonstrating current implementation',
    regulation: 'General Compliance',
    severity: IssueSeverity.WARNING,
    remediation: 'Use present tense to demonstrate current compliance implementation',
  },
];

/**
 * Detect critical compliance violations in document text
 * Implements Requirement 2.3: Flag critical compliance violations
 */
export function detectCriticalViolations(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  // Check for missing cybersecurity content
  const hasCybersecurity =
    /cybersecurity|nist\s+800-171|information\s+security|basic\s+safeguarding/i.test(text);
  if (!hasCybersecurity) {
    issues.push({
      id: `critical_missing_cybersecurity_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      severity: IssueSeverity.CRITICAL,
      title: 'Missing Cybersecurity Requirements',
      description: 'Document lacks required cybersecurity and information security measures',
      regulation: 'FAR 52.204-21, DFARS 252.204-7012',
      remediation:
        'Include cybersecurity measures, NIST 800-171 compliance, and basic safeguarding requirements',
    });
  }

  // Check for missing business ethics content
  const hasBusinessEthics =
    /business\s+ethics|code\s+of\s+conduct|ethics\s+training|compliance\s+program/i.test(text);
  if (!hasBusinessEthics) {
    issues.push({
      id: `critical_missing_business_ethics_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      severity: IssueSeverity.CRITICAL,
      title: 'Missing Business Ethics Requirements',
      description: 'Document does not address business ethics and conduct requirements',
      regulation: 'FAR 52.203-13',
      remediation:
        'Include business ethics code, conduct standards, and compliance program details',
    });
  }

  // Check for missing anti-trafficking content
  const hasAntiTrafficking = /trafficking\s+in\s+persons|human\s+trafficking|forced\s+labor/i.test(
    text
  );
  if (!hasAntiTrafficking) {
    issues.push({
      id: `critical_missing_trafficking_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      severity: IssueSeverity.CRITICAL,
      title: 'Missing Anti-Trafficking Requirements',
      description: 'Document lacks required anti-trafficking in persons compliance',
      regulation: 'FAR 52.222-50',
      remediation: 'Include anti-trafficking policies, training programs, and compliance measures',
    });
  }

  return issues;
}

/**
 * Detect warning-level compliance issues
 */
export function detectWarningIssues(text: string): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  for (const pattern of WARNING_VIOLATION_PATTERNS) {
    if (pattern.pattern.test(text)) {
      issues.push({
        id: `warning_${pattern.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        severity: pattern.severity,
        title: pattern.title,
        description: pattern.description,
        regulation: pattern.regulation,
        remediation: pattern.remediation,
      });
    }
  }

  return issues;
}

/**
 * Generate basic compliance status based on detected issues
 * Implements Requirement 2.4: Generate basic compliance status
 */
export function generateComplianceStatus(issues: ComplianceIssue[]): {
  status: 'pass' | 'fail' | 'warning';
  overallScore: number;
  summary: string;
} {
  const criticalIssues = issues.filter((issue) => issue.severity === IssueSeverity.CRITICAL);
  const warningIssues = issues.filter((issue) => issue.severity === IssueSeverity.WARNING);

  // Determine overall status
  let status: 'pass' | 'fail' | 'warning';
  if (criticalIssues.length > 0) {
    status = 'fail';
  } else if (warningIssues.length > 0) {
    status = 'warning';
  } else {
    status = 'pass';
  }

  // Calculate score (100 - penalties)
  const criticalPenalty = criticalIssues.length * 25;
  const warningPenalty = warningIssues.length * 10;
  const overallScore = Math.max(0, 100 - criticalPenalty - warningPenalty);

  // Generate summary
  let summary: string;
  if (status === 'pass') {
    summary = 'Document meets all critical compliance requirements';
  } else if (status === 'warning') {
    summary = `Document has ${warningIssues.length} warning(s) that should be addressed`;
  } else {
    summary = `Document has ${criticalIssues.length} critical issue(s) that must be resolved`;
  }

  return { status, overallScore, summary };
}

/**
 * Analyze document structure for compliance indicators
 */
export function analyzeDocumentStructure(text: string): {
  hasTableOfContents: boolean;
  hasExecutiveSummary: boolean;
  hasComplianceSection: boolean;
  estimatedSections: number;
} {
  const tocPattern = /table\s+of\s+contents|contents/i;
  const execSummaryPattern = /executive\s+summary|summary/i;
  const compliancePattern = /compliance|regulatory|requirements?\s+section/i;

  // Estimate sections by counting headers or numbered items
  const sectionPattern = /^\s*(?:\d+\.|\w+\.|#\s+)/gm;
  const sectionMatches = text.match(sectionPattern) || [];

  return {
    hasTableOfContents: tocPattern.test(text),
    hasExecutiveSummary: execSummaryPattern.test(text),
    hasComplianceSection: compliancePattern.test(text),
    estimatedSections: sectionMatches.length,
  };
}

/**
 * Extract potential issue locations from text
 * Implements Requirement 3.5: Allow users to see specific issue locations
 */
export function findIssueLocations(
  text: string,
  searchPattern: RegExp
): Array<{
  line: number;
  column: number;
  context: string;
}> {
  const lines = text.split('\n');
  const locations: Array<{ line: number; column: number; context: string }> = [];

  lines.forEach((line, lineIndex) => {
    // Use global flag to find all matches in the line
    const globalPattern = new RegExp(
      searchPattern.source,
      searchPattern.flags.includes('g') ? searchPattern.flags : `${searchPattern.flags}g`
    );
    let match: RegExpExecArray | null;

    match = globalPattern.exec(line);
    while (match !== null) {
      locations.push({
        line: lineIndex + 1,
        column: match.index + 1,
        context: line.trim(),
      });

      // Prevent infinite loop for non-global patterns
      if (!searchPattern.flags.includes('g')) {
        break;
      }
      match = globalPattern.exec(line);
    }
  });

  return locations;
}
