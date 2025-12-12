/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Analysis step status enumeration
 */
export type AnalysisStepStatus = 'pending' | 'loading' | 'complete' | 'error';

/**
 * Individual analysis step data structure
 */
export interface AnalysisStep {
  /** Unique identifier for the step */
  id: number;
  /** Display title for the step */
  title: string;
  /** Detailed description of what this step does */
  description: string;
  /** Current status of the step */
  status: AnalysisStepStatus;
  /** Optional error message if step failed */
  error?: string;
  /** Optional timestamp when step started */
  startedAt?: Date;
  /** Optional timestamp when step completed */
  completedAt?: Date;
  /** Optional estimated duration in milliseconds */
  estimatedDuration?: number;
}

/**
 * Analysis Steps Component Props
 */
export interface AnalysisStepsProps {
  /** Array of analysis steps to display */
  steps: AnalysisStep[];
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether to show completion message when all steps are done */
  showCompletionMessage?: boolean;
  /** Custom completion message */
  completionMessage?: string;
  /** Callback when a step status changes */
  onStepStatusChange?: (stepId: number, status: AnalysisStepStatus) => void;
  /** Whether to show step timing information */
  showTiming?: boolean;
}

/**
 * Analysis Steps Component
 *
 * Displays a list of analysis steps with visual status indicators.
 * Supports pending, loading, complete, and error states with
 * smooth animations and optional timing information.
 *
 * @example
 * ```tsx
 * const steps = [
 *   { id: 1, title: 'Upload', description: 'Uploading file...', status: 'complete' },
 *   { id: 2, title: 'Analysis', description: 'Analyzing content...', status: 'loading' }
 * ];
 * 
 * <AnalysisSteps 
 *   steps={steps} 
 *   showCompletionMessage={true}
 *   onStepStatusChange={(id, status) => console.log(`Step ${id}: ${status}`)}
 * />
 * ```
 */
export const AnalysisSteps: React.FC<AnalysisStepsProps> = ({ 
  steps, 
  className = '',
  showCompletionMessage = true,
  completionMessage = 'Analysis Complete. Report generated.',
  onStepStatusChange,
  showTiming = false
}) => {
  const isAnalysisComplete = steps.length > 0 && steps.every(step => step.status === 'complete');
  const hasErrors = steps.some(step => step.status === 'error');

  // Notify parent of status changes
  React.useEffect(() => {
    if (onStepStatusChange) {
      steps.forEach(step => {
        // This would be called when status actually changes in a real implementation
        // For now, we just ensure the callback is properly typed
      });
    }
  }, [steps, onStepStatusChange]);

  const getStepIcon = (step: AnalysisStep) => {
    switch (step.status) {
      case 'complete':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'loading':
        return <Loader2 size={18} className="text-primary animate-spin" />;
      case 'error':
        return (
          <div className="w-[18px] h-[18px] rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          </div>
        );
      case 'pending':
      default:
        return <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepTextColor = (step: AnalysisStep) => {
    switch (step.status) {
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-slate-800';
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className={`space-y-4 animate-in fade-in duration-300 ${className}`}>
      {steps.map((step) => (
        <div key={step.id} className="flex gap-3">
          <div className="mt-1 shrink-0">
            {getStepIcon(step)}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${getStepTextColor(step)}`}>
              {step.title}
              {showTiming && step.completedAt && step.startedAt && (
                <span className="ml-2 text-xs text-gray-400">
                  ({formatDuration(step.completedAt.getTime() - step.startedAt.getTime())})
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {step.status === 'error' && step.error ? step.error : step.description}
            </p>
          </div>
        </div>
      ))}
      
      {showCompletionMessage && isAnalysisComplete && !hasErrors && (
        <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle2 size={16} /> {completionMessage}
        </div>
      )}
      
      {hasErrors && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          Analysis encountered errors. Please review the failed steps above.
        </div>
      )}
    </div>
  );
};