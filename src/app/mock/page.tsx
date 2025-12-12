// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

'use client';

import { useEffect, useState } from 'react';
import AgentInterface from '@/components/agent-interface';
import Sidebar from '@/components/layout/sidebar';
import TopBar from '@/components/layout/top-bar';
import ReportPreview from '@/components/report-preview';

export default function MockApp() {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Demo Trigger
  const startDemo = () => {
    setActiveProject('demo-running');
    // Report appears after animation finishes (approx 5 steps * 1.5s = 7.5s, cutting short for UX)
    setTimeout(() => {
      setShowReport(true);
    }, 7500);
  };

  const resetDemo = () => {
    setActiveProject(null);
    setShowReport(false);
    if (!isSidebarOpen) {
      setSidebarOpen(true);
    }
  };

  useEffect(() => {
    if (activeProject) {
      setShowReport(false);
      if (activeProject !== 'demo-running') {
        setTimeout(() => {
          setShowReport(true);
        }, 500);
      }
    }
  }, [activeProject]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-body text-slate-800 overflow-hidden">
      <TopBar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <Sidebar
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          resetDemo={resetDemo}
          isOpen={isSidebarOpen}
        />

        <main className="flex-1 flex relative bg-white shadow-inner-xl m-0 md:my-2 md:mr-2 md:rounded-lg overflow-hidden border-t md:border border-gray-200/80 transition-all duration-300">
          <AgentInterface activeProject={activeProject} startDemo={startDemo} />
          <ReportPreview isVisible={showReport} />
        </main>
      </div>
    </div>
  );
}
