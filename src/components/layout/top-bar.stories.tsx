// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import type { Meta, StoryObj } from '@storybook/react';
import TopBar from './top-bar';

const meta: Meta<typeof TopBar> = {
  title: 'App/Layout/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isSidebarOpen: { control: 'boolean' },
    toggleSidebar: { action: 'toggleSidebar' },
  },
};

export default meta;
type Story = StoryObj<typeof TopBar>;

export const Default: Story = {
  args: {
    isSidebarOpen: true,
    toggleSidebar: () => {},
  },
};

export const SidebarClosed: Story = {
  args: {
    isSidebarOpen: false,
    toggleSidebar: () => {},
  },
};
