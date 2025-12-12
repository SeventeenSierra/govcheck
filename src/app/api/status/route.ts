/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Next.js API Route for Service Status
 * 
 * Provides detailed status information for debugging the end-to-end workflow.
 */

import { StrandsIntegrationHandlers } from '@/adapters/strands-integration-adapter';

// Export the handler from the Strands integration adapter
export const GET = StrandsIntegrationHandlers.handleServiceStatus;