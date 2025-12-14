/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Shared component types and interfaces
 */

/**
 * Common component props that most shared components should support
 */
export interface BaseComponentProps {
  /** Additional CSS classes to apply */
  className?: string;
  /** Unique identifier for the component */
  id?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Test identifier for automated testing */
  'data-testid'?: string;
}

/**
 * Props for components that can be in a loading state
 */
export interface LoadingProps {
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
}

/**
 * Props for components that handle errors
 */
export interface ErrorProps {
  /** Error message to display */
  error?: string;
  /** Error code for programmatic handling */
  errorCode?: string;
  /** Callback when error is dismissed */
  onErrorDismiss?: () => void;
}

/**
 * Props for components with validation
 */
export interface ValidationProps {
  /** Whether the component value is valid */
  isValid?: boolean;
  /** Validation error message */
  validationError?: string;
  /** Callback for validation */
  onValidate?: (value: any) => boolean | string;
}

/**
 * Props for components with accessibility features
 */
export interface AccessibilityProps {
  /** ARIA label for screen readers */
  'aria-label'?: string;
  /** ARIA description for screen readers */
  'aria-describedby'?: string;
  /** Whether the component is required */
  required?: boolean;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

/**
 * Combined props for comprehensive component interfaces
 */
export interface ComprehensiveComponentProps
  extends BaseComponentProps,
    LoadingProps,
    ErrorProps,
    ValidationProps,
    AccessibilityProps {}

/**
 * Animation and transition types
 */
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce' | 'none';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';
export type AnimationDuration = 'fast' | 'normal' | 'slow' | number;

/**
 * Size variants commonly used across components
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants for theming
 */
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/**
 * Position types for floating components
 */
export type Position =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Event handler types
 */
export type ClickHandler = (event: React.MouseEvent) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;
