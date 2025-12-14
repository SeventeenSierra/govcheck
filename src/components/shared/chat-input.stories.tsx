/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChatInput } from './chat-input';

const meta: Meta<typeof ChatInput> = {
  title: 'Shared/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A sophisticated chat input component with multiline support, character counting, and keyboard shortcuts.',
      },
    },
  },
  argTypes: {
    value: {
      description: 'Current input value',
      control: { type: 'text' },
    },
    placeholder: {
      description: 'Placeholder text',
      control: { type: 'text' },
    },
    disabled: {
      description: 'Whether the input is disabled',
      control: { type: 'boolean' },
    },
    loading: {
      description: 'Whether the input is in loading state',
      control: { type: 'boolean' },
    },
    maxLength: {
      description: 'Maximum character count',
      control: { type: 'number' },
    },
    showCharacterCount: {
      description: 'Whether to show character count',
      control: { type: 'boolean' },
    },
    multiline: {
      description: 'Whether to allow multiline input',
      control: { type: 'boolean' },
    },
    autoFocus: {
      description: 'Whether to auto-focus on mount',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

// Wrapper component to handle state
const ChatInputWrapper = (args: any) => {
  const [value, setValue] = useState(args.value || '');

  return (
    <div className="h-screen bg-gray-50 relative">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Chat Interface</h3>
        <p className="text-gray-600 mb-4">
          This is a demo of the chat input component. Try typing a message below.
        </p>
      </div>
      <ChatInput
        {...args}
        value={value}
        onChange={setValue}
        onSubmit={(message) => {
          console.log('Submitted:', message);
          alert(`Message submitted: "${message}"`);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: ChatInputWrapper,
  args: {
    placeholder: 'Type your message...',
  },
};

export const WithCharacterLimit: Story = {
  render: ChatInputWrapper,
  args: {
    placeholder: 'Type your message (max 100 characters)...',
    maxLength: 100,
    showCharacterCount: true,
  },
};

export const Loading: Story = {
  render: ChatInputWrapper,
  args: {
    placeholder: 'Processing your request...',
    loading: true,
    value: 'This message is being processed...',
  },
};

export const Disabled: Story = {
  render: ChatInputWrapper,
  args: {
    placeholder: 'Chat is currently disabled',
    disabled: true,
    value: 'This input is disabled',
  },
};

export const SingleLine: Story = {
  render: ChatInputWrapper,
  args: {
    placeholder: 'Single line input only...',
    multiline: false,
  },
};

export const WithAutoFocus: Story = {
  render: ChatInputWrapper,
  args: {
    placeholder: 'This input is auto-focused...',
    autoFocus: true,
  },
};

export const CustomSubmitButton: Story = {
  render: ChatInputWrapper,
  args: {
    placeholder: 'Type and click Send...',
    submitButtonText: 'Send',
  },
};
