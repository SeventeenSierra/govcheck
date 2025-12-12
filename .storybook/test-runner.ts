// SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import type { TestRunnerConfig } from "@storybook/test-runner";
import { injectAxe, checkA11y } from "axe-playwright";

const config: TestRunnerConfig = {
  setup() {
    // Global setup for test runner
  },
  async preRender(page) {
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  },
  async postRender(page, context) {
    // Run accessibility tests on each story
    const storyContext = context.storyContext;
    
    // Skip accessibility tests for stories that are explicitly marked to skip
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    try {
      await checkA11y(page, "#storybook-root", {
        detailedReport: true,
        detailedReportOptions: { html: true },
        axeOptions: {
          rules: {
            // Customize rules as needed
            "color-contrast": { enabled: true },
            "focus-trap": { enabled: true },
            "landmark-one-main": { enabled: false }, // Often not applicable in component stories
          },
        },
      });
    } catch (error) {
      // Log accessibility violations but don't fail the test
      console.warn(`Accessibility violations found in story: ${storyContext.title}/${storyContext.name}`, error);
    }
  },
  tags: {
    include: ["test"],
    exclude: ["skip-test"],
  },
};

export default config;