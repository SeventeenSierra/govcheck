
import type { Meta, StoryObj } from '@storybook/react';
import { UploadWorkflow } from './upload-workflow';

const meta: Meta<typeof UploadWorkflow> = {
  title: 'Upload/UploadWorkflow',
  component: UploadWorkflow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UploadWorkflow>;

export const Default: Story = {
  args: {},
};
