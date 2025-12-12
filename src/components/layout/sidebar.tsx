// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

'use client';

import { Button } from '@17sierra/ui';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';

type SidebarProps = {
  activeProject: string | null;
  setActiveProject: (id: string) => void;
  resetDemo: () => void;
  isOpen: boolean;
};

const Sidebar = ({ activeProject, setActiveProject, resetDemo, isOpen }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div
      data-testid="sidebar"
      className={`bg-slate-50 border-gray-200 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'w-72 border-r opacity-100' : 'w-0 border-r-0 opacity-0'
      }`}
    >
      <div className="w-72 flex flex-col h-full">
        <div className="p-4">
          <Button onClick={resetDemo} className="w-full text-sm">
            <Plus size={18} />
            New Compliance Check
          </Button>
        </div>

        <div className="px-4 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-slate-800'
              }`}
            >
              History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'favorites'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-slate-800'
              }`}
            >
              Saved Reports
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider whitespace-nowrap">
            Recent Checks
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveProject('proj-1')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveProject('proj-1');
              }
            }}
            className={`group cursor-pointer p-3 rounded-lg mb-2 text-sm transition-all w-full text-left ${
              activeProject
                ? 'bg-white border-primary/30 border shadow-sm ring-1 ring-primary/10'
                : 'hover:bg-gray-200/50 border border-transparent'
            }`}
          >
            <div className="font-medium text-slate-800 truncate">SaaS Proposal - DOE</div>
            <div className="text-xs text-gray-500 mt-1.5 flex justify-between items-center">
              <span>Today, 10:23 AM</span>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-6 w-6"
              >
                <MoreHorizontal size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
