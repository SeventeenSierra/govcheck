/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
import { Button } from '@17sierra/ui';
import { AlertCircle, FileText, Home, Settings } from 'lucide-react';
import { UploadManager } from '@/components/upload/upload-manager';
import { AnalysisCoordinator } from '@/components/analysis/analysis-coordinator';
import { ResultsPresenter } from '@/components/results/results-presenter';

import type { UploadSession } from '@/types/app';
import type { AnalysisResult, AnalysisSession } from '@/components/analysis/types';
import type { AnalysisResults } from '@/components/results/types';
import { ComplianceStatus } from '@/components/results/types';

/**
 * Application workflow states
 */
enum WorkflowState {
  UPLOAD = 'upload',
  ANALYSIS = 'analysis',
  RESULTS = 'results',
}

/**
 * Main Application State
 */
interface AppState {
  currentWorkflow: WorkflowState;
  uploadSession: UploadSession | null;
  analysisSession: AnalysisSession | null;
  analysisResults: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Proposal Prepper App Component
 *
 * Main application interface that implements:
 * - Clean, functional web interface (Requirement 4.1)
 * - Responsive design for desktop and mobile (Requirement 4.5)
 * - Loading states and progress indicators (Requirement 5.5)
 * - Clear navigation and workflow (Requirement 4.2)
 * - Basic form validation and feedback (Requirement 4.3)
 */
export function ProposalPrepperApp(): React.JSX.Element {
  const [appState, setAppState] = useState<AppState>({
    currentWorkflow: WorkflowState.UPLOAD,
    uploadSession: null,
    analysisSession: null,
    analysisResults: null,
    isLoading: false,
    error: null,
  });

  /**
   * Handle successful upload completion
   * Requirement 4.2: Clear navigation and workflow
   */
  const handleUploadComplete = useCallback((session: UploadSession) => {
    setAppState((prev) => ({
      ...prev,
      uploadSession: session,
      currentWorkflow: WorkflowState.ANALYSIS,
      error: null,
    }));
  }, []);

  /**
   * Handle upload errors
   * Requirement 4.3: Basic form validation and feedback
   */
  const handleUploadError = useCallback((error: string, session: UploadSession) => {
    setAppState((prev) => ({
      ...prev,
      uploadSession: session,
      error: `Upload failed: ${error}`,
    }));
  }, []);

  /**
   * Handle analysis start
   * Requirement 5.5: Loading states and progress indicators
   */
  const handleAnalysisStart = useCallback((session: AnalysisSession) => {
    setAppState((prev) => ({
      ...prev,
      analysisSession: session,
      isLoading: true,
      error: null,
    }));
  }, []);

  /**
   * Handle analysis progress updates
   * Requirement 5.5: Loading states and progress indicators
   */
  const handleAnalysisProgress = useCallback((session: AnalysisSession) => {
    setAppState((prev) => ({
      ...prev,
      analysisSession: session,
    }));
  }, []);

  /**
   * Handle analysis completion
   * Requirement 4.2: Clear navigation and workflow
   */
  const handleAnalysisComplete = useCallback((result: AnalysisResult) => {
    setAppState((prev) => ({
      ...prev,
      analysisResults: result,
      currentWorkflow: WorkflowState.RESULTS,
      isLoading: false,
      error: null,
    }));
  }, []);

  /**
   * Handle analysis errors
   * Requirement 4.3: Basic form validation and feedback
   */
  const handleAnalysisError = useCallback((error: string, session: AnalysisSession) => {
    setAppState((prev) => ({
      ...prev,
      analysisSession: session,
      isLoading: false,
      error: `Analysis failed: ${error}`,
    }));
  }, []);

  /**
   * Start new analysis workflow
   * Requirement 4.2: Clear navigation and workflow
   */
  const startNewWorkflow = useCallback(() => {
    setAppState({
      currentWorkflow: WorkflowState.UPLOAD,
      uploadSession: null,
      analysisSession: null,
      analysisResults: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Navigate to specific workflow step
   * Requirement 4.2: Clear navigation and workflow
   */
  const navigateToStep = useCallback((step: WorkflowState) => {
    // Only allow navigation to completed steps
    if (step === WorkflowState.UPLOAD) {
      setAppState((prev) => ({ ...prev, currentWorkflow: step }));
    } else if (step === WorkflowState.ANALYSIS && appState.uploadSession) {
      setAppState((prev) => ({ ...prev, currentWorkflow: step }));
    } else if (step === WorkflowState.RESULTS && appState.analysisResults) {
      setAppState((prev) => ({ ...prev, currentWorkflow: step }));
    }
  }, [appState.uploadSession, appState.analysisResults]);

  /**
   * Convert AnalysisResult to AnalysisResults for ResultsPresenter
   */
  const getAnalysisResults = useCallback((): AnalysisResults | undefined => {
    if (!appState.analysisResults) return undefined;

    // Convert string status to ComplianceStatus enum
    const statusMap: Record<string, ComplianceStatus> = {
      pass: ComplianceStatus.PASS,
      fail: ComplianceStatus.FAIL,
      warning: ComplianceStatus.WARNING,
    };

    return {
      sessionId: appState.analysisResults.sessionId,
      proposalId: appState.analysisResults.proposalId,
      status: statusMap[appState.analysisResults.status] || ComplianceStatus.WARNING,
      overallScore: appState.analysisResults.overallScore,
      issues: appState.analysisResults.issues,
      metadata: {
        totalPages: appState.analysisResults.analysisMetadata.totalPages,
        processingTime: appState.analysisResults.analysisMetadata.processingTime,
        completedAt: appState.analysisResults.analysisMetadata.completedAt,
        rulesChecked: appState.analysisResults.analysisMetadata.rulesChecked,
        issueCounts: {
          critical: appState.analysisResults.issues.filter((i) => i.severity === 'critical').length,
          warning: appState.analysisResults.issues.filter((i) => i.severity === 'warning').length,
          info: appState.analysisResults.issues.filter((i) => i.severity === 'info').length,
        },
      },
    };
  }, [appState.analysisResults]);

  return (
    <div className="proposal-prepper-app min-h-screen bg-background flex flex-col font-body text-slate-800 overflow-hidden">
      {/* Header - Matching original aesthetic */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between shadow-sm z-20 relative">
        <div className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <FileText size={20} />
          </div>
          Proposal Prepper
          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/20 uppercase font-bold tracking-wider">
            Threshold
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewWorkflow}
            className="text-slate-500 hover:text-primary"
          >
            <Home className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
            <Settings size={20} />
          </Button>
        </div>
      </header>

      {/* Simple Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3">
            {Object.values(WorkflowState).map((step, index) => {
              const isCompleted = 
                (step === WorkflowState.UPLOAD && appState.uploadSession) ||
                (step === WorkflowState.ANALYSIS && appState.analysisResults) ||
                (step === WorkflowState.RESULTS && appState.analysisResults);
              
              const isCurrent = appState.currentWorkflow === step;
              const isAccessible = 
                step === WorkflowState.UPLOAD ||
                (step === WorkflowState.ANALYSIS && appState.uploadSession) ||
                (step === WorkflowState.RESULTS && appState.analysisResults);

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => isAccessible && navigateToStep(step)}
                  disabled={!isAccessible || appState.isLoading}
                  className={`flex items-center space-x-2 pb-2 px-1 text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'text-primary border-b-2 border-primary'
                      : isCompleted
                        ? 'text-slate-800 hover:text-primary'
                        : isAccessible
                          ? 'text-slate-600 hover:text-primary'
                          : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                    isCompleted 
                      ? 'bg-green-100 text-green-600' 
                      : isCurrent 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="capitalize">{step}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area - Matching original layout */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-112px)]">
        <main className="flex-1 flex relative bg-white shadow-inner-xl m-0 md:my-2 md:mr-2 md:rounded-lg overflow-hidden border-t md:border border-gray-200/80 transition-all duration-300">
          <div className="bg-white flex flex-col h-full relative w-full">
            {/* Error Display - Matching original style */}
            {appState.error && (
              <div className="bg-red-50 border border-red-200 p-4 mx-4 mt-4 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{appState.error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
              <div className="max-w-3xl mx-auto w-full">
                {/* Upload Step */}
                {appState.currentWorkflow === WorkflowState.UPLOAD && (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">Upload Proposal Document</h1>
                      <p className="text-gray-500 text-sm">
                        Upload your PDF proposal document to begin compliance analysis
                      </p>
                    </div>
                    <UploadManager
                      onUploadComplete={handleUploadComplete}
                      onUploadError={handleUploadError}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Analysis Step */}
                {appState.currentWorkflow === WorkflowState.ANALYSIS && appState.uploadSession && (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Document</h1>
                      <p className="text-gray-500 text-sm">
                        Analyzing "{appState.uploadSession.filename}" for FAR/DFARS compliance
                      </p>
                    </div>
                    <AnalysisCoordinator
                      proposalId={appState.uploadSession.id}
                      fileContent={appState.uploadSession.filename} // Simplified for threshold
                      onAnalysisStart={handleAnalysisStart}
                      onProgressUpdate={handleAnalysisProgress}
                      onAnalysisComplete={handleAnalysisComplete}
                      onAnalysisError={handleAnalysisError}
                      autoStart={true}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Results Step */}
                {appState.currentWorkflow === WorkflowState.RESULTS && appState.analysisResults && (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">Analysis Results</h1>
                      <p className="text-gray-500 text-sm">
                        Compliance analysis complete for "{appState.uploadSession?.filename}"
                      </p>
                    </div>
                    <ResultsPresenter
                      results={getAnalysisResults()}
                      isLoading={appState.isLoading}
                      error={appState.error || undefined}
                      onViewIssueDetails={(issue) => {
                        console.log('View issue details:', issue);
                      }}
                      onDownloadResults={() => {
                        console.log('Download results');
                      }}
                      onStartNewAnalysis={startNewWorkflow}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}