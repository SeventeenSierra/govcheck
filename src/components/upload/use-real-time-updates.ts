/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Real-time Updates Hook
 *
 * React hook for managing WebSocket connections and real-time progress updates
 * for the end-to-end workflow integration.
 */

import { useEffect, useRef, useState } from 'react';
// import { strandsApiClient, type WebSocketMessage } from '@/services/strands-api-client';
import type { WebSocketMessage } from '@/services/mock-analysis-service';
import type { UploadSession } from '@/types/app';

// Mock strandsApiClient for simulation
const strandsApiClient = {
  connectWebSocket: async () => { },
  disconnectWebSocket: () => { },
  isWebSocketConnected: () => false,
  subscribeToUploadProgress: (_cb: any) => { },
  subscribeToAnalysisProgress: (_cb: any) => { },
  subscribeToAnalysisComplete: (_cb: any) => { },
  subscribeToErrors: (_cb: any) => { }
};

export interface RealTimeUpdateState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
}

export interface UseRealTimeUpdatesOptions {
  /** Whether to automatically connect on mount */
  autoConnect?: boolean;
  /** Callback for upload progress updates */
  onUploadProgress?: (progress: WebSocketMessage, session?: UploadSession) => void;
  /** Callback for analysis progress updates */
  onAnalysisProgress?: (progress: WebSocketMessage, session?: UploadSession) => void;
  /** Callback for analysis completion */
  onAnalysisComplete?: (result: WebSocketMessage, session?: UploadSession) => void;
  /** Callback for error notifications */
  onError?: (error: WebSocketMessage, session?: UploadSession) => void;
  /** Current upload session for context */
  currentSession?: UploadSession | null;
}

/**
 * Hook for managing real-time updates via WebSocket
 */
export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    autoConnect = false,
    onUploadProgress,
    onAnalysisProgress,
    onAnalysisComplete,
    onError,
    currentSession,
  } = options;

  const [state, setState] = useState<RealTimeUpdateState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null,
  });

  // Use refs to avoid stale closures in WebSocket callbacks
  const callbacksRef = useRef({
    onUploadProgress,
    onAnalysisProgress,
    onAnalysisComplete,
    onError,
  });

  const currentSessionRef = useRef(currentSession);

  // Update refs when props change
  useEffect(() => {
    callbacksRef.current = {
      onUploadProgress,
      onAnalysisProgress,
      onAnalysisComplete,
      onError,
    };
  }, [onUploadProgress, onAnalysisProgress, onAnalysisComplete, onError]);

  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  // Connection management
  const connect = async (): Promise<boolean> => {
    if (state.connected || state.connecting) {
      return state.connected;
    }

    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      await strandsApiClient.connectWebSocket();

      // Set up message handlers
      strandsApiClient.subscribeToUploadProgress((message: WebSocketMessage) => {
        setState((prev) => ({ ...prev, lastMessage: message }));
        callbacksRef.current.onUploadProgress?.(message, currentSessionRef.current || undefined);
      });

      strandsApiClient.subscribeToAnalysisProgress((message: WebSocketMessage) => {
        setState((prev) => ({ ...prev, lastMessage: message }));
        callbacksRef.current.onAnalysisProgress?.(message, currentSessionRef.current || undefined);
      });

      strandsApiClient.subscribeToAnalysisComplete((message: WebSocketMessage) => {
        setState((prev) => ({ ...prev, lastMessage: message }));
        callbacksRef.current.onAnalysisComplete?.(message, currentSessionRef.current || undefined);
      });

      strandsApiClient.subscribeToErrors((message: WebSocketMessage) => {
        setState((prev) => ({ ...prev, lastMessage: message }));
        callbacksRef.current.onError?.(message, currentSessionRef.current || undefined);
      });

      setState((prev) => ({
        ...prev,
        connected: true,
        connecting: false,
        error: null,
      }));

      console.log('WebSocket connected successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'WebSocket connection failed';
      console.error('WebSocket connection failed:', errorMessage);

      setState((prev) => ({
        ...prev,
        connected: false,
        connecting: false,
        error: errorMessage,
      }));

      return false;
    }
  };

  const disconnect = () => {
    if (state.connected) {
      strandsApiClient.disconnectWebSocket();
      setState((prev) => ({
        ...prev,
        connected: false,
        connecting: false,
        error: null,
      }));
      console.log('WebSocket disconnected');
    }
  };

  const reconnect = async (): Promise<boolean> => {
    disconnect();
    // Brief delay before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return connect();
  };

  // Auto-connect on mount if requested
  // biome-ignore lint/correctness/useExhaustiveDependencies: connect/disconnect are external stable refs
  useEffect(() => {
    if (autoConnect) {
      connect().catch(console.error);
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Monitor connection status
  useEffect(() => {
    if (!state.connected) return;

    const checkConnection = () => {
      const isConnected = strandsApiClient.isWebSocketConnected();
      if (!isConnected && state.connected) {
        setState((prev) => ({
          ...prev,
          connected: false,
          error: 'Connection lost',
        }));
      }
    };

    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [state.connected]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    isConnected: state.connected && strandsApiClient.isWebSocketConnected(),
  };
}
