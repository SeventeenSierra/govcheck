
import type { Meta, StoryObj } from '@storybook/react';
import { AnalysisCoordinator } from './analysis-coordinator';
import { generateMockUploadSession } from '@/seed-data/grants';

const meta: Meta<typeof AnalysisCoordinator> = {
  title: 'Analysis/AnalysisCoordinator',
  component: AnalysisCoordinator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnalysisCoordinator>;

const mockUploadSession = generateMockUploadSession();

export const Default: Story = {
  args: {
    uploadSession: mockUploadSession,
  },
};
