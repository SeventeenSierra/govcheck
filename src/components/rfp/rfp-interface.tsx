/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { Bot, Button, CheckCircle, FileCheck, Sparkles, XCircle } from '@17sierra/ui';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { type AnalysisStep, AnalysisSteps, ChatInput } from '@/components/shared';
import { UploadWorkflow } from '@/components/upload/upload-workflow';
import { StrandsIntegrationUtils } from '@/services';
import type { UploadSession } from '@/types/app';

/**
 * RFP Interface Props
 */
export interface RFPInterfaceProps {
  /** Current active project ID */
  activeProject: string | null;
  /** Callback when a new project starts */
  onProjectStart: (projectId: string) => void;
  /** Callback when analysis completes */
  onAnalysisComplete?: (results: any) => void;
  /** Callback to start a new analysis */
  onStartNew?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Analysis workflow states
 */
type WorkflowState = 'welcome' | 'upload' | 'analysis' | 'chat' | 'results';

/**
 * Service Status Indicator Component
 * Shows the current status of the Strands analysis service
 */
const ServiceStatusIndicator: React.FC = () => {
  const [serviceStatus, setServiceStatus] = useState<{
    healthy: boolean;
    message: string;
    baseUrl: string;
    version?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const config = StrandsIntegrationUtils.getServiceConfig();
        const serviceReady = await StrandsIntegrationUtils.ensureServiceReady();

        setServiceStatus({
          healthy: serviceReady.ready,
          message: serviceReady.ready
            ? 'Analysis service is ready'
            : serviceReady.message || 'Service unavailable',
          baseUrl: config.baseUrl,
          version: config.version,
        });
      } catch (_error) {
        setServiceStatus({
          healthy: false,
          message: 'Unable to check service status',
          baseUrl: 'Unknown',
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkServiceStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Checking service status...</span>
        </div>
      </div>
    );
  }

  if (!serviceStatus) return null;

  const statusIcon = serviceStatus.healthy ? (
    <CheckCircle className="w-4 h-4 text-green-600" />
  ) : (
    <XCircle className="w-4 h-4 text-red-600" />
  );

  const statusColor = serviceStatus.healthy
    ? 'bg-green-50 border-green-200 text-green-800'
    : 'bg-red-50 border-red-200 text-red-800';

  return (
    <div className={`mb-6 p-3 border rounded-lg ${statusColor}`}>
      <div className="flex items-center gap-2 text-sm">
        {statusIcon}
        <span className="font-medium">{serviceStatus.message}</span>
        {serviceStatus.version && (
          <span className="text-xs opacity-75">v{serviceStatus.version}</span>
        )}
      </div>
      {!serviceStatus.healthy && (
        <div className="mt-2 text-xs opacity-75">Service URL: {serviceStatus.baseUrl}</div>
      )}
    </div>
  );
};

/**
 * RFP Interface Component
 *
 * A comprehensive interface that combines document upload, AI-powered analysis,
 * interactive chat, and results presentation in a single, cohesive experience.
 *
 * Features:
 * - Smart welcome screen with guided actions
 * - Drag-and-drop document upload
 * - Real-time analysis progress tracking
 * - Interactive AI chat assistance
 * - Comprehensive results presentation
 */
export const RFPInterface: React.FC<RFPInterfaceProps> = ({
  activeProject,
  onProjectStart,
  onAnalysisComplete,
  onStartNew,
  className = '',
}) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>('welcome');
  const [inputValue, setInputValue] = useState('');
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const [chatHistory, setChatHistory] = useState<
    Array<{ id: string; type: 'user' | 'assistant'; content: string; timestamp: Date }>
  >([]);

  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 1,
      title: 'Document Processing',
      description: 'Extracting text and structure from your proposal document',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Regulatory Analysis',
      description: 'Checking compliance against FAR, DFARS, and solicitation requirements',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Budget Validation',
      description: 'Analyzing budget justifications and cost realism',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Quality Assessment',
      description: 'Evaluating proposal quality and completeness',
      status: 'pending',
    },
    {
      id: 5,
      title: 'Report Generation',
      description: 'Compiling findings into comprehensive compliance report',
      status: 'pending',
    },
  ]);

  // Handle workflow completion (upload + analysis)
  const handleWorkflowComplete = useCallback(
    async (session: UploadSession, analysisResults?: any) => {
      console.log('Workflow completed:', { session, analysisResults });

      setUploadSession(session);
      setWorkflowState('chat');
      onProjectStart(session.id);

      if (onAnalysisComplete && analysisResults) {
        onAnalysisComplete(analysisResults);
      }

      // Add initial AI message
      setChatHistory([
        {
          id: Date.now().toString(),
          type: 'assistant',
          content:
            "I've completed the compliance analysis of your proposal. The document has been thoroughly reviewed against current federal regulations. How can I help you understand the results?",
          timestamp: new Date(),
        },
      ]);
    },
    [onProjectStart, onAnalysisComplete]
  );

  // Handle workflow errors
  const handleWorkflowError = useCallback(
    (error: string, context?: any) => {
      console.error('Workflow error:', error, context);

      // Add error message to chat if we're in chat mode
      if (workflowState === 'chat') {
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'assistant',
            content: `I encountered an error: ${error}. Please try uploading your document again or contact support if the issue persists.`,
            timestamp: new Date(),
          },
        ]);
      }
    },
    [workflowState]
  );

  // Handle chat submission
  const handleChatSubmit = useCallback(async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);

    // Simulate AI response (in real implementation, this would call strands API)
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: `I understand you're asking about "${message}". Based on the analysis, I can provide specific guidance on this aspect of your proposal. Would you like me to elaborate on any particular compliance requirement?`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, aiResponse]);
    }, 1000);
  }, []);

  // Handle starting new analysis
  const handleStartNew = useCallback(() => {
    setWorkflowState('welcome');
    setUploadSession(null);
    setChatHistory([]);
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'pending', error: undefined })));
    if (onStartNew) {
      onStartNew();
    }
  }, [onStartNew]);

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 pb-32 ${className}`}>
      <div className="max-w-3xl mx-auto w-full">
        {/* Welcome State */}
        {workflowState === 'welcome' && (
          <>
            <div className="mb-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">RFP Compliance Analyzer</h1>
              <p className="text-lg text-gray-600 mb-4">
                AI-powered proposal analysis for federal procurement compliance
              </p>
              <ServiceStatusIndicator />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-lg">
                    <FileCheck size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 text-lg mb-2">
                      Upload & Analyze Proposal
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload your proposal document for comprehensive compliance analysis against
                      FAR, DFARS, and solicitation requirements.
                    </p>
                  </div>
                </div>

                <UploadWorkflow
                  onWorkflowComplete={handleWorkflowComplete}
                  onWorkflowError={handleWorkflowError}
                />
              </div>

              <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-2">
                      AI-Powered Analysis
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Our advanced AI analyzes your proposal against the latest federal regulations,
                      identifying compliance issues and providing actionable recommendations.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Real-time compliance checking</li>
                      <li>• Interactive chat assistance</li>
                      <li>• Detailed remediation guidance</li>
                      <li>• Professional compliance reports</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Analysis State */}
        {workflowState === 'analysis' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Your Proposal</h1>
              <p className="text-gray-500 text-sm">
                Processing "{uploadSession?.filename}" for compliance validation...
              </p>
            </div>

            <AnalysisSteps
              steps={steps}
              showTiming={true}
              completionMessage="Analysis complete! Transitioning to interactive mode..."
            />
          </>
        )}

        {/* Chat State */}
        {workflowState === 'chat' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Analysis Complete</h1>
              <p className="text-gray-500 text-sm">
                Your proposal has been analyzed. Ask me anything about the results!
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {chatHistory.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 p-1">
                    {message.type === 'assistant' ? (
                      <Bot size={20} className="text-primary" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        message.type === 'assistant'
                          ? 'bg-slate-50 border border-gray-200 rounded-tl-none text-slate-800'
                          : 'bg-primary text-primary-foreground rounded-tr-none'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.type === 'assistant' && (
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5"
                          onClick={handleStartNew}
                        >
                          Analyze Another
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Chat Input - Always available when project is active */}
      {activeProject && (
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleChatSubmit}
          placeholder={
            workflowState === 'analysis'
              ? 'Analysis in progress... Chat will be available when complete'
              : 'Ask questions about your proposal analysis...'
          }
          disabled={workflowState === 'analysis'}
          maxLength={500}
          showCharacterCount={true}
        />
      )}
    </div>
  );
};
