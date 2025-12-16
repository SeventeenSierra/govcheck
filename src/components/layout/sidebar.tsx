'use client';

import { ChevronRight, Clock, FileText, History, MoreHorizontal, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@17sierra/ui';

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
      className={`bg-slate-50 border-gray-200 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden shadow-inner ${isOpen ? 'w-[280px] border-r opacity-100' : 'w-0 border-r-0 opacity-0'
        }`}
    >
      <div className="w-[280px] flex flex-col h-full">
        <div className="p-4 pt-5 pb-2">
          <Button
            onClick={resetDemo}
            className="w-full text-sm font-medium shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors h-10 gap-2"
          >
            <Plus size={16} strokeWidth={2.5} />
            New Compliance Check
          </Button>
        </div>

        <div className="px-2 mt-2">
          <div className="flex p-1 bg-gray-200/50 rounded-lg mx-2 mb-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-gray-500 hover:text-slate-700 hover:bg-gray-200/50'
                }`}
            >
              <History size={12} /> Recent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'favorites'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-gray-500 hover:text-slate-700 hover:bg-gray-200/50'
                }`}
            >
              <Star size={12} /> Saved
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <div className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
            <Clock size={10} /> Today
          </div>

          {/* biome-ignore lint/a11y/useSemanticElements: Button nesting prevents using <button> tag */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveProject('proj-1')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveProject('proj-1');
              }
            }}
            className={`w-full text-left p-3 rounded-xl border transition-all relative cursor-pointer ${activeProject === 'proj-1'
              ? 'bg-blue-50/50 border-blue-200 shadow-sm'
              : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-md ${activeProject === 'proj-1' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500'} transition-colors`}
              >
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-sm truncate ${activeProject ? 'text-blue-700' : 'text-slate-700'}`}
                >
                  SaaS Proposal - DOE
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex justify-between items-center font-medium">
                  <span>10:23 AM</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    92% <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal size={14} className="text-gray-400" />
            </Button>

            {activeProject && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white rounded-full border border-blue-200 p-0.5 text-blue-600 shadow-sm z-10 w-5 h-5 flex items-center justify-center">
                <ChevronRight size={12} />
              </div>
            )}
          </div>
        </div>

        {/* User Profile / Config Section at bottom */}
        <div className="p-3 border-t border-gray-200 bg-slate-50">
          <div className="text-[10px] text-center text-gray-300 font-mono">v2.1.0-mesh</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
