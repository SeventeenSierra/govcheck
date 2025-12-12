/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Download, Share, Star } from 'lucide-react';
import { AppHeader } from './app-header';

const meta: Meta<typeof AppHeader> = {
  title: 'Layout/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive application header with branding, mode indicators, and customizable actions.',
      },
    },
  },
  argTypes: {
    mode: {
      description: 'Current application mode',
      control: { type: 'select' },
      options: ['agent', 'proposals', 'reports', 'settings'],
    },
    title: {
      description: 'Main title text',
      control: { type: 'text' },
    },
    subtitle: {
      description: 'Subtitle or status text',
      control: { type: 'text' },
    },
    showModeBadge: {
      description: 'Whether to show the mode badge',
      control: { type: 'boolean' },
    },
    showDefaultActions: {
      description: 'Whether to show default action buttons',
      control: { type: 'boolean' },
    },
    sticky: {
      description: 'Whether the header should be sticky',
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
  args: {
    mode: 'proposals',
    title: 'Proposal Prepper',
  },
};

export const AgentMode: Story = {
  args: {
    mode: 'agent',
    title: 'Proposal Prepper',
    subtitle: 'AI-powered compliance analysis',
  },
};

export const WithSubtitle: Story = {
  args: {
    mode: 'proposals',
    title: 'Proposal Prepper',
    subtitle: 'Analysis in progress...',
  },
};

export const ReportsMode: Story = {
  args: {
    mode: 'reports',
    title: 'Proposal Prepper',
    subtitle: 'Compliance Report #2024-001',
  },
};

export const WithCustomActions: Story = {
  args: {
    mode: 'proposals',
    title: 'Proposal Prepper',
    subtitle: 'Ready to export results',
    actions: [
      {
        id: 'star',
        label: 'Favorite',
        icon: Star,
        onClick: () => alert('Favorited!'),
      },
      {
        id: 'share',
        label: 'Share',
        icon: Share,
        onClick: () => alert('Shared!'),
      },
      {
        id: 'download',
        label: 'Download',
        icon: Download,
        onClick: () => alert('Downloaded!'),
      },
    ],
  },
};

export const NoModeBadge: Story = {
  args: {
    mode: 'proposals',
    title: 'Proposal Prepper',
    showModeBadge: false,
  },
};

export const NoDefaultActions: Story = {
  args: {
    mode: 'proposals',
    title: 'Proposal Prepper',
    showDefaultActions: false,
  },
};

export const Sticky: Story = {
  render: (args) => (
    <div className="h-screen overflow-auto">
      <AppHeader {...args} />
      <div className="p-6 space-y-4">
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Content Block {i + 1}</h3>
            <p className="text-gray-600">
              This is some sample content to demonstrate the sticky header behavior.
              Scroll down to see the header stick to the top of the viewport.
            </p>
          </div>
        ))}
      </div>
    </div>
  ),
  args: {
    mode: 'proposals',
    title: 'Proposal Prepper',
    subtitle: 'Sticky header demo',
    sticky: true,
  },
};

export const LongTitle: Story = {
  args: {
    mode: 'proposals',
    title: 'Very Long Application Title That Might Overflow',
    subtitle: 'This is also a very long subtitle that demonstrates text truncation behavior',
  },
};