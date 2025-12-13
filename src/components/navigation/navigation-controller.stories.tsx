
import type { Meta, StoryObj } from '@storybook/react';
import { NavigationController } from './navigation-controller';

const meta: Meta<typeof NavigationController> = {
  title: 'Navigation/NavigationController',
  component: NavigationController,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavigationController>;

export const Default: Story = {
  args: {},
};
