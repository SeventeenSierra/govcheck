/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { ComplianceStatus, type StatusDisplayProps } from './types';

/**
 * Status Display Component
 *
 * Displays compliance status (pass/fail/warning) with visual indicators
 * and issue counts. Implements requirement 3.1.
 */
export function StatusDisplay({
  status,
  score,
  issueCounts,
  showDetails = false,
}: StatusDisplayProps) {
  const getStatusColor = (status: ComplianceStatus): string => {
    switch (status) {
      case ComplianceStatus.PASS:
        return 'green';
      case ComplianceStatus.FAIL:
        return 'red';
      case ComplianceStatus.WARNING:
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: ComplianceStatus): string => {
    switch (status) {
      case ComplianceStatus.PASS:
        return '✓';
      case ComplianceStatus.FAIL:
        return '✗';
      case ComplianceStatus.WARNING:
        return '⚠';
      default:
        return '?';
    }
  };

  const getStatusMessage = (status: ComplianceStatus): string => {
    switch (status) {
      case ComplianceStatus.PASS:
        return 'Compliance requirements met';
      case ComplianceStatus.FAIL:
        return 'Critical compliance issues found';
      case ComplianceStatus.WARNING:
        return 'Compliance warnings require attention';
      default:
        return 'Unknown compliance status';
    }
  };

  return (
    <section className="status-display">
      <div className={`status-indicator ${status}`}>
        <div className="status-icon" style={{ color: getStatusColor(status) }}>
          {getStatusIcon(status)}
        </div>
        <div className="status-content">
          <h2 className="status-title">{status.toUpperCase()}</h2>
          <p className="status-message">{getStatusMessage(status)}</p>
          <div className="status-score">Compliance Score: {score}/100</div>
        </div>
      </div>
      {showDetails && (
        <div className="status-details">
          <h3>Issue Summary</h3>
          <div className="issue-counts">
            <div className="issue-count critical">
              <span className="count">{issueCounts.critical}</span>
              <span className="label">Critical</span>
            </div>
            <div className="issue-count warning">
              <span className="count">{issueCounts.warning}</span>
              <span className="label">Warning</span>
            </div>
            <div className="issue-count info">
              <span className="count">{issueCounts.info}</span>
              <span className="label">Info</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
