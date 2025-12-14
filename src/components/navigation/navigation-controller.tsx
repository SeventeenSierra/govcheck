/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { Button } from '@17sierra/ui';
import { ChevronLeft, ChevronRight, Home } from '@17sierra/ui';
import type React from 'react';
import { useCallback, useMemo } from 'react';

/**
 * Navigation step definition
 */
export interface NavigationStep {
  id: string;
  label: string;
  description?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
}

/**
 * Navigation Controller Props
 */
export interface NavigationControllerProps {
  /** Current navigation steps */
  steps: NavigationStep[];
  /** Callback when user navigates to a step */
  onNavigateToStep?: (stepId: string) => void;
  /** Callback when user wants to start over */
  onStartOver?: () => void;
  /** Whether navigation is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation Controller Component
 *
 * Provides comprehensive navigation and routing functionality:
 * - Application routing between workflow steps (Requirement 4.2)
 * - Breadcrumb navigation with visual indicators
 * - Context-aware navigation based on step accessibility
 * - Progress tracking and visual feedback
 */
export function NavigationController({
  steps,
  onNavigateToStep,
  onStartOver,
  disabled = false,
  className = '',
}: NavigationControllerProps): React.JSX.Element {
  /**
   * Get current step index
   */
  const currentStepIndex = useMemo(() => {
    return steps.findIndex((step) => step.isCurrent);
  }, [steps]);

  /**
   * Get navigation state
   */
  const navigationState = useMemo(() => {
    const currentStep = steps[currentStepIndex];
    const previousStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
    const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

    return {
      currentStep,
      previousStep,
      nextStep,
      canGoBack: previousStep?.isAccessible ?? false,
      canGoForward: nextStep?.isAccessible ?? false,
      progress: ((currentStepIndex + 1) / steps.length) * 100,
    };
  }, [steps, currentStepIndex]);

  /**
   * Handle step navigation
   */
  const handleStepNavigation = useCallback(
    (stepId: string) => {
      if (disabled) return;

      const step = steps.find((s) => s.id === stepId);
      if (step?.isAccessible) {
        onNavigateToStep?.(stepId);
      }
    },
    [disabled, steps, onNavigateToStep]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent, stepId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStepNavigation(stepId);
      }
    },
    [handleStepNavigation]
  );

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (navigationState.previousStep && navigationState.canGoBack) {
      handleStepNavigation(navigationState.previousStep.id);
    }
  }, [navigationState, handleStepNavigation]);

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(() => {
    if (navigationState.nextStep && navigationState.canGoForward) {
      handleStepNavigation(navigationState.nextStep.id);
    }
  }, [navigationState, handleStepNavigation]);

  /**
   * Get step status indicator
   */
  const getStepStatusIndicator = useCallback(
    (step: NavigationStep) => {
      if (step.isCompleted) {
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <title>Completed</title>
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      }

      if (step.isCurrent) {
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <span className="text-sm font-medium">{steps.indexOf(step) + 1}</span>
          </div>
        );
      }

      return (
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
            step.isAccessible
              ? 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
              : 'border-gray-200 bg-gray-100 text-gray-400'
          }`}
        >
          <span className="text-sm font-medium">{steps.indexOf(step) + 1}</span>
        </div>
      );
    },
    [steps]
  );

  return (
    <div className={`navigation-controller ${className}`}>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(navigationState.progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${navigationState.progress}%` }}
          />
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Progress" className="mb-6">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className={stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleStepNavigation(step.id)}
                  onKeyDown={(e) => handleKeyNavigation(e, step.id)}
                  disabled={disabled || !step.isAccessible}
                  className={`group flex items-center ${
                    step.isAccessible && !disabled
                      ? 'cursor-pointer hover:text-blue-600'
                      : 'cursor-not-allowed'
                  }`}
                  aria-current={step.isCurrent ? 'step' : undefined}
                >
                  {getStepStatusIndicator(step)}
                  <div className="ml-4 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        step.isCurrent
                          ? 'text-blue-600'
                          : step.isCompleted
                            ? 'text-gray-900'
                            : step.isAccessible
                              ? 'text-gray-500 group-hover:text-gray-900'
                              : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-xs text-gray-500">{step.description}</p>
                    )}
                  </div>
                </button>

                {/* Connector Line */}
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                    aria-hidden="true"
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousStep}
            disabled={disabled || !navigationState.canGoBack}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextStep}
            disabled={disabled || !navigationState.canGoForward}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onStartOver} disabled={disabled}>
          <Home className="h-4 w-4 mr-1" />
          Start Over
        </Button>
      </div>

      {/* Current Step Info */}
      {navigationState.currentStep && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900">
            Current Step: {navigationState.currentStep.label}
          </h3>
          {navigationState.currentStep.description && (
            <p className="text-sm text-blue-700 mt-1">{navigationState.currentStep.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
