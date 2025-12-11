// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For container support
  transpilePackages: ["@17sierra/ui", "@17sierra/lib", "@17sierra/ai-flows"],
  serverExternalPackages: ["genkit", "@genkit-ai/googleai", "express"],
  eslint: {
    // Disable ESLint during builds since we use Biome
    ignoreDuringBuilds: true,
  },
  // NOTE: No ignoreBuildErrors - must fix actual TS errors
  // NOTE: No external image hosts - use local assets only
};

export default nextConfig;
