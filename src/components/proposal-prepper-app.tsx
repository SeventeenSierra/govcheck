/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { Button } from '@17sierra/ui';
import { AlertCircle, FileText, Home, Settings } from 'lucide-react';
import type React from 'react';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import type { AnalysisResult, AnalysisSession } from '@/components/analysis/types';
import type { NavigationStep } from '@/components/navigation/navigation-controller';
import type { AnalysisResults } from '@/components/results/types';
import { ComplianceStatus } from '@/components/results/types';
import type { UploadSession } from '@/types/app';
import { PerformanceMonitor } from '@/utils/performance';

// Lazy load non-critical components for better performance
// Requirement 5.1: Load time performance optimization
const UploadManager = lazy(() =>
  import('@/components/upload/upload-manager').then((module) => ({
    default: module.UploadManager,
  }))
);

const AnalysisCoordinator = lazy(() =>
  import('@/components/analysis/analysis-coordinator').then((module) => ({
    default: module.AnalysisCoordinator,
  }))
);

const ResultsPresenter = lazy(() =>
  import('@/components/results/results-presenter').then((module) => ({
    default: module.ResultsPresenter,
  }))
);

const NavigationController = lazy(() =>
  import('@/components/navigation/navigation-controller').then((module) => ({
    default: module.NavigationController,
  }))
);

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
 * - Performance optimizations (Requirement 5.1)
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

  // Track if component has mounted to prevent hydration mismatches
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Performance monitoring for app initialization
  // Requirement 5.1: Load time performance
  useEffect(() => {
    // Only run performance monitoring on client side
    if (typeof window === 'undefined') return;

    PerformanceMonitor.mark('app-init-start');

    const handleLoad = () => {
      PerformanceMonitor.mark('app-init-end');
      const initTime = PerformanceMonitor.measure('app-init', 'app-init-start', 'app-init-end');

      if (initTime) {
        console.log(`App initialization took ${initTime}ms`);

        // Log performance metrics for monitoring
        const navigationTiming = PerformanceMonitor.getNavigationTiming();
        if (navigationTiming) {
          console.log('Navigation timing:', navigationTiming);

          // Warn if load time exceeds requirement (5 seconds)
          if (navigationTiming.loadComplete > 5000) {
            console.warn(
              `Load time (${navigationTiming.loadComplete}ms) exceeds 5-second requirement`
            );
          }
        }
      }
    };

    // Check if already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  /**
   * Handle successful upload completion
   * Requirement 4.2: Clear navigation and workflow
   */
  const handleUploadComplete = useCallback((session: UploadSession) => {
    console.log('handleUploadComplete called with session:', session.id);
    
    // Add a small delay to ensure the upload component has finished processing
    setTimeout(() => {
      console.log('Setting app state to analysis workflow');
      setAppState((prev) => ({
        ...prev,
        uploadSession: session,
        currentWorkflow: WorkflowState.ANALYSIS,
        error: null,
      }));
    }, 100);
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
  const navigateToStep = useCallback(
    (step: WorkflowState) => {
      // Only allow navigation to completed steps
      if (step === WorkflowState.UPLOAD) {
        setAppState((prev) => ({ ...prev, currentWorkflow: step }));
      } else if (step === WorkflowState.ANALYSIS && appState.uploadSession) {
        setAppState((prev) => ({ ...prev, currentWorkflow: step }));
      } else if (step === WorkflowState.RESULTS && appState.analysisResults) {
        setAppState((prev) => ({ ...prev, currentWorkflow: step }));
      }
    },
    [appState.uploadSession, appState.analysisResults]
  );

  /**
   * Generate navigation steps based on current app state
   * Requirement 4.2: Clear navigation and workflow
   */
  const getNavigationSteps = useCallback((): NavigationStep[] => {
    return [
      {
        id: WorkflowState.UPLOAD,
        label: 'Upload',
        description: 'Upload proposal document',
        isCompleted: !!appState.uploadSession,
        isCurrent: appState.currentWorkflow === WorkflowState.UPLOAD,
        isAccessible: true,
      },
      {
        id: WorkflowState.ANALYSIS,
        label: 'Analysis',
        description: 'Analyze for compliance',
        isCompleted: !!appState.analysisResults,
        isCurrent: appState.currentWorkflow === WorkflowState.ANALYSIS,
        isAccessible: !!appState.uploadSession,
      },
      {
        id: WorkflowState.RESULTS,
        label: 'Results',
        description: 'View compliance results',
        isCompleted: !!appState.analysisResults,
        isCurrent: appState.currentWorkflow === WorkflowState.RESULTS,
        isAccessible: !!appState.analysisResults,
      },
    ];
  }, [appState]);

  /**
   * Handle navigation controller step changes
   * Requirement 4.2: Clear navigation and workflow
   */
  const handleNavigationStepChange = useCallback((stepId: string) => {
    navigateToStep(stepId as WorkflowState);
  }, [navigateToStep]);

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

      {/* Navigation Controller */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        {isMounted ? (
          <Suspense
            fallback={
              <div className="flex items-center space-x-8 py-3">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            }
          >
            <NavigationController
              steps={getNavigationSteps()}
              onNavigateToStep={handleNavigationStepChange}
              onStartOver={startNewWorkflow}
              disabled={appState.isLoading}
              className="max-w-3xl mx-auto"
            />
          </Suspense>
        ) : (
          <div className="flex items-center space-x-8 py-3">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        )}
      </div>

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
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Upload Proposal Document
                      </h1>
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
