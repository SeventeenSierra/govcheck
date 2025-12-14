/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Agent Interface Types
 *
 * Type definitions for AI agent components and interactions.
 */

/**
 * Analysis step status for agent interface
 */
export type AgentAnalysisStepStatus = 'pending' | 'loading' | 'complete' | 'error';

/**
 * Individual analysis step in agent workflow
 */
export interface AgentAnalysisStep {
  /** Unique step identifier */
  id: number;
  /** Display title for the step */
  title: string;
  /** Detailed description of the step */
  description: string;
  /** Current status of the step */
  status: AgentAnalysisStepStatus;
  /** Optional error message if step failed */
  error?: string;
  /** Timestamp when step started */
  startedAt?: Date;
  /** Timestamp when step completed */
  completedAt?: Date;
}

/**
 * Agent interface component props
 */
export interface AgentInterfaceProps {
  /** Current active project ID */
  activeProject: string | null;
  /** Callback to start demo analysis */
  startDemo: () => void;
  /** Callback when analysis completes */
  onAnalysisComplete?: (results: any) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Agent chat message types
 */
export interface AgentChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message type */
  type: 'user' | 'assistant' | 'system';
  /** Message content */
  content: string;
  /** Message timestamp */
  timestamp: Date;
  /** Optional metadata */
  metadata?: {
    /** Associated analysis step */
    stepId?: number;
    /** Message confidence score */
    confidence?: number;
    /** Source of the information */
    source?: string;
  };
}

/**
 * Agent state management
 */
export interface AgentState {
  /** Current workflow phase */
  phase: 'idle' | 'analyzing' | 'complete' | 'error';
  /** Analysis steps */
  steps: AgentAnalysisStep[];
  /** Chat message history */
  messages: AgentChatMessage[];
  /** Current input value */
  inputValue: string;
  /** Whether agent is processing */
  isProcessing: boolean;
}

/**
 * Agent capabilities and features
 */
export interface AgentCapabilities {
  /** Supported analysis types */
  analysisTypes: string[];
  /** Available chat commands */
  chatCommands: string[];
  /** Supported file formats */
  supportedFormats: string[];
  /** Maximum file size in bytes */
  maxFileSize: number;
}
