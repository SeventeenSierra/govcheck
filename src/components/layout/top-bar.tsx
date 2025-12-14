// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

'use client';

import { Avatar, AvatarFallback, Button } from '@17sierra/ui';
import { Bot, PanelLeftClose, PanelLeftOpen, Settings } from '@17sierra/ui';

type TopBarProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

const TopBar = ({ toggleSidebar, isSidebarOpen }: TopBarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between shadow-sm z-20 relative">
      <div className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-slate-500 hover:text-primary"
          title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </Button>
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
          <Bot size={20} />
        </div>
        ATARC Agentic AI Lab
        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/20 uppercase font-bold tracking-wider">
          Demo
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
          <Settings size={20} />
        </Button>
        <Avatar className="h-8 w-8 text-xs">
          <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default TopBar;
