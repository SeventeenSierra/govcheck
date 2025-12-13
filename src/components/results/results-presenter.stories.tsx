
import type { Meta, StoryObj } from '@storybook/react';
import { ResultsPresenter } from './results-presenter';
import { generateMockAnalysisResults } from '@/seed-data/grants';

const meta: Meta<typeof ResultsPresenter> = {
  title: 'Results/ResultsPresenter',
  component: ResultsPresenter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResultsPresenter>;

const mockResults = generateMockAnalysisResults('pass');

export const Passing: Story = {
  args: {
    results: mockResults,
  },
};

export const Failing: Story = {
  args: {
    results: generateMockAnalysisResults('fail'),
  },
};
