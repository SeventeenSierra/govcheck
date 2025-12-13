// This file has been automatically migrated to valid ESM format by Storybook.
// SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { createRequire } from "node:module";
import type { StorybookConfig } from "@storybook/react-vite";

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  core: {
    builder: "@storybook/builder-vite",
  },
  framework: "@storybook/react-vite",
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
    "../src/**/*.mdx"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@chromatic-com/storybook"
  ],
  viteFinal: async (config) => {
    // Enable React fast refresh
    config.plugins?.push(require("@vitejs/plugin-react"));
    
    // Increase chunk size warning limit for development
    if (config.build) {
      config.build.chunkSizeWarningLimit = 1000;
    }
    
    return config;
  },
  features: {
    interactionsDebugger: true,
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};
export default config;
