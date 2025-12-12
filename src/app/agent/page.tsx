/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React from 'react';
import { AgentInterface } from '@/components/agent';
import { ReportPreview } from '@/components/reports';

/**
 * Agent page - AI-powered proposal compliance interface
 * 
 * This page provides the agent-driven interface for:
 * 1. Interactive compliance analysis
 * 2. Step-by-step analysis tracking
 * 3. AI-powered recommendations
 * 4. Report preview and generation
 */
export default function AgentPage() {
  const [activeProject, setActiveProject] = React.useState<string | null>(null);

  const startDemo = () => {
    setActiveProject('demo-running');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Proposal Prepper
          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/20 uppercase font-bold tracking-wider">
            Agent
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <AgentInterface 
          activeProject={activeProject} 
          startDemo={startDemo}
        />
        <ReportPreview isVisible={activeProject === 'demo-running'} />
      </div>
    </div>
  );
}