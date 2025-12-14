/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { NextRequest, NextResponse } from 'next/server';
import { strandsApiClient } from '../services/strands-api-client';
import { mockApiServer } from '../services/mock-api-server';
import type { ApiResponse } from '../services/strands-api-client';

/**
 * Strands Integration Adapter
 *
 * Connects Next.js API routes to the real Strands service with fallback to mock.
 * Implements the end-to-end workflow integration for task 11.
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
      case 'VALIDATION_FAILED':
        status = 400; // Bad Request
        break;
      case 'SERVICE_UNAVAILABLE':
        status = 503; // Service Unavailable
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
 * Check if Strands service is available
 */
async function isStrandsServiceAvailable(): Promise<boolean> {
  try {
    const healthCheck = await strandsApiClient.healthCheck();
    return (
      healthCheck.success &&
      (healthCheck.data?.status === 'healthy' || healthCheck.data?.status === 'degraded')
    );
  } catch (error) {
    console.log('Strands service health check failed:', error);
    return false;
  }
}

/**
 * Strands Integration API Route Handlers
 *
 * These handlers connect to the real Strands service with fallback to mock
 */
export const StrandsIntegrationHandlers = {
  /**
   * Document upload handler with Strands integration
   * Uploads to Strands service and automatically starts analysis
   */
  async handleDocumentUpload(request: NextRequest): Promise<NextResponse> {
    const file = await extractFileFromRequest(request);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided', code: 'MISSING_FILE' },
        { status: 400 }
      );
    }

    console.log(`Processing upload for file: ${file.name} (${file.size} bytes)`);

    try {
      // Check if Strands service is available
      const strandsAvailable = await isStrandsServiceAvailable();

      if (strandsAvailable) {
        console.log('Using real Strands service for upload and analysis');

        // Upload to Strands service
        const uploadResult = await strandsApiClient.uploadDocument(file);

        if (uploadResult.success && uploadResult.data) {
          console.log(`Upload successful, session ID: ${uploadResult.data.id}`);

          // Automatically start analysis after successful upload
          const analysisResult = await strandsApiClient.startAnalysis(
            uploadResult.data.id, // Use upload session ID as proposal ID
            uploadResult.data.id,
            uploadResult.data.filename
          );

          if (analysisResult.success && analysisResult.data) {
            console.log(`Analysis started, session ID: ${analysisResult.data.id}`);

            // Return combined upload and analysis information
            return NextResponse.json(
              {
                success: true,
                data: {
                  ...uploadResult.data,
                  analysisSessionId: analysisResult.data.id,
                  analysisStatus: analysisResult.data.status,
                  message: 'Upload completed and analysis started',
                },
              },
              { status: 201 }
            );
          } else {
            console.warn('Analysis start failed, returning upload result only');
            // Return upload result even if analysis failed to start
            return toNextResponse(uploadResult, 201);
          }
        } else {
          console.error('Strands upload failed:', uploadResult.error);
          throw new Error(uploadResult.error || 'Upload failed');
        }
      } else {
        console.log('Strands service unavailable, using mock fallback');
        // Fallback to mock API
        const result = await mockApiServer.handleDocumentUpload(file);
        return toNextResponse(result, 201);
      }
    } catch (error) {
      console.error('Upload error:', error);

      // Try mock fallback on any error
      console.log('Attempting mock fallback due to error');
      try {
        const fallbackResult = await mockApiServer.handleDocumentUpload(file);
        return toNextResponse(fallbackResult, 201);
      } catch (fallbackError) {
        console.error('Mock fallback also failed:', fallbackError);
        return NextResponse.json(
          {
            success: false,
            error: 'Upload failed and fallback unavailable',
            code: 'UPLOAD_FAILED',
          },
          { status: 500 }
        );
      }
    }
  },

  /**
   * Analysis start handler with Strands integration
   */
  async handleAnalysisStart(request: NextRequest): Promise<NextResponse> {
    const body = await extractJsonFromRequest<{
      proposalId: string;
      documentId?: string;
      filename?: string;
    }>(request);

    if (!body?.proposalId) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID is required', code: 'MISSING_PROPOSAL_ID' },
        { status: 400 }
      );
    }

    console.log(`Starting analysis for proposal: ${body.proposalId}`);

    try {
      // Check if Strands service is available
      const strandsAvailable = await isStrandsServiceAvailable();

      if (strandsAvailable) {
        console.log('Using real Strands service for analysis');

        const result = await strandsApiClient.startAnalysis(
          body.proposalId,
          body.documentId,
          body.filename
        );

        if (result.success) {
          console.log(`Analysis started successfully, session ID: ${result.data?.id}`);
        } else {
          console.error('Strands analysis start failed:', result.error);
        }

        return toNextResponse(result, 201);
      } else {
        console.log('Strands service unavailable, using mock fallback');
        // Fallback to mock API
        const result = await mockApiServer.handleAnalysisStart(body.proposalId);
        return toNextResponse(result, 201);
      }
    } catch (error) {
      console.error('Analysis start error:', error);

      // Try mock fallback
      try {
        const fallbackResult = await mockApiServer.handleAnalysisStart(body.proposalId);
        return toNextResponse(fallbackResult, 201);
      } catch (fallbackError) {
        console.error('Mock fallback failed:', fallbackError);
        return NextResponse.json(
          {
            success: false,
            error: 'Analysis start failed and fallback unavailable',
            code: 'ANALYSIS_START_FAILED',
          },
          { status: 500 }
        );
      }
    }
  },

  /**
   * Analysis results handler with Strands integration
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

    console.log(`Getting analysis results for session: ${sessionId}`);

    try {
      // Check if Strands service is available
      const strandsAvailable = await isStrandsServiceAvailable();

      if (strandsAvailable) {
        console.log('Using real Strands service for results');

        const result = await strandsApiClient.getResults(sessionId);

        if (result.success) {
          console.log(`Results retrieved successfully for session: ${sessionId}`);
        } else {
          console.error('Strands results retrieval failed:', result.error);
        }

        return toNextResponse(result);
      } else {
        console.log('Strands service unavailable, using mock fallback');
        // Fallback to mock API
        const result = await mockApiServer.handleAnalysisResults(sessionId);
        return toNextResponse(result);
      }
    } catch (error) {
      console.error('Results retrieval error:', error);

      // Try mock fallback
      try {
        const fallbackResult = await mockApiServer.handleAnalysisResults(sessionId);
        return toNextResponse(fallbackResult);
      } catch (fallbackError) {
        console.error('Mock fallback failed:', fallbackError);
        return NextResponse.json(
          {
            success: false,
            error: 'Results retrieval failed and fallback unavailable',
            code: 'RESULTS_RETRIEVAL_FAILED',
          },
          { status: 500 }
        );
      }
    }
  },

  /**
   * Analysis status handler with Strands integration
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

    try {
      // Check if Strands service is available
      const strandsAvailable = await isStrandsServiceAvailable();

      if (strandsAvailable) {
        const result = await strandsApiClient.getAnalysisStatus(sessionId);
        return toNextResponse(result);
      } else {
        // Fallback to mock API
        const result = await mockApiServer.handleAnalysisStatus(sessionId);
        return toNextResponse(result);
      }
    } catch (error) {
      console.error('Analysis status error:', error);

      // Try mock fallback
      try {
        const fallbackResult = await mockApiServer.handleAnalysisStatus(sessionId);
        return toNextResponse(fallbackResult);
      } catch (fallbackError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Status retrieval failed and fallback unavailable',
            code: 'ANALYSIS_STATUS_FAILED',
          },
          { status: 500 }
        );
      }
    }
  },

  /**
   * Health check handler that checks both web and Strands services
   */
  async handleHealthCheck(request: NextRequest): Promise<NextResponse> {
    try {
      const webHealth = await mockApiServer.handleHealthCheck();
      const strandsAvailable = await isStrandsServiceAvailable();

      let strandsHealth = null;
      if (strandsAvailable) {
        const strandsHealthCheck = await strandsApiClient.healthCheck();
        strandsHealth = strandsHealthCheck.data;
      }

      return NextResponse.json({
        success: true,
        data: {
          web_service: webHealth.data,
          strands_service: strandsHealth || { status: 'unavailable' },
          integration_status: strandsAvailable ? 'connected' : 'fallback_mode',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Health check error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Health check failed',
          code: 'HEALTH_CHECK_FAILED',
        },
        { status: 500 }
      );
    }
  },

  /**
   * Service status endpoint for debugging
   */
  async handleServiceStatus(request: NextRequest): Promise<NextResponse> {
    try {
      const serviceStatus = await strandsApiClient.getServiceStatus();

      return NextResponse.json({
        success: true,
        data: {
          strands_service: serviceStatus,
          web_service: {
            status: 'healthy',
            baseUrl: 'http://localhost:3000',
            timestamp: Date.now(),
          },
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Service status error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Service status check failed',
          code: 'SERVICE_STATUS_FAILED',
        },
        { status: 500 }
      );
    }
  },
};
