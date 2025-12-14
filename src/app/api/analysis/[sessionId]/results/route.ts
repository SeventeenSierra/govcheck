/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Next.js API Route for Analysis Results
 *
 * This route now uses the Strands integration adapter for end-to-end workflow.
 * Connects to real Strands service with fallback to mock for development.
 */

import { StrandsIntegrationHandlers } from '@/adapters/strands-integration-adapter';

// Export the handler from the Strands integration adapter
export const GET = StrandsIntegrationHandlers.handleAnalysisResults;
