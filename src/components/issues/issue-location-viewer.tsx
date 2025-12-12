/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { useState } from 'react';
import type { ExtendedComplianceIssue, ExtendedIssueLocation } from '@/components/results/types';

/**
 * Issue Location Viewer Props
 */
export interface IssueLocationViewerProps {
  /** The compliance issue with location information */
  issue: ExtendedComplianceIssue;
  /** Callback when user wants to navigate to the location */
  onNavigateToLocation?: (location: ExtendedIssueLocation) => void;
  /** Whether to show the full location context */
  showContext?: boolean;
}

/**
 * Issue Location Viewer Component
 *
 * Provides detailed view of where compliance issues occur in documents
 * with navigation capabilities. Implements requirement 3.5.
 */
export function IssueLocationViewer({
  issue,
  onNavigateToLocation,
  showContext = true,
}: IssueLocationViewerProps) {
  const [showFullExcerpt, setShowFullExcerpt] = useState(false);

  const formatLocationDescription = (): string => {
    if (!issue.location) return 'Location information not available';

    const parts: string[] = [];

    if (issue.location.page) {
      parts.push(`Page ${issue.location.page}`);
    }

    if (issue.location.section) {
      parts.push(`Section "${issue.location.section}"`);
    }

    if (issue.location.lineNumber) {
      parts.push(`Line ${issue.location.lineNumber}`);
    }

    if (parts.length === 0) {
      return 'General document location';
    }

    return parts.join(' • ');
  };

  const getLocationPrecision = (): 'high' | 'medium' | 'low' => {
    if (!issue.location) return 'low';

    const hasPage = !!issue.location.page;
    const hasSection = !!issue.location.section;
    const hasLine = !!issue.location.lineNumber;
    const hasExcerpt = !!issue.location.excerpt;

    if (hasPage && hasSection && (hasLine || hasExcerpt)) {
      return 'high';
    }

    if (hasPage && (hasSection || hasExcerpt)) {
      return 'medium';
    }

    return 'low';
  };

  const truncateExcerpt = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  if (!issue.location) {
    return (
      <div className="issue-location-viewer no-location">
        <div className="location-header">
          <h4>Document Location</h4>
          <span className="precision-badge low">Location Not Specified</span>
        </div>
        <p className="no-location-message">
          Specific location information is not available for this issue. The issue may apply to the
          document as a whole or multiple sections.
        </p>
      </div>
    );
  }

  const precision = getLocationPrecision();

  return (
    <div className="issue-location-viewer">
      <div className="location-header">
        <h4>Document Location</h4>
        <span className={`precision-badge ${precision}`}>
          {precision === 'high'
            ? 'Precise Location'
            : precision === 'medium'
              ? 'General Area'
              : 'Approximate Location'}
        </span>
      </div>

      <div className="location-details">
        <div className="location-description">
          <span className="location-text">{formatLocationDescription()}</span>
        </div>

        {/* Navigation Actions */}
        <div className="location-actions">
          {issue.location.page && (
            <button
              type="button"
              className="navigate-button page"
              onClick={() => onNavigateToLocation?.(issue.location!)}
              disabled={!onNavigateToLocation}
            >
              📄 Go to Page {issue.location.page}
            </button>
          )}

          {issue.location.section && (
            <button
              type="button"
              className="navigate-button section"
              onClick={() => onNavigateToLocation?.(issue.location!)}
              disabled={!onNavigateToLocation}
            >
              📑 Go to Section
            </button>
          )}
        </div>

        {/* Location Context */}
        {showContext && issue.location.excerpt && (
          <div className="location-context">
            <h5>Relevant Content</h5>
            <div className="excerpt-container">
              <blockquote className="location-excerpt">
                {showFullExcerpt ? issue.location.excerpt : truncateExcerpt(issue.location.excerpt)}
              </blockquote>

              {issue.location.excerpt.length > 150 && (
                <button
                  type="button"
                  className="toggle-excerpt"
                  onClick={() => setShowFullExcerpt(!showFullExcerpt)}
                >
                  {showFullExcerpt ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Location Metadata */}
        <div className="location-metadata">
          <div className="metadata-grid">
            {issue.location.page && (
              <div className="metadata-item">
                <span className="label">Page:</span>
                <span>{issue.location.page}</span>
              </div>
            )}

            {issue.location.section && (
              <div className="metadata-item">
                <span className="label">Section:</span>
                <span>{issue.location.section}</span>
              </div>
            )}

            {issue.location.lineNumber && (
              <div className="metadata-item">
                <span className="label">Line:</span>
                <span>{issue.location.lineNumber}</span>
              </div>
            )}

            <div className="metadata-item">
              <span className="label">Precision:</span>
              <span className={`precision-indicator ${precision}`}>
                {precision.charAt(0).toUpperCase() + precision.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
