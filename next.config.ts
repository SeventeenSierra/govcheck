// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // For container support
  transpilePackages: ['@17sierra/ui', '@17sierra/lib', '@17sierra/ai-flows'],
  serverExternalPackages: ['genkit', '@genkit-ai/googleai', 'express'],

  // Performance optimizations for Requirement 5.1: Load time performance
  experimental: {
    optimizePackageImports: ['@17sierra/ui', 'lucide-react', '@radix-ui/react-accordion'],
  },

  // Turbopack configuration for Next.js 16
  turbopack: {
    // Enable tree shaking and optimization
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Compression and caching
  compress: true,
  poweredByHeader: false,

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // ESLint configuration removed in Next.js 16 - use Biome instead
  // NOTE: No ignoreBuildErrors - must fix actual TS errors
  // NOTE: No external image hosts - use local assets only
};

export default nextConfig;
