/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockApiServer } from '../services/mock-api-server';
import type { ApiResponse } from '../services/strands-api-client';

/**
 * Next.js API Route Adapter
 *
 * Thin adapter layer that connects Next.js API routes to the
 * framework-independent mock API server. This allows the same
 * business logic to be used across different frameworks.
 */

/**
 * Utility to extract file from Next.js FormData
 */
async function extractFileFromRequest(request: NextRequest): Promise<File | null> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    return file || null;
  } catch (error) {
    console.error('Error extracting file from request:', error);
    return null;
  }
}

/**
 * Utility to extract JSON body from Next.js request
 */
async function extractJsonFromRequest<T = any>(request: NextRequest): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    console.error('Error extracting JSON from request:', error);
    return null;
  }
}

/**
 * Convert API response to Next.js response
 */
function toNextResponse<T>(apiResponse: ApiResponse<T>, successStatus = 200): NextResponse {
  if (apiResponse.success) {
    return NextResponse.json(
      {
        success: true,
        data: apiResponse.data,
      },
      { status: successStatus }
    );
  } else {
    // Map error codes to HTTP status codes
    let status = 500; // Default server error

    switch (apiResponse.code) {
      case 'MISSING_FILE':
      case 'MISSING_PROPOSAL_ID':
      case 'MISSING_SESSION_ID':
      case 'MISSING_ISSUE_ID':
        status = 400; // Bad Request
        break;
      case 'INVALID_FILE_TYPE':
      case 'FILE_TOO_LARGE':
        status = 400; // Bad Request
        break;
      case 'UPLOAD_FAILED':
      case 'ANALYSIS_START_FAILED':
      case 'RESULTS_RETRIEVAL_FAILED':
      case 'UPLOAD_STATUS_FAILED':
      case 'ANALYSIS_STATUS_FAILED':
      case 'ISSUE_DETAILS_FAILED':
        status = 500; // Internal Server Error
        break;
    }

    return NextResponse.json(
      {
        success: false,
        error: apiResponse.error,
        code: apiResponse.code,
      },
      { status }
    );
  }
}

/**
 * Next.js API Route Handlers
 *
 * These functions can be directly exported from Next.js API route files
 */
export const NextJsApiHandlers = {
  /**
   * Document upload handler
   * Usage: export { POST } from '@/adapters/nextjs-adapter';
   */
  async handleDocumentUpload(request: NextRequest): Promise<NextResponse> {
    const file = await extractFileFromRequest(request);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided', code: 'MISSING_FILE' },
        { status: 400 }
      );
    }

    const result = await mockApiServer.handleDocumentUpload(file);
    return toNextResponse(result, 201); // Created
  },

  /**
   * Analysis start handler
   */
  async handleAnalysisStart(request: NextRequest): Promise<NextResponse> {
    const body = await extractJsonFromRequest<{ proposalId: string }>(request);

    if (!body?.proposalId) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID is required', code: 'MISSING_PROPOSAL_ID' },
        { status: 400 }
      );
    }

    const result = await mockApiServer.handleAnalysisStart(body.proposalId);
    return toNextResponse(result, 201); // Created
  },

  /**
   * Analysis results handler
   */
  async handleAnalysisResults(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
  ): Promise<NextResponse> {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    const result = await mockApiServer.handleAnalysisResults(sessionId);
    return toNextResponse(result);
  },

  /**
   * Upload status handler
   */
  async handleUploadStatus(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
  ): Promise<NextResponse> {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    const result = await mockApiServer.handleUploadStatus(sessionId);
    return toNextResponse(result);
  },

  /**
   * Analysis status handler
   */
  async handleAnalysisStatus(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
  ): Promise<NextResponse> {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    const result = await mockApiServer.handleAnalysisStatus(sessionId);
    return toNextResponse(result);
  },

  /**
   * Issue details handler
   */
  async handleIssueDetails(
    request: NextRequest,
    { params }: { params: Promise<{ issueId: string }> }
  ): Promise<NextResponse> {
    const { issueId } = await params;

    if (!issueId) {
      return NextResponse.json(
        { success: false, error: 'Issue ID is required', code: 'MISSING_ISSUE_ID' },
        { status: 400 }
      );
    }

    const result = await mockApiServer.handleIssueDetails(issueId);
    return toNextResponse(result);
  },

  /**
   * Health check handler
   */
  async handleHealthCheck(request: NextRequest): Promise<NextResponse> {
    const result = await mockApiServer.handleHealthCheck();
    return toNextResponse(result);
  },
};

/**
 * Convenience exports for Next.js API routes
 *
 * These can be imported and used directly in Next.js route files:
 *
 * // app/api/documents/upload/route.ts
 * export { POST as POST } from '@/adapters/nextjs-adapter';
 */
export const POST = NextJsApiHandlers.handleDocumentUpload;
export const GET = NextJsApiHandlers.handleHealthCheck;
