/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React from 'react';
import { Button } from '@17sierra/ui';
import { Settings, User, HelpCircle } from '@17sierra/ui';

/**
 * Application mode types
 */
export type AppMode = 'agent' | 'proposals' | 'reports' | 'settings';

/**
 * Header action button configuration
 */
export interface HeaderAction {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the action */
  label: string;
  /** Icon component to display */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Click handler for the action */
  onClick: () => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * App Header Component Props
 */
export interface AppHeaderProps {
  /** Current application mode */
  mode?: AppMode;
  /** Main title text */
  title?: string;
  /** Subtitle or status text */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the mode badge */
  showModeBadge?: boolean;
  /** Custom logo component */
  logo?: React.ReactNode;
  /** Array of action buttons to display */
  actions?: HeaderAction[];
  /** Whether to show default actions (settings, help, user) */
  showDefaultActions?: boolean;
  /** Callback when mode badge is clicked */
  onModeClick?: (mode: AppMode) => void;
  /** Whether the header should be sticky */
  sticky?: boolean;
}

/**
 * App Header Component
 *
 * A comprehensive application header with branding, mode indicators,
 * status information, and customizable actions. Supports sticky positioning
 * and responsive design.
 *
 * @example
 * ```tsx
 * <AppHeader
 *   mode="agent"
 *   title="Proposal Prepper"
 *   subtitle="Analysis in progress..."
 *   actions={[
 *     { id: 'export', label: 'Export', icon: Download, onClick: handleExport }
 *   ]}
 *   onModeClick={handleModeSwitch}
 * />
 * ```
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  mode = 'proposals',
  title = 'Proposal Prepper',
  subtitle,
  className = '',
  showModeBadge = true,
  logo,
  actions = [],
  showDefaultActions = true,
  onModeClick,
  sticky = false,
}) => {
  const defaultActions: HeaderAction[] = [
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      onClick: () => console.log('Help clicked'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => console.log('Settings clicked'),
    },
    {
      id: 'user',
      label: 'User Menu',
      icon: User,
      onClick: () => console.log('User menu clicked'),
    },
  ];

  const allActions = showDefaultActions ? [...actions, ...defaultActions] : actions;

  const getModeColor = (currentMode: AppMode) => {
    switch (currentMode) {
      case 'agent':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'proposals':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'reports':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'settings':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const handleModeClick = () => {
    if (onModeClick) {
      onModeClick(mode);
    }
  };

  return (
    <header
      className={`bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between shadow-sm ${
        sticky ? 'sticky top-0 z-50' : ''
      } ${className}`}
    >
      {/* Left side - Logo and title */}
      <div className="flex items-center gap-3 text-slate-800 font-semibold text-lg">
        {logo || (
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        <span className="truncate">{title}</span>

        {showModeBadge && (
          <button
            onClick={handleModeClick}
            className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider transition-colors hover:opacity-80 ${getModeColor(mode)}`}
            title={`Current mode: ${mode}. Click to switch modes.`}
          >
            {mode}
          </button>
        )}
      </div>

      {/* Center - Subtitle */}
      {subtitle && (
        <div className="hidden md:block text-sm text-gray-500 truncate max-w-md">{subtitle}</div>
      )}

      {/* Right side - Actions */}
      {allActions.length > 0 && (
        <div className="flex items-center gap-2">
          {allActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`h-8 w-8 p-0 ${action.className || ''}`}
              title={action.label}
            >
              {action.icon && <action.icon size={16} />}
            </Button>
          ))}
        </div>
      )}
    </header>
  );
};
