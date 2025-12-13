
import type { Meta, StoryObj } from '@storybook/react';
import { RFPInterface } from './rfp-interface';

const meta: Meta<typeof RFPInterface> = {
  title: 'RFP/RFPInterface',
  component: RFPInterface,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RFPInterface>;

export const Default: Story = {
  args: {},
};
