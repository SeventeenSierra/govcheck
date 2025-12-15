/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@17sierra/ui';
import { TwoPanelLayout } from './two-panel-layout';

const meta: Meta<typeof TwoPanelLayout> = {
  title: 'Layout/TwoPanelLayout',
  component: TwoPanelLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A flexible two-panel layout with responsive behavior, smooth transitions, and optional resizing.',
      },
    },
  },
  argTypes: {
    isRightPanelVisible: {
      description: 'Whether the right panel is visible',
      control: { type: 'boolean' },
    },
    leftPanelSize: {
      description: 'Size of the left panel when right panel is visible',
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'full'],
    },
    rightPanelSize: {
      description: 'Size of the right panel when visible',
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'full'],
    },
    resizable: {
      description: 'Whether panels can be resized',
      control: { type: 'boolean' },
    },
    showDivider: {
      description: 'Whether to show divider between panels',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TwoPanelLayout>;

// Sample content components
const LeftPanelContent = ({ onToggle }: { onToggle: () => void }) => (
  <div className="p-6 h-full flex flex-col">
    <h2 className="text-xl font-semibold mb-4">Main Content</h2>
    <p className="text-gray-600 mb-4">
      This is the main content area. It can contain any React components.
    </p>
    <Button onClick={onToggle} className="mb-4">
      Toggle Right Panel
    </Button>
    <div className="flex-1 bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-500">
        This area would typically contain your main application content, such as a chat interface,
        document editor, or data visualization.
      </p>
    </div>
  </div>
);

const RightPanelContent = () => (
  <div className="p-6 h-full">
    <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
      <h3 className="text-lg font-semibold mb-3">Side Panel</h3>
      <p className="text-gray-600 mb-4">
        This is the right panel content. It could be a sidebar, preview pane, or additional tools.
      </p>
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-medium text-blue-900">Information</h4>
          <p className="text-sm text-blue-700">Some contextual information here.</p>
        </div>
        <div className="p-3 bg-green-50 rounded border border-green-200">
          <h4 className="font-medium text-green-900">Status</h4>
          <p className="text-sm text-green-700">Current status information.</p>
        </div>
      </div>
    </div>
  </div>
);

// Wrapper component to handle state
const TwoPanelWrapper = (args: any) => {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(args.isRightPanelVisible ?? false);

  return (
    <div className="h-screen">
      <TwoPanelLayout
        {...args}
        isRightPanelVisible={isRightPanelVisible}
        leftPanel={
          <LeftPanelContent onToggle={() => setIsRightPanelVisible(!isRightPanelVisible)} />
        }
        rightPanel={<RightPanelContent />}
        onPanelVisibilityChange={setIsRightPanelVisible}
      />
    </div>
  );
};

export const Default: Story = {
  render: TwoPanelWrapper,
  args: {
    isRightPanelVisible: false,
  },
};

export const WithRightPanel: Story = {
  render: TwoPanelWrapper,
  args: {
    isRightPanelVisible: true,
  },
};

export const SmallLeftPanel: Story = {
  render: TwoPanelWrapper,
  args: {
    isRightPanelVisible: true,
    leftPanelSize: 'small',
  },
};

export const LargeLeftPanel: Story = {
  render: TwoPanelWrapper,
  args: {
    isRightPanelVisible: true,
    leftPanelSize: 'large',
  },
};

export const Resizable: Story = {
  render: TwoPanelWrapper,
  args: {
    isRightPanelVisible: true,
    resizable: true,
    minPanelWidth: 250,
  },
};

export const NoDivider: Story = {
  render: TwoPanelWrapper,
  args: {
    isRightPanelVisible: true,
    showDivider: false,
  },
};

export const FastTransition: Story = {
  render: TwoPanelWrapper,
  args: {
    isRightPanelVisible: true,
    transition: { duration: 200, easing: 'ease-out' },
  },
};
