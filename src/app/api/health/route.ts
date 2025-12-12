/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Next.js API Route for Health Check
 * 
 * This route now uses the Strands integration adapter to show both
 * web service and Strands service health status.
 */

import { StrandsIntegrationHandlers } from '@/adapters/strands-integration-adapter';

// Export the handler from the Strands integration adapter
export const GET = StrandsIntegrationHandlers.handleHealthCheck;