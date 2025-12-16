/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import React from 'react';
import { Button, Textarea } from '@17sierra/ui';
import { ChevronRight, Loader2 } from '@17sierra/ui';

/**
 * Chat Input Component Props
 */
export interface ChatInputProps {
  /** Current input value */
  value: string;
  /** Callback when input value changes */
  onChange: (value: string) => void;
  /** Callback when user submits input (Enter key or button click) */
  onSubmit?: (value: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is in a loading state */
  loading?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
  /** Maximum number of characters allowed */
  maxLength?: number;
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Whether to auto-focus the input on mount */
  autoFocus?: boolean;
  /** Custom submit button text (defaults to icon) */
  submitButtonText?: string;
  /** Whether to allow multiline input */
  multiline?: boolean;
  /** Maximum number of rows for multiline input */
  maxRows?: number;
}

/**
 * Chat Input Component
 *
 * A sophisticated chat input component with support for multiline text,
 * character counting, loading states, and keyboard shortcuts.
 * Designed for conversational interfaces and AI chat applications.
 *
 * @example
 * ```tsx
 * <ChatInput
 *   value={message}
 *   onChange={setMessage}
 *   onSubmit={handleSendMessage}
 *   placeholder="Type your message..."
 *   maxLength={500}
 *   showCharacterCount={true}
 *   loading={isProcessing}
 * />
 * ```
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Ask follow-up questions...',
  disabled = false,
  loading = false,
  className = '',
  maxLength,
  showCharacterCount = false,
  autoFocus = false,
  submitButtonText,
  multiline = true,
  maxRows = 4,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = React.useState(1);

  const handleSubmit = React.useCallback(() => {
    const trimmedValue = value.trim();
    if (trimmedValue && onSubmit && !disabled && !loading) {
      onSubmit(trimmedValue);
      onChange('');
      setRows(1);
    }
  }, [value, onSubmit, onChange, disabled, loading]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') {
        if (multiline && e.shiftKey) {
          // Allow new line with Shift+Enter
          return;
        } else {
          // Submit with Enter
          e.preventDefault();
          handleSubmit();
        }
      }
    },
    [handleSubmit, multiline]
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Apply max length if specified
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      onChange(newValue);

      // Auto-resize textarea
      if (multiline && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = 20; // Approximate line height
        const newRows = Math.min(Math.max(1, Math.ceil(scrollHeight / lineHeight)), maxRows);
        setRows(newRows);
      }
    },
    [onChange, maxLength, multiline, maxRows]
  );

  // Auto-focus on mount if requested
  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const isSubmitDisabled = !value.trim() || disabled || loading;
  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm p-4 border-t border-gray-200 ${className}`}
    >
      <div className="max-w-3xl mx-auto w-full">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            className={`w-full p-3 pr-12 text-sm resize-none bg-white shadow-sm transition-all duration-200 ${
              multiline ? 'min-h-[50px]' : 'h-[50px]'
            }`}
            rows={multiline ? rows : 1}
            style={{
              height: multiline ? `${Math.max(50, rows * 20 + 16)}px` : '50px',
            }}
          />

          {/* Character count */}
          {showCharacterCount && maxLength && (
            <div
              className={`absolute bottom-1 left-3 text-xs transition-colors ${
                isNearLimit ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              {characterCount}/{maxLength}
            </div>
          )}

          {/* Submit button */}
          <div className="absolute bottom-2.5 right-2.5">
            <Button
              size="icon"
              className="h-8 w-8"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
              title={multiline ? 'Send message (Enter)' : 'Send message'}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : submitButtonText ? (
                <span className="text-xs">{submitButtonText}</span>
              ) : (
                <ChevronRight size={16} />
              )}
            </Button>
          </div>
        </div>

        {/* Help text */}
        {multiline && !disabled && (
          <div className="mt-1 text-xs text-gray-400 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        )}
      </div>
    </div>
  );
};
