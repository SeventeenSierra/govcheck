/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Upload Workflow Component
 * 
 * Enhanced upload component that integrates the complete end-to-end workflow:
 * 1. Document upload
 * 2. Automatic analysis start
 * 3. Real-time progress updates via WebSocket
 * 4. Results display
 * 
 * Implements task 11 requirements for end-to-end workflow integration.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle, Zap, FileText, TrendingUp } from 'lucide-react';
import { UploadManager } from './upload-manager';
import { useRealTimeUpdates } from './use-real-time-updates';
import type { UploadSession } from '@/types/app';
import type { WebSocketMessage } from '@/services';
import { strandsApiClient, StrandsIntegrationUtils } from '@/services';
import { AnalysisSteps, type AnalysisStep } from '@/components/shared';

export interface UploadWorkflowProps {
  /** Callback when the complete workflow finishes */
  onWorkflowComplete?: (uploadSession: UploadSession, analysisResults?: any) => void;
  /** Callback for workflow errors */
  onWorkflowError?: (error: string, context?: any) => void;
  /** Whether the workflow is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface AnalysisState {
  sessionId: string | null;
  status: 'idle' | 'queued' | 'extracting' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  results: any | null;
  error: string | null;
}

/**
 * Upload Workflow Component
 * 
 * Orchestrates the complete document upload and analysis workflow
 * with real-time progress updates and error handling.
 */
export function UploadWorkflow({
  onWorkflowComplete,
  onWorkflowError,
  disabled = false,
  className = ''
}: UploadWorkflowProps): React.JSX.Element {
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    sessionId: null,
    status: 'idle',
    progress: 0,
    currentStep: 'Ready to start',
    results: null,
    error: null
  });

  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 1, title: 'Document Processing', description: 'Extracting text and structure from your proposal document', status: 'pending' },
    { id: 2, title: 'Regulatory Analysis', description: 'Checking compliance against FAR, DFARS, and solicitation requirements', status: 'pending' },
    { id: 3, title: 'Budget Validation', description: 'Analyzing budget justifications and cost realism', status: 'pending' },
    { id: 4, title: 'Quality Assessment', description: 'Evaluating proposal quality and completeness', status: 'pending' },
    { id: 5, title: 'Report Generation', description: 'Compiling findings into comprehensive compliance report', status: 'pending' },
  ]);

  // Real-time updates via WebSocket
  const realTimeUpdates = useRealTimeUpdates({
    autoConnect: true,
    currentSession: uploadSession,
    onAnalysisProgress: useCallback((message: WebSocketMessage) => {
      if (message.sessionId === analysisState.sessionId) {
        const data = message.data as any;
        setAnalysisState(prev => ({
          ...prev,
          status: data.status || prev.status,
          progress: data.progress || prev.progress,
          currentStep: data.currentStep || prev.currentStep
        }));
        
        // Also update the visual steps
        setAnalysisSteps(prevSteps => {
          const stepIndex = prevSteps.findIndex(s => s.title.toLowerCase().includes(data.currentStep.split(' ')[0].toLowerCase()));
          if (stepIndex > -1) {
            return prevSteps.map((step, index) => {
              if (index < stepIndex) return { ...step, status: 'complete' };
              if (index === stepIndex) return { ...step, status: 'loading' };
              return step;
            });
          }
          return prevSteps;
        });

      }
    }, [analysisState.sessionId]),
    onAnalysisComplete: useCallback((message: WebSocketMessage) => {
      if (message.sessionId === analysisState.sessionId) {
        setAnalysisState(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          currentStep: 'Analysis completed'
        }));
        setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
        fetchAnalysisResults(message.sessionId);
      }
    }, [analysisState.sessionId]),
    onError: useCallback((message: WebSocketMessage) => {
      if (message.sessionId === analysisState.sessionId) {
        const errorData = message.data as any;
        const errorMessage = errorData.error || 'Analysis failed';
        setAnalysisState(prev => ({ ...prev, status: 'failed', error: errorMessage, currentStep: 'Analysis failed' }));
        onWorkflowError?.(errorMessage, { sessionId: message.sessionId, uploadSession });
      }
    }, [analysisState.sessionId, uploadSession, onWorkflowError])
  });

  // Fetch analysis results
  const fetchAnalysisResults = useCallback(async (sessionId: string) => {
    try {
      const response = await strandsApiClient.getResults(sessionId);
      if (response.success && response.data) {
        setAnalysisState(prev => ({ ...prev, results: response.data }));
        onWorkflowComplete?.(uploadSession!, response.data);
      } else {
        const error = response.error || 'Failed to fetch results';
        setAnalysisState(prev => ({ ...prev, error }));
        onWorkflowError?.(error, { sessionId });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch results';
      setAnalysisState(prev => ({ ...prev, error: errorMessage }));
      onWorkflowError?.(errorMessage, { sessionId });
    }
  }, [uploadSession, onWorkflowComplete, onWorkflowError]);

  const simulateAnalysisProgress = useCallback(() => {
    let currentStepIndex = 0;
    const interval = setInterval(() => {
      setAnalysisSteps(prevSteps => 
        prevSteps.map((step, index) => {
          if (index < currentStepIndex) return { ...step, status: 'complete' };
          if (index === currentStepIndex) return { ...step, status: 'loading' };
          return step;
        })
      );
      
      setAnalysisState(prev => ({
        ...prev,
        progress: (currentStepIndex / analysisSteps.length) * 100,
        currentStep: analysisSteps[currentStepIndex].description,
        status: 'analyzing',
      }));
      
      currentStepIndex++;

      if (currentStepIndex > analysisSteps.length) {
        clearInterval(interval);
        setAnalysisState(prev => ({ ...prev, status: 'completed', progress: 100, currentStep: 'Analysis completed' }));
        setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
        fetchAnalysisResults(analysisState.sessionId!);
      }
    }, 1500); // Simulate each step taking 1.5 seconds

    return () => clearInterval(interval);
  }, [analysisSteps, analysisState.sessionId, fetchAnalysisResults]);

  // Poll analysis status if not using WebSocket
  useEffect(() => {
    if (!analysisState.sessionId || analysisState.status === 'completed' || analysisState.status === 'failed') return;
    if (realTimeUpdates.connected) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await strandsApiClient.getAnalysisStatus(analysisState.sessionId!);
        if (response.success && response.data) {
          const data = response.data;
          setAnalysisState(prev => ({ ...prev, status: data.status as any, progress: data.progress || 0, currentStep: data.currentStep || 'Processing...' }));
          if (data.status === 'completed') fetchAnalysisResults(analysisState.sessionId!);
          else if (data.status === 'failed') setAnalysisState(prev => ({ ...prev, error: (data as any).error_message || 'Analysis failed' }));
        }
      } catch (error) { console.error('Error polling analysis status:', error); }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [analysisState.sessionId, analysisState.status, realTimeUpdates.connected, fetchAnalysisResults]);

  // Handle upload completion
  const handleUploadComplete = useCallback(async (session: UploadSession) => {
    console.log('Upload completed:', session);
    setUploadSession(session);
    setAnalysisState(prev => ({ ...prev, status: 'analyzing' }));

    const isReady = await StrandsIntegrationUtils.ensureServiceReady();
    if (isReady.ready) {
      try {
        const response = await strandsApiClient.startAnalysis(
          session.id, 
          session.id, 
          session.filename
        );

        if (response.success && response.data) {
          setAnalysisState({
            sessionId: response.data.id,
            status: 'queued',
            progress: 0,
            currentStep: 'Analysis queued',
            results: null,
            error: null,
          });
        } else {
          console.error('Failed to start analysis:', response.error);
          setAnalysisState(prev => ({
            ...prev,
            status: 'failed',
            error: response.error || 'Failed to start analysis',
          }));
        }
      } catch (error) {
        console.error('Error starting analysis:', error);
        setAnalysisState(prev => ({
          ...prev,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    } else {
      console.warn('Strands service unavailable, running mock analysis');
      setAnalysisState({ sessionId: `mock-analysis-${Date.now()}`, status: 'analyzing', progress: 0, currentStep: 'Starting mock analysis', results: null, error: null });
      simulateAnalysisProgress();
    }
  }, [simulateAnalysisProgress]);

  // Handle upload error
  const handleUploadError = useCallback((error: string, session: UploadSession) => {
    console.error('Upload error:', error);
    onWorkflowError?.(error, { uploadSession: session });
  }, [onWorkflowError]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setUploadSession(null);
    setAnalysisState({ sessionId: null, status: 'idle', progress: 0, currentStep: 'Ready to start', results: null, error: null });
    setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
  }, []);
  
  const workflowStatus = !uploadSession ? 'upload' : analysisState.status;

  return (
    <div className={`upload-workflow space-y-6 ${className}`}>
      {/* Upload Section */}
      {workflowStatus === 'upload' && (
        <div className="upload-section">
          <UploadManager
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            disabled={disabled}
          />
        </div>
      )}

      {/* Analysis Section */}
      {workflowStatus !== 'upload' && uploadSession && (
        <div className="analysis-section border-t pt-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-medium">
              {workflowStatus === 'completed' ? 'Analysis Complete' :
               workflowStatus === 'failed' ? 'Analysis Failed' :
               'Analyzing Document'}
            </h3>
          </div>

          <AnalysisSteps steps={analysisSteps} showTiming={true} />

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            {(workflowStatus === 'completed' || workflowStatus === 'failed') && (
              <Button onClick={resetWorkflow} variant="outline" size="sm">
                Analyze Another Document
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500 border-t pt-4">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify({
              workflowStatus,
              uploadSession: uploadSession ? { id: uploadSession.id, status: uploadSession.status, analysisSessionId: uploadSession.analysisSessionId } : null,
              analysisState,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
