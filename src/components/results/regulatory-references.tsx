/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import type { ExtendedComplianceIssue } from './types';

/**
 * Regulatory References Component Props
 */
interface RegulatoryReferencesProps {
  /** List of compliance issues containing regulatory references */
  issues: ExtendedComplianceIssue[];
  /** List of all regulatory rules that were checked */
  rulesChecked: string[];
}

/**
 * Regulatory References Component
 *
 * Displays FAR/DFARS section references and regulatory information.
 * Implements requirement 3.4.
 */
export function RegulatoryReferences({ issues, rulesChecked }: RegulatoryReferencesProps) {
  // Extract unique regulatory references from issues
  const referencedRegulations = Array.from(
    new Set(issues.map((issue) => issue.regulation).filter(Boolean))
  ).sort();

  // Group issues by regulation
  const issuesByRegulation = issues.reduce(
    (acc, issue) => {
      if (issue.regulation) {
        if (!acc[issue.regulation]) {
          acc[issue.regulation] = [];
        }
        acc[issue.regulation].push(issue);
      }
      return acc;
    },
    {} as Record<string, ExtendedComplianceIssue[]>
  );

  return (
    <section className="regulatory-references">
      <h3>Regulatory References</h3>

      {referencedRegulations.length > 0 ? (
        <div className="references-content">
          <div className="referenced-regulations">
            <h4>Regulations with Issues ({referencedRegulations.length})</h4>
            <div className="regulation-list">
              {referencedRegulations.map((regulation) => (
                <div key={regulation} className="regulation-item">
                  <div className="regulation-header">
                    <strong>{regulation}</strong>
                    <span className="issue-count">
                      ({issuesByRegulation[regulation].length} issue
                      {issuesByRegulation[regulation].length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="regulation-issues">
                    {issuesByRegulation[regulation].map((issue) => (
                      <div key={issue.id} className="regulation-issue">
                        <span className={`severity-badge ${issue.severity}`}>{issue.severity}</span>
                        <span className="issue-title">{issue.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rules-checked">
            <h4>All Rules Checked ({rulesChecked.length})</h4>
            <div className="rules-grid">
              {rulesChecked.map((rule) => (
                <div
                  key={rule}
                  className={`rule-item ${referencedRegulations.includes(rule) ? 'has-issues' : 'passed'}`}
                >
                  <span className="rule-name">{rule}</span>
                  <span className="rule-status">
                    {referencedRegulations.includes(rule) ? 'Issues Found' : 'Passed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-issues">
          <p>No regulatory violations found.</p>
          <div className="rules-checked">
            <h4>Rules Checked ({rulesChecked.length})</h4>
            <div className="rules-grid">
              {rulesChecked.map((rule) => (
                <div key={rule} className="rule-item passed">
                  <span className="rule-name">{rule}</span>
                  <span className="rule-status">Passed</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
