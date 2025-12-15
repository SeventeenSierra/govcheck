/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { Meta, StoryObj } from '@storybook/react';
import { UploadManager } from './upload-manager';
import { withMockData, mockDataConfigs, ErrorScenario } from '@/test-utils';
import { UploadStatus } from '@/types/app';

const meta: Meta<typeof UploadManager> = {
  title: 'Components/Upload/UploadManager',
  component: UploadManager,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Upload Manager component with comprehensive mock data support for testing various upload scenarios.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onUploadComplete: { action: 'uploadComplete' },
    onUploadError: { action: 'uploadError' },
    onUploadProgress: { action: 'uploadProgress' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UploadManager>;

/**
 * Default upload manager state
 */
export const Default: Story = {
  args: {
    disabled: false,
  },
  decorators: [withMockData(mockDataConfigs.fastLoading)],
};

/**
 * Upload manager in disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  decorators: [withMockData(mockDataConfigs.fastLoading)],
};

/**
 * Upload manager with slow network simulation
 */
export const SlowNetwork: Story = {
  args: {
    disabled: false,
  },
  decorators: [withMockData(mockDataConfigs.slowLoading)],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates upload behavior with slow network conditions (2 second delay).',
      },
    },
  },
};

/**
 * Upload manager with network error simulation
 */
export const NetworkError: Story = {
  args: {
    disabled: false,
  },
  decorators: [withMockData(mockDataConfigs.networkError)],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates upload behavior when network errors occur.',
      },
    },
  },
};

/**
 * Upload manager with server error simulation
 */
export const ServerError: Story = {
  args: {
    disabled: false,
  },
  decorators: [withMockData(mockDataConfigs.serverError)],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates upload behavior when server errors occur.',
      },
    },
  },
};

/**
 * Upload manager with file too large error
 */
export const FileTooLarge: Story = {
  args: {
    disabled: false,
  },
  decorators: [
    withMockData({
      errorScenario: ErrorScenario.FILE_TOO_LARGE,
      delay: 100,
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates upload behavior when files exceed size limits.',
      },
    },
  },
};

/**
 * Upload manager with invalid file type error
 */
export const InvalidFileType: Story = {
  args: {
    disabled: false,
  },
  decorators: [
    withMockData({
      errorScenario: ErrorScenario.INVALID_FILE,
      delay: 100,
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates upload behavior when invalid file types are selected.',
      },
    },
  },
};

/**
 * Upload manager with successful upload
 */
export const SuccessfulUpload: Story = {
  args: {
    disabled: false,
  },
  decorators: [withMockData(mockDataConfigs.uploadCompleted)],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates successful upload completion with realistic mock data.',
      },
    },
  },
};

/**
 * Upload manager with upload in progress
 */
export const UploadInProgress: Story = {
  args: {
    disabled: false,
  },
  decorators: [withMockData(mockDataConfigs.uploadInProgress)],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates upload progress tracking with realistic progress updates.',
      },
    },
  },
};

/**
 * Upload manager with upload failed
 */
export const UploadFailed: Story = {
  args: {
    disabled: false,
  },
  decorators: [withMockData(mockDataConfigs.uploadFailed)],
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates upload failure handling with error recovery options.',
      },
    },
  },
};
