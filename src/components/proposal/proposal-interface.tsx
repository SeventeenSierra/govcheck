/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@17sierra/ui';
import { Bot, FileCheck, Upload } from 'lucide-react';
import { AnalysisSteps, ChatInput, type AnalysisStep } from '@/components/shared';
import { UploadManager } from '@/components/upload';
import { strandsApiClient } from '@/services';
import type { UploadSession } from '@/types/app';

type ProposalInterfaceProps = {
  activeProject: string | null;
  onProjectStart: (projectId: string) => void;
  onAnalysisComplete?: (results: any) => void;
};

const ProposalInterface = ({ activeProject, onProjectStart, onAnalysisComplete }: ProposalInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 1,
      title: 'Document Upload',
      description: 'Uploading proposal document to secure analysis environment',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Text Extraction',
      description: 'Extracting text and structured data from document',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Regulatory Compliance Scan',
      description: 'Checking against FAR, DFARS, and solicitation requirements',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Budget & Cost Analysis',
      description: 'Validating budget justifications and cost realism',
      status: 'pending',
    },
    {
      id: 5,
      title: 'Final Validation',
      description: 'Generating compliance report and recommendations',
      status: 'pending',
    },
  ]);

  const isAnalysisComplete = steps[steps.length - 1].status === 'complete';

  const handleUploadComplete = useCallback(async (session: UploadSession) => {
    setUploadSession(session);
    setActiveTab('analysis');
    onProjectStart(session.id);

    // Start analysis process
    try {
      // Update first step to complete
      setSteps(prev => prev.map((s, idx) => 
        idx === 0 ? { ...s, status: 'complete' } : s
      ));

      // Start strands analysis
      const analysisResponse = await strandsApiClient.startAnalysis(session.id);

      // Simulate step-by-step progress
      for (let i = 1; i < steps.length; i++) {
        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'loading' } : s
        ));
        
        // In a real implementation, this would poll the strands API for progress
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'complete' } : s
        ));
      }

      // Get final results
      if (analysisResponse.success && analysisResponse.data) {
        const results = await strandsApiClient.getResults(analysisResponse.data.id);
        if (onAnalysisComplete) {
          onAnalysisComplete(results);
        }
      }
      setActiveTab('results');

    } catch (error) {
      console.error('Analysis failed:', error);
      // Handle error state
    }
  }, [onProjectStart, onAnalysisComplete, steps.length]);

  const handleChatSubmit = useCallback((message: string) => {
    // In a real implementation, this would send the message to strands
    console.log('Chat message:', message);
  }, []);

  const startNewAnalysis = () => {
    setUploadSession(null);
    setActiveTab('upload');
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {activeProject ? 'Proposal Analysis' : 'Proposal Compliance Analysis'}
          </h1>
          <p className="text-gray-500 text-sm">
            {activeProject
              ? `Analyzing "${uploadSession?.filename}" against current FAR/DFARS standards.`
              : 'Upload your proposal document for automated compliance validation.'}
          </p>
        </div>

        {!activeProject && (
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="text-left border border-gray-200 rounded-xl p-5 bg-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                  <FileCheck size={24} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-base">
                    Upload Proposal Document
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Upload your proposal to validate against FAR, DFARS, and solicitation requirements.
                  </p>
                </div>
              </div>
              
              <UploadManager onUploadComplete={handleUploadComplete} />
            </div>

            <a
              href="/agent"
              className="text-left border border-gray-200 rounded-xl p-5 hover:border-primary/50 hover:shadow-md hover:bg-primary/5 transition-all group bg-white block"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors">
                  <Bot size={24} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-base">
                    Agent Interface
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Access the AI-powered compliance analysis interface with interactive guidance.
                  </p>
                </div>
              </div>
            </a>
          </div>
        )}

        {activeProject && (
          <div className="flex flex-col h-full">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('analysis')}
                className={`pb-2 px-1 text-sm font-medium mr-6 transition-colors ${
                  activeTab === 'analysis'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-slate-800'
                }`}
              >
                Analysis Progress
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('results')}
                className={`pb-2 px-1 text-sm font-medium transition-colors ${
                  activeTab === 'results'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-slate-800'
                }`}
                disabled={!isAnalysisComplete}
              >
                Results
              </button>
            </div>

            {activeTab === 'analysis' && (
              <AnalysisSteps steps={steps} />
            )}

            {activeTab === 'results' && isAnalysisComplete && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 p-1">
                    <Bot size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-50 border border-gray-200 p-4 rounded-2xl rounded-tl-none text-slate-800 leading-relaxed text-sm">
                      I've completed the compliance analysis of your proposal. The document has been thoroughly reviewed against current federal regulations. You can view the detailed compliance report in the right panel.
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">
                        Download Report
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-auto py-1.5"
                        onClick={startNewAnalysis}
                      >
                        Analyze Another
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleChatSubmit}
        disabled={!activeProject}
        placeholder={activeProject ? "Ask questions about the analysis..." : "Upload a document to start chatting"}
      />
    </div>
  );
};

export default ProposalInterface;