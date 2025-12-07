import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For container support
  // NOTE: No ignoreBuildErrors - must fix actual TS errors
  // NOTE: No external image hosts - use local assets only
};

export default nextConfig;
