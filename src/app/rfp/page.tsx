/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React from 'react';
import { AppHeader, TwoPanelLayout } from '@/components/layout';
import { RFPInterface } from '@/components/rfp';
import { ReportPreview } from '@/components/reports';

/**
 * RFP Analysis Page - Consolidated interface for proposal processing
 *
 * This page provides the unified interface for:
 * 1. Document upload and validation
 * 2. AI-powered compliance analysis
 * 3. Interactive step-by-step progress
 * 4. Real-time chat assistance
 * 5. Comprehensive results review
 * 6. Report generation and export
 *
 * Combines the best features from both agent and proposal interfaces.
 */
export default function RFPPage() {
  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = React.useState<any>(null);

  const handleProjectStart = (projectId: string) => {
    setActiveProject(projectId);
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
  };

  const handleStartNew = () => {
    setActiveProject(null);
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        mode="proposals"
        title="RFP Compliance Analyzer"
        subtitle={activeProject ? 'Analysis in progress...' : 'Ready to analyze your proposal'}
      />

      <TwoPanelLayout
        leftPanel={
          <RFPInterface
            activeProject={activeProject}
            onProjectStart={handleProjectStart}
            onAnalysisComplete={handleAnalysisComplete}
            onStartNew={handleStartNew}
          />
        }
        rightPanel={<ReportPreview isVisible={!!analysisResults} />}
        isRightPanelVisible={!!analysisResults}
        resizable={true}
        leftPanelSize="medium"
      />
    </div>
  );
}
