/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React from 'react';

/**
 * Panel size configuration
 */
export type PanelSize = 'small' | 'medium' | 'large' | 'full';

/**
 * Panel transition configuration
 */
export interface PanelTransition {
  /** Duration of the transition in milliseconds */
  duration?: number;
  /** Easing function for the transition */
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Two Panel Layout Component Props
 */
export interface TwoPanelLayoutProps {
  /** Content for the left panel */
  leftPanel: React.ReactNode;
  /** Content for the right panel (optional) */
  rightPanel?: React.ReactNode;
  /** Whether the right panel should be visible */
  isRightPanelVisible?: boolean;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Size of the left panel when right panel is visible */
  leftPanelSize?: PanelSize;
  /** Size of the right panel when visible */
  rightPanelSize?: PanelSize;
  /** Transition configuration */
  transition?: PanelTransition;
  /** Whether panels should be resizable */
  resizable?: boolean;
  /** Minimum width for panels in pixels */
  minPanelWidth?: number;
  /** Callback when panel visibility changes */
  onPanelVisibilityChange?: (isVisible: boolean) => void;
  /** Whether to show a divider between panels */
  showDivider?: boolean;
  /** Custom divider component */
  divider?: React.ReactNode;
}

/**
 * Two Panel Layout Component
 *
 * A flexible two-panel layout with responsive behavior, smooth transitions,
 * and optional resizing capabilities. Commonly used for main content + sidebar
 * or chat + preview layouts.
 *
 * @example
 * ```tsx
 * <TwoPanelLayout
 *   leftPanel={<ChatInterface />}
 *   rightPanel={<ReportPreview />}
 *   isRightPanelVisible={showReport}
 *   leftPanelSize="medium"
 *   resizable={true}
 *   onPanelVisibilityChange={setShowReport}
 * />
 * ```
 */
export const TwoPanelLayout: React.FC<TwoPanelLayoutProps> = ({
  leftPanel,
  rightPanel,
  isRightPanelVisible = false,
  className = '',
  leftPanelSize = 'medium',
  rightPanelSize = 'medium',
  transition = { duration: 500, easing: 'ease-in-out' },
  resizable = false,
  minPanelWidth = 300,
  onPanelVisibilityChange,
  showDivider = true,
  divider
}) => {
  const [leftWidth, setLeftWidth] = React.useState<number | null>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Panel size mappings
  const getSizeClass = (size: PanelSize, isVisible: boolean) => {
    if (!isVisible) return 'w-full';
    
    switch (size) {
      case 'small':
        return 'w-full md:w-1/3';
      case 'medium':
        return 'w-full md:w-1/2';
      case 'large':
        return 'w-full md:w-2/3';
      case 'full':
        return 'w-full';
      default:
        return 'w-full md:w-1/2';
    }
  };

  // Handle panel visibility changes
  React.useEffect(() => {
    if (onPanelVisibilityChange) {
      onPanelVisibilityChange(isRightPanelVisible);
    }
  }, [isRightPanelVisible, onPanelVisibilityChange]);

  // Resizing logic
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (!resizable || !containerRef.current) return;
    
    setIsResizing(true);
    const startX = e.clientX;
    const containerRect = containerRef.current.getBoundingClientRect();
    const startLeftWidth = leftWidth || containerRect.width / 2;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - startX;
      const newLeftWidth = Math.max(
        minPanelWidth,
        Math.min(containerRect.width - minPanelWidth, startLeftWidth + deltaX)
      );
      
      setLeftWidth(newLeftWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [resizable, leftWidth, minPanelWidth]);

  const transitionStyle = {
    transitionDuration: `${transition.duration}ms`,
    transitionTimingFunction: transition.easing,
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-1 overflow-hidden ${className}`}
    >
      {/* Left Panel */}
      <div
        className={`bg-white flex flex-col h-full relative transition-all ${
          isRightPanelVisible 
            ? getSizeClass(leftPanelSize, true)
            : 'w-full'
        } ${showDivider && isRightPanelVisible ? 'border-r border-gray-200' : ''}`}
        style={{
          ...(leftWidth && isRightPanelVisible ? { width: `${leftWidth}px` } : {}),
          ...transitionStyle,
        }}
      >
        {leftPanel}
      </div>
      
      {/* Resizer */}
      {resizable && isRightPanelVisible && rightPanel && (
        <div
          className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize transition-colors ${
            isResizing ? 'bg-primary' : ''
          }`}
          onMouseDown={handleMouseDown}
          title="Drag to resize panels"
        />
      )}
      
      {/* Right Panel */}
      {isRightPanelVisible && rightPanel && (
        <div 
          className={`bg-gray-50 h-full flex flex-col animate-in slide-in-from-right duration-300 ${
            getSizeClass(rightPanelSize, true)
          } ${showDivider ? 'border-l border-gray-200' : ''}`}
          style={{
            ...(leftWidth ? { width: `calc(100% - ${leftWidth}px)` } : {}),
            ...transitionStyle,
          }}
        >
          {divider && <div className="border-b border-gray-200">{divider}</div>}
          {rightPanel}
        </div>
      )}
    </div>
  );
};