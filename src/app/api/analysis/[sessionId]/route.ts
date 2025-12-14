/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Next.js API Route for Analysis Status
 *
 * This route uses the Strands integration adapter for end-to-end workflow.
 * Connects to real Strands service with fallback to mock for development.
 */

import { StrandsIntegrationHandlers } from '@/adapters/strands-integration-adapter';

// Export the handler from the Strands integration adapter
export const GET = StrandsIntegrationHandlers.handleAnalysisStatus;
