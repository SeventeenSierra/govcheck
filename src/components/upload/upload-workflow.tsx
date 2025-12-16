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

import { AlertCircle, CheckCircle, Clock, FileText, TrendingUp, Zap } from '@17sierra/ui';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { SimulationControls } from './simulation-controls';
import type { WebSocketMessage } from '@/services/strands-api-client';
import { UploadManager } from './upload-manager';
import { useRealTimeUpdates } from './use-real-time-updates';
import type { UploadSession } from '@/types/app';
import { strandsApiClient } from '@/services/strands-api-client';

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
  className = '',
}: UploadWorkflowProps): React.JSX.Element {
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    sessionId: null,
    status: 'idle',
    progress: 0,
    currentStep: 'Ready to start',
    results: null,
    error: null,
  });

  // Fetch analysis results
  const fetchAnalysisResults = useCallback(
    async (sessionId: string) => {
      try {
        const response = await strandsApiClient.getResults(sessionId);

        if (response.success && response.data) {
          setAnalysisState((prev) => ({
            ...prev,
            results: response.data,
          }));

          // Notify workflow completion
          onWorkflowComplete?.(uploadSession!, response.data);
        } else {
          console.error('Failed to fetch analysis results:', response.error);
          setAnalysisState((prev) => ({
            ...prev,
            error: response.error || 'Failed to fetch results',
          }));
        }
      } catch (error) {
        console.error('Error fetching analysis results:', error);
        setAnalysisState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to fetch results',
        }));
      }
    },
    [uploadSession, onWorkflowComplete]
  );

  // Real-time updates via WebSocket
  const realTimeUpdates = useRealTimeUpdates({
    autoConnect: true,
    currentSession: uploadSession,
    onUploadProgress: useCallback((message: WebSocketMessage) => {
      console.log('Upload progress update:', message);
      // Upload progress is handled by UploadManager
    }, []),
    onAnalysisProgress: useCallback(
      (message: WebSocketMessage, _session?: UploadSession) => {
        console.log('Analysis progress update:', message);

        if (message.sessionId === analysisState.sessionId) {
          const data = message.data as any;
          setAnalysisState((prev) => ({
            ...prev,
            status: data.status || prev.status,
            progress: data.progress || prev.progress,
            currentStep: data.currentStep || prev.currentStep,
          }));
        }
      },
      [analysisState.sessionId]
    ),
    onAnalysisComplete: useCallback(
      (message: WebSocketMessage, _session?: UploadSession) => {
        console.log('Analysis complete:', message);

        if (message.sessionId === analysisState.sessionId) {
          setAnalysisState((prev) => ({
            ...prev,
            status: 'completed',
            progress: 100,
            currentStep: 'Analysis completed',
          }));

          // Fetch final results
          fetchAnalysisResults(message.sessionId);
        }
      },
      [
        analysisState.sessionId, // Fetch final results
        fetchAnalysisResults,
      ]
    ),
    onError: useCallback(
      (message: WebSocketMessage, _session?: UploadSession) => {
        console.error('WebSocket error:', message);

        if (message.sessionId === analysisState.sessionId) {
          const errorData = message.data as any;
          setAnalysisState((prev) => ({
            ...prev,
            status: 'failed',
            error: errorData.error || 'Analysis failed',
            currentStep: 'Analysis failed',
          }));

          onWorkflowError?.(errorData.error || 'Analysis failed', {
            sessionId: message.sessionId,
            uploadSession,
          });
        }
      },
      [analysisState.sessionId, uploadSession, onWorkflowError]
    ),
  });



  // Poll analysis status if not using WebSocket
  useEffect(() => {
    if (
      !analysisState.sessionId ||
      analysisState.status === 'completed' ||
      analysisState.status === 'failed'
    ) {
      return;
    }

    // Only poll if WebSocket is not connected
    if (realTimeUpdates.connected) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await strandsApiClient.getAnalysisStatus(analysisState.sessionId!);

        if (response.success && response.data) {
          const data = response.data;
          setAnalysisState((prev) => ({
            ...prev,
            status: data.status as any,
            progress: data.progress || 0,
            currentStep: data.currentStep || 'Processing...',
          }));

          // Check if completed
          if (data.status === 'completed') {
            fetchAnalysisResults(analysisState.sessionId!);
          } else if (data.status === 'failed') {
            setAnalysisState((prev) => ({
              ...prev,
              error: (data as any).error_message || 'Analysis failed',
            }));
          }
        }
      } catch (error) {
        console.error('Error polling analysis status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [
    analysisState.sessionId,
    analysisState.status,
    realTimeUpdates.connected,
    fetchAnalysisResults,
  ]);

  // Start analysis manually
  const startAnalysis = useCallback(
    async (proposalId: string, filename?: string) => {
      try {
        console.log('Starting analysis for proposal:', proposalId);

        const response = await strandsApiClient.startAnalysis(proposalId, proposalId, filename);

        if (response.success && response.data) {
          console.log('Analysis started:', response.data.id);
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
          setAnalysisState((prev) => ({
            ...prev,
            error: response.error || 'Failed to start analysis',
          }));
          onWorkflowError?.(response.error || 'Failed to start analysis', { proposalId });
        }
      } catch (error) {
        console.error('Error starting analysis:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to start analysis';
        setAnalysisState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
        onWorkflowError?.(errorMessage, { proposalId });
      }
    },
    [onWorkflowError]
  );

  // Handle upload completion
  const handleUploadComplete = useCallback(
    (session: UploadSession) => {
      console.log('Upload completed:', session);
      setUploadSession(session);

      // Check if analysis was automatically started
      if (session.analysisSessionId) {
        console.log('Analysis automatically started:', session.analysisSessionId);
        setAnalysisState({
          sessionId: session.analysisSessionId,
          status: 'queued',
          progress: 0,
          currentStep: 'Analysis queued',
          results: null,
          error: null,
        });
      } else {
        // Start analysis manually if not automatically started
        startAnalysis(session.id, session.filename);
      }
    },
    [
      // Start analysis manually if not automatically started
      startAnalysis,
    ]
  );



  // Handle upload error
  const handleUploadError = useCallback(
    (error: string, session: UploadSession) => {
      console.error('Upload error:', error);
      onWorkflowError?.(error, { uploadSession: session });
    },
    [onWorkflowError]
  );

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setUploadSession(null);
    setAnalysisState({
      sessionId: null,
      status: 'idle',
      progress: 0,
      currentStep: 'Ready to start',
      results: null,
      error: null,
    });
  }, []);

  // Determine overall workflow status
  const getWorkflowStatus = () => {
    if (!uploadSession) return 'waiting';
    if (uploadSession.status !== 'completed') return 'uploading';
    if (analysisState.status === 'idle') return 'upload_complete';
    if (analysisState.status === 'failed') return 'failed';
    if (analysisState.status === 'completed') return 'completed';
    return 'analyzing';
  };

  const workflowStatus = getWorkflowStatus();

  return (
    <div className={`upload-workflow space-y-6 ${className}`}>
      {/* Upload Section */}
      <div className="upload-section">
        <UploadManager
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          disabled={disabled}
        />

        {!uploadSession && (
          <SimulationControls
            onComplete={handleUploadComplete}
            onError={(err) => onWorkflowError?.(err)}
          />
        )}
      </div>

      {/* Analysis Section */}
      {uploadSession && (
        <div className="analysis-section border-t pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              {analysisState.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : analysisState.status === 'failed' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : analysisState.status === 'idle' ? (
                <Clock className="h-5 w-5 text-gray-400" />
              ) : (
                <Zap className="h-5 w-5 text-blue-500 animate-pulse" />
              )}
              <h3 className="text-lg font-medium">
                {analysisState.status === 'completed'
                  ? 'Analysis Complete'
                  : analysisState.status === 'failed'
                    ? 'Analysis Failed'
                    : analysisState.status === 'idle'
                      ? 'Ready for Analysis'
                      : 'Analyzing Document'}
              </h3>
            </div>

            {/* WebSocket Connection Status */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div
                className={`w-2 h-2 rounded-full ${realTimeUpdates.connected ? 'bg-green-500' : 'bg-gray-300'
                  }`}
              />
              {realTimeUpdates.connected ? 'Live updates' : 'Polling for updates'}
            </div>
          </div>

          {/* Progress Information */}
          {analysisState.sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Session ID:</span>
                <span className="font-mono text-xs">{analysisState.sessionId}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="capitalize">{analysisState.status}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Current Step:</span>
                <span>{analysisState.currentStep}</span>
              </div>

              {analysisState.status !== 'idle' && analysisState.status !== 'failed' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{Math.round(analysisState.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {analysisState.error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {analysisState.error}
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          {analysisState.results && (
            <div className="mt-4 bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">Analysis Results</h4>
              </div>
              <div className="text-sm text-green-700">
                <p>
                  Status: <span className="capitalize">{analysisState.results.status}</span>
                </p>
                <p>Issues Found: {analysisState.results.summary?.total_issues || 0}</p>
                <p>Critical: {analysisState.results.summary?.critical_count || 0}</p>
                <p>Warnings: {analysisState.results.summary?.warning_count || 0}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {workflowStatus === 'completed' && (
              <button
                onClick={resetWorkflow}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Analyze Another Document
              </button>
            )}

            {workflowStatus === 'failed' && (
              <button
                onClick={() =>
                  uploadSession && startAnalysis(uploadSession.id, uploadSession.filename)
                }
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry Analysis
              </button>
            )}
          </div>
        </div>
      )}

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500 border-t pt-4">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                workflowStatus,
                uploadSession: uploadSession
                  ? {
                    id: uploadSession.id,
                    status: uploadSession.status,
                    analysisSessionId: uploadSession.analysisSessionId,
                  }
                  : null,
                analysisState,
                realTimeUpdates: {
                  connected: realTimeUpdates.connected,
                  connecting: realTimeUpdates.connecting,
                  error: realTimeUpdates.error,
                },
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
}
