// SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import type { Preview } from "@storybook/react-vite";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default preview;
