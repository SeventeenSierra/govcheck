// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

'use client';

import {
  Bot,
  Button,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  Loader2,
  Textarea,
} from '@17sierra/ui';
import { useEffect, useState } from 'react';

type AnalysisStep = {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'complete';
};

type AgentInterfaceProps = {
  activeProject: string | null;
  startDemo: () => void;
};

const AgentInterface = ({ activeProject, startDemo }: AgentInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState<'results' | 'steps'>('results');
  const [steps, setSteps] = useState<AnalysisStep[]>([
    {
      id: 1,
      title: 'Document Parsing',
      description: 'Extracting text and tables from Proposal_v1.docx',
      status: 'pending',
    },
    {
      id: 2,
      title: 'Regulatory Scan (FAR/DFARS)',
      description: 'Checking against latest regulations (Jan 2025)',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Biosketch Validation',
      description: 'Verifying SciENcv formatting compliance',
      status: 'pending',
    },
    {
      id: 4,
      title: 'Budget Analysis',
      description: 'Ensuring justification page limits and cost realism',
      status: 'pending',
    },
    {
      id: 5,
      title: 'Report Generation',
      description: 'Compiling findings into final compliance matrix',
      status: 'pending',
    },
  ]);

  const isAnalysisComplete = steps[steps.length - 1].status === 'complete';

  useEffect(() => {
    if (activeProject === 'demo-running') {
      setActiveTab('steps');

      const runSteps = async () => {
        setSteps((s) => s.map((step) => ({ ...step, status: 'pending' })));

        for (let i = 0; i < steps.length; i++) {
          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'loading' } : s)));
          await new Promise((r) => setTimeout(r, 1500));
          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'complete' } : s)));
        }
      };

      runSteps();
    } else if (activeProject) {
      setSteps((s) => s.map((step) => ({ ...step, status: 'complete' })));
      setActiveTab('results');
    }
  }, [activeProject, steps.length]);

  return (
    <div
      className={`bg-white flex flex-col h-full relative transition-all duration-500 ${
        activeProject ? 'w-full md:w-1/2 border-r border-gray-200' : 'w-full'
      }`}
    >
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32">
        <div className="max-w-3xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Vendor Proposal Compliance</h1>
            <p className="text-gray-500 text-sm">
              {activeProject
                ? 'Analyzing "Proposal_v1.docx" against current FAR/DFARS standards.'
                : 'Autonomous agent for federal procurement compliance.'}
            </p>
          </div>

          {!activeProject && (
            <div className="grid grid-cols-1 gap-4 mb-8">
              <button
                type="button"
                onClick={startDemo}
                className="text-left border border-gray-200 rounded-xl p-5 hover:border-primary/50 hover:shadow-md hover:bg-primary/5 transition-all group bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-base">
                      Analyze Proposal Compliance
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Upload a proposal to validate against FAR, DFARS, and Solicitation
                      requirements.
                    </p>
                  </div>
                </div>
              </button>

              <a
                href="/threshold"
                className="text-left border border-gray-200 rounded-xl p-5 hover:border-primary/50 hover:shadow-md hover:bg-primary/5 transition-all group bg-white block"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors">
                    <Bot size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-base">
                      Threshold Interface
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Access the functional compliance analysis interface with upload workflow.
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
                  onClick={() => setActiveTab('results')}
                  className={`pb-2 px-1 text-sm font-medium mr-6 transition-colors ${
                    activeTab === 'results'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  Results
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('steps')}
                  className={`pb-2 px-1 text-sm font-medium transition-colors ${
                    activeTab === 'steps'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-slate-800'
                  }`}
                >
                  Analysis steps
                </button>
              </div>

              {activeTab === 'steps' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {steps.map((step) => (
                    <div key={step.id} className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        {step.status === 'complete' && (
                          <CheckCircle2 size={18} className="text-green-600" />
                        )}
                        {step.status === 'loading' && (
                          <Loader2 size={18} className="text-primary animate-spin" />
                        )}
                        {step.status === 'pending' && (
                          <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-medium ${
                            step.status === 'pending' ? 'text-gray-400' : 'text-slate-800'
                          }`}
                        >
                          {step.title}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                  {isAnalysisComplete && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
                      <CheckCircle2 size={16} /> Analysis Complete. Report generated.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 p-1">
                      <Bot size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-50 border border-gray-200 p-4 rounded-2xl rounded-tl-none text-slate-800 leading-relaxed text-sm">
                        {isAnalysisComplete
                          ? "I've completed the compliance review. The proposal scored 92%. I found one minor warning regarding the budget justification length, but all mandatory FAR clauses are present. The detailed report is available on the right."
                          : "I am currently analyzing the document. You can track my progress in the 'Analysis steps' tab."}
                      </div>
                      {isAnalysisComplete && (
                        <div className="mt-2 flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">
                            Email to Officer
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs h-auto py-1.5">
                            Fix Budget Page
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm p-4 border-t border-gray-200">
        <div className="max-w-3xl mx-auto w-full">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask follow-up questions..."
              className="w-full p-3 pr-12 text-sm resize-none bg-white min-h-[50px] shadow-sm"
              rows={1}
            />
            <div className="absolute bottom-2.5 right-2.5">
              <Button size="icon" className="h-8 w-8" disabled={!inputValue}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentInterface;
