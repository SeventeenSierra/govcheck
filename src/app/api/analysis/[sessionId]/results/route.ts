/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Next.js API Route for Analysis Results
 * 
 * This route now uses the framework-independent adapter pattern.
 * The business logic is handled by the MockApiServer, making it
 * reusable across different frameworks.
 */

import { NextJsApiHandlers } from '@/adapters/nextjs-adapter';

// Export the handler from the adapter
export const GET = NextJsApiHandlers.handleAnalysisResults;