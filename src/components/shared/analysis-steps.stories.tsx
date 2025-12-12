/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { Meta, StoryObj } from '@storybook/react';
import { AnalysisSteps, type AnalysisStep } from './analysis-steps';

const meta: Meta<typeof AnalysisSteps> = {
  title: 'Shared/AnalysisSteps',
  component: AnalysisSteps,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Displays a list of analysis steps with visual status indicators and smooth animations.',
      },
    },
  },
  argTypes: {
    steps: {
      description: 'Array of analysis steps to display',
      control: { type: 'object' },
    },
    showCompletionMessage: {
      description: 'Whether to show completion message when all steps are done',
      control: { type: 'boolean' },
    },
    showTiming: {
      description: 'Whether to show step timing information',
      control: { type: 'boolean' },
    },
    className: {
      description: 'Additional CSS classes',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnalysisSteps>;

const sampleSteps: AnalysisStep[] = [
  {
    id: 1,
    title: 'Document Upload',
    description: 'Uploading proposal document to secure analysis environment',
    status: 'complete',
    startedAt: new Date(Date.now() - 5000),
    completedAt: new Date(Date.now() - 4000),
  },
  {
    id: 2,
    title: 'Text Extraction',
    description: 'Extracting text and structured data from document',
    status: 'complete',
    startedAt: new Date(Date.now() - 4000),
    completedAt: new Date(Date.now() - 2000),
  },
  {
    id: 3,
    title: 'Regulatory Compliance Scan',
    description: 'Checking against FAR, DFARS, and solicitation requirements',
    status: 'loading',
    startedAt: new Date(Date.now() - 2000),
  },
  {
    id: 4,
    title: 'Budget Analysis',
    description: 'Validating budget justifications and cost realism',
    status: 'pending',
  },
  {
    id: 5,
    title: 'Final Validation',
    description: 'Generating compliance report and recommendations',
    status: 'pending',
  },
];

export const Default: Story = {
  args: {
    steps: sampleSteps,
  },
};

export const AllComplete: Story = {
  args: {
    steps: sampleSteps.map(step => ({ ...step, status: 'complete' as const })),
    showCompletionMessage: true,
  },
};

export const WithErrors: Story = {
  args: {
    steps: [
      ...sampleSteps.slice(0, 2).map(step => ({ ...step, status: 'complete' as const })),
      {
        ...sampleSteps[2],
        status: 'error' as const,
        error: 'Failed to connect to regulatory database. Please try again.',
      },
      ...sampleSteps.slice(3),
    ],
  },
};

export const WithTiming: Story = {
  args: {
    steps: sampleSteps.map(step => ({ 
      ...step, 
      status: 'complete' as const,
      startedAt: new Date(Date.now() - Math.random() * 10000),
      completedAt: new Date(Date.now() - Math.random() * 5000),
    })),
    showTiming: true,
  },
};

export const CustomCompletionMessage: Story = {
  args: {
    steps: sampleSteps.map(step => ({ ...step, status: 'complete' as const })),
    completionMessage: 'All validation checks passed successfully!',
  },
};

export const NoCompletionMessage: Story = {
  args: {
    steps: sampleSteps.map(step => ({ ...step, status: 'complete' as const })),
    showCompletionMessage: false,
  },
};