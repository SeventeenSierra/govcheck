/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React from 'react';
import { AppHeader, TwoPanelLayout } from '@/components/layout';
import { ProposalInterface } from '@/components/proposal';
import { ReportPreview } from '@/components/reports';

/**
 * Proposals page - Main interface for proposal processing
 * 
 * This page provides the proposal-focused interface for:
 * 1. Document upload and validation
 * 2. Step-by-step compliance analysis
 * 3. Interactive results review
 * 4. Report generation and download
 * 
 * Uses shared layout components with the agent page for consistency.
 */
export default function ProposalsPage() {
  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = React.useState<any>(null);

  const handleProjectStart = (projectId: string) => {
    setActiveProject(projectId);
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader 
        mode="proposals" 
        subtitle={activeProject ? "Analysis in progress..." : undefined}
      />

      <TwoPanelLayout
        leftPanel={
          <ProposalInterface
            activeProject={activeProject}
            onProjectStart={handleProjectStart}
            onAnalysisComplete={handleAnalysisComplete}
          />
        }
        rightPanel={
          <ReportPreview isVisible={!!analysisResults} />
        }
        isRightPanelVisible={!!analysisResults}
      />
    </div>
  );
}