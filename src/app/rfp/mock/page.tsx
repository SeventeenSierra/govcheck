/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { Bug, Button, RefreshCw, Settings } from '@17sierra/ui';
import React from 'react';
import { AppHeader, TwoPanelLayout } from '@/components/layout';
import { RFPInterface } from '@/components/rfp';
import { ReportPreview, ReportStatus, ReportTemplate, ReportFormat } from '@/components/reports';

/**
 * RFP Mock Page - Development and testing interface
 *
 * This page provides a mock environment for testing the RFP analysis workflow
 * without requiring external services. Perfect for development, demos, and testing.
 *
 * Features:
 * - Mock API responses with configurable delays
 * - Simulated analysis steps with realistic timing
 * - Error scenario testing
 * - Development controls and debugging tools
 */
export default function RFPMockPage() {
  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Legacy mock state
  const [analysisResults, setAnalysisResults] = React.useState<any>(null);
  const [mockSettings, setMockSettings] = React.useState({
    uploadDelay: 1000,
    analysisDelay: 2000,
    simulateErrors: false,
    fastMode: false,
  });

  const handleProjectStart = (projectId: string) => {
    setActiveProject(projectId);
  };

  // biome-ignore lint/suspicious/noExplicitAny: Legacy mock callback
  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
  };

  const handleStartNew = () => {
    setActiveProject(null);
    setAnalysisResults(null);
  };

  const handleResetDemo = () => {
    handleStartNew();
    // Clear any cached data
    localStorage.removeItem('rfp-demo-state');
  };

  const toggleFastMode = () => {
    setMockSettings((prev) => ({
      ...prev,
      fastMode: !prev.fastMode,
      uploadDelay: !prev.fastMode ? 200 : 1000,
      analysisDelay: !prev.fastMode ? 500 : 2000,
    }));
  };

  const mockActions = [
    {
      id: 'reset',
      label: 'Reset Demo',
      icon: RefreshCw,
      onClick: handleResetDemo,
    },
    {
      id: 'fast-mode',
      label: mockSettings.fastMode ? 'Normal Speed' : 'Fast Mode',
      icon: Settings,
      onClick: toggleFastMode,
    },
    {
      id: 'debug',
      label: 'Debug Mode',
      icon: Bug,
      onClick: () => setMockSettings((prev) => ({ ...prev, simulateErrors: !prev.simulateErrors })),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        mode="proposals"
        title="RFP Compliance Analyzer"
        subtitle={
          activeProject
            ? `Mock Analysis - ${mockSettings.fastMode ? 'Fast Mode' : 'Normal Speed'}`
            : 'Mock Environment - Ready for Testing'
        }
        actions={mockActions}
      />

      {/* Development Notice */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <Bug size={16} />
            <span className="font-medium">Development Mode</span>
            <span>•</span>
            <span>Using mock APIs for testing</span>
            {mockSettings.simulateErrors && (
              <>
                <span>•</span>
                <span className="text-orange-600 font-medium">Error simulation enabled</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-blue-600">
            <span>Upload Delay: {mockSettings.uploadDelay}ms</span>
            <span>Analysis Delay: {mockSettings.analysisDelay}ms</span>
          </div>
        </div>
      </div>

      <TwoPanelLayout
        leftPanel={
          <RFPInterface
            activeProject={activeProject}
            onProjectStart={handleProjectStart}
            onAnalysisComplete={handleAnalysisComplete}
            onStartNew={handleStartNew}
          />
        }
        rightPanel={
          <ReportPreview
            isVisible={!!analysisResults}
            reportData={
              analysisResults
                ? {
                  id: 'mock-report-123',
                  title: 'Mock Compliance Report',
                  reference: 'MOCK-2024-001',
                  generatedAt: new Date(),
                  complianceScore: 92,
                  status: ReportStatus.READY,
                  analysisResults: analysisResults,
                  template: ReportTemplate.STANDARD,
                  format: ReportFormat.PDF,
                }
                : undefined
            }
          />
        }
        isRightPanelVisible={!!analysisResults}
        resizable={true}
        leftPanelSize="medium"
      />

      {/* Development Controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <h4 className="font-semibold text-sm mb-3 text-gray-800">Mock Controls</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Fast Mode</span>
              <Button
                size="sm"
                variant={mockSettings.fastMode ? 'default' : 'outline'}
                onClick={toggleFastMode}
                className="h-6 px-2 text-xs"
              >
                {mockSettings.fastMode ? 'ON' : 'OFF'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Simulate Errors</span>
              <Button
                size="sm"
                variant={mockSettings.simulateErrors ? 'destructive' : 'outline'}
                onClick={() =>
                  setMockSettings((prev) => ({ ...prev, simulateErrors: !prev.simulateErrors }))
                }
                className="h-6 px-2 text-xs"
              >
                {mockSettings.simulateErrors ? 'ON' : 'OFF'}
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetDemo}
              className="w-full h-6 text-xs"
            >
              Reset Demo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
