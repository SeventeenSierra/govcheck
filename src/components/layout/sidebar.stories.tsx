// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from './sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'App/Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    activeProject: { control: 'text' },
    isOpen: { control: 'boolean' },
    setActiveProject: { action: 'setActiveProject' },
    resetDemo: { action: 'resetDemo' },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Open: Story = {
  args: {
    isOpen: true,
    activeProject: null,
    setActiveProject: () => {},
    resetDemo: () => {},
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    activeProject: null,
    setActiveProject: () => {},
    resetDemo: () => {},
  },
};

export const WithActiveProject: Story = {
  args: {
    isOpen: true,
    activeProject: 'proj-1',
    setActiveProject: () => {},
    resetDemo: () => {},
  },
};
