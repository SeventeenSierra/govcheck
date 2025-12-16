'use client';

import { Bot, CheckCircle2, FileCheck, Loader2, Send, Sparkles, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Textarea } from '@/components/ui';

type Step = {
  id: number;
  message: string;
  status: 'pending' | 'running' | 'complete';
  agent?: 'coordinator' | 'rag' | 'compliance' | 'writer';
  details?: string;
};

type Message = {
  role: 'user' | 'bot';
  content: string;
};

type AgentInterfaceProps = {
  activeProject: string | null;
  startDemo: () => void;
};

const AgentInterface = ({ activeProject, startDemo }: AgentInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'results'>('steps');
  const [steps, setSteps] = useState<Step[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Demo Simulation Logic
  useEffect(() => {
    if (activeProject === 'demo-running') {
      setSteps([]);
      setMessages([]);
      setIsAnalysisComplete(false);
      setActiveTab('steps');

      const demoSteps: Step[] = [
        {
          id: 1,
          message: 'Ingesting proposal document structure...',
          status: 'pending',
          agent: 'coordinator',
          details: 'Structure Analysis',
        },
        {
          id: 2,
          message: 'Retrieving relevant FAR/DFARS clauses...',
          status: 'pending',
          agent: 'rag',
          details: 'Regulatory Search',
        },
        {
          id: 3,
          message: 'Validating Telecommunications compliance (52.204-24)...',
          status: 'pending',
          agent: 'compliance',
          details: 'Clause Validation',
        },
        {
          id: 4,
          message: 'Checking Key Personnel Biosketch format...',
          status: 'pending',
          agent: 'compliance',
          details: 'Format Check',
        },
        {
          id: 5,
          message: 'Synthesizing compliance report...',
          status: 'pending',
          agent: 'writer',
          details: 'Report Generation',
        },
      ];

      setSteps(demoSteps);

      // Simulate Step Execution
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep >= demoSteps.length) {
          clearInterval(interval);
          setIsAnalysisComplete(true);

          // Switch to results tab only after a delay so user sees completion
          setTimeout(() => {
            setActiveTab('results');
            setMessages([
              {
                role: 'bot',
                content:
                  "Analysis complete. I've found 2 compliance issues and verified 14 mandatory clauses. The proposal has a 92% compliance score. You can view the full details in the report panel.",
              },
            ]);
          }, 1500);
          return;
        }

        setSteps((prev) =>
          prev.map((step, index) => {
            if (index === currentStep) return { ...step, status: 'running' };
            if (index === currentStep - 1) return { ...step, status: 'complete' };
            return step;
          })
        );

        // Mark previous step as complete when starting next
        if (currentStep > 0) {
          setSteps((prev) =>
            prev.map((step, index) => {
              if (index === currentStep - 1) return { ...step, status: 'complete' };
              return step;
            })
          );
        }

        currentStep++;
      }, 1500);

      return () => clearInterval(interval);
    } else if (activeProject) {
      // Reset for non-demo projects (if we had real logic)
      setSteps([]);
      setMessages([]);
      setIsAnalysisComplete(false);
    }
  }, [activeProject]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    // Simulate Network / AI Delay
    setTimeout(() => {
      const botMessage: Message = {
        role: 'bot',
        content:
          "I'm currently running in demo mode, but fully functional I would query the vector database for specific regulatory nuances related to your question.",
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsSending(false);
    }, 1000);
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'coordinator':
        return <Zap size={14} className="text-blue-500" />;
      case 'rag':
        return <SearchIcon size={14} className="text-purple-500" />; // Custom icon helper below
      case 'compliance':
        return <CheckCircle2 size={14} className="text-green-500" />;
      case 'writer':
        return <FileCheck size={14} className="text-orange-500" />;
      default:
        return <Bot size={14} className="text-gray-500" />;
    }
  };

  // Helper for SearchIcon since it might not be imported or standard
  const SearchIcon = ({ size, className }: { size: number; className: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Search"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
        <div className="max-w-3xl mx-auto w-full space-y-8">
          {!activeProject && (
            <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-blue-50 w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center text-blue-600 shadow-sm">
                <Sparkles size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                AI Regulatory Assistant
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                I can analyze proposals against FAR/DFARS requirements using a multi-agent mesh
                architecture.
              </p>

              <div className="flex justify-center max-w-2xl mx-auto text-left">
                <button
                  type="button"
                  onClick={startDemo}
                  className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all group bg-white"
                >
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-base">Run Analysis Demo</div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      Visualize the Multi-Agent workflow checking FAR/DFARS compliance.
                    </p>
                  </div>
                </button>


              </div>
            </div>
          )}

          {activeProject && (
            <div className="flex flex-col h-full">
              <div className="flex border-b border-gray-200 mb-6 bg-white sticky top-0 z-10 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('steps')}
                  className={`pb-3 px-1 text-sm font-medium mr-6 transition-colors border-b-2 ${activeTab === 'steps'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-slate-800'
                    }`}
                >
                  Live Analysis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'results'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-slate-800'
                    }`}
                >
                  Results & Chat
                </button>
              </div>

              {activeTab === 'steps' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex gap-3 p-4 rounded-xl border transition-all ${step.status === 'running' ? 'bg-blue-50/50 border-blue-100 shadow-sm' : 'bg-white border-gray-100'}`}
                    >
                      <div className="mt-1 shrink-0">
                        {step.status === 'complete' && (
                          <CheckCircle2 size={20} className="text-green-500" />
                        )}
                        {step.status === 'running' && (
                          <Loader2 size={20} className="text-blue-500 animate-spin" />
                        )}
                        {step.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getAgentIcon(step.agent || 'coordinator')}
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            {step.details}
                          </span>
                        </div>
                        <div
                          className={`text-sm font-medium ${step.status === 'pending' ? 'text-gray-400' : 'text-slate-700'}`}
                        >
                          {step.message}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAnalysisComplete && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-800 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-500">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <div className="font-semibold">Analysis Complete</div>
                        <div className="text-green-700">
                          All agents have reported their findings.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6 animate-in fade-in duration-300 pb-4">
                  {messages.map((message, index) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: Chat log is append-only
                      key={index}
                      className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 p-1">
                          <Bot size={18} className="text-indigo-600" />
                        </div>
                      )}

                      <div
                        className={`flex-1 max-w-xl ${message.role === 'user' ? 'flex justify-end' : ''
                          }`}
                      >
                        <div
                          className={`p-4 rounded-2xl text-slate-800 leading-relaxed text-sm shadow-sm ${message.role === 'bot'
                            ? 'bg-white border border-gray-100 rounded-tl-none'
                            : 'bg-blue-600 text-white rounded-br-none'
                            }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex gap-4 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 p-1">
                        <Bot size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none text-slate-800 leading-relaxed text-sm w-32 h-12 flex items-center">
                          <div className="flex gap-1">
                            <div
                              className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                              style={{ animationDelay: '0ms' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                              style={{ animationDelay: '150ms' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                              style={{ animationDelay: '300ms' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-4 border-t border-gray-200 shrink-0 z-20">
        <div className="max-w-3xl mx-auto w-full">
          <div className="relative group">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                activeProject ? 'Ask follow-up questions...' : 'Select a compliance check to start.'
              }
              className="w-full p-4 pr-14 text-sm resize-none bg-white min-h-[56px] shadow-sm border-gray-200 focus:border-blue-400 focus:ring-blue-100 rounded-xl transition-all"
              rows={1}
              disabled={!activeProject || isSending}
            />
            <div className="absolute bottom-3 right-3">
              <Button
                size="icon"
                className={`h-8 w-8 rounded-lg transition-all ${inputValue ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                disabled={!inputValue || isSending || !activeProject}
                onClick={handleSendMessage}
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-medium">
              AI can make mistakes. Review generated compliance reports.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentInterface;
