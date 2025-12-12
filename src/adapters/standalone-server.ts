#!/usr/bin/env node

/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

/**
 * Standalone Mock API Server
 * 
 * Framework-independent server that can run without Next.js or any
 * specific framework. Uses Node.js built-in HTTP server with the
 * same business logic as the framework adapters.
 * 
 * Usage:
 * ```bash
 * node src/adapters/standalone-server.js
 * # or
 * npm run mock-server
 * ```
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { mockApiServer } from '../services/mock-api-server';
import type { ApiResponse } from '../services/strands-api-client';

/**
 * Parse JSON body from request
 */
async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Parse multipart form data (simplified for file uploads)
 */
async function parseFormData(req: IncomingMessage): Promise<{ file?: File }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        // This is a simplified implementation
        // In production, you'd use a proper multipart parser
        const file = new File([buffer], 'uploaded-file.pdf', {
          type: 'application/pdf'
        });
        resolve({ file });
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send API response
 */
function sendResponse<T>(res: ServerResponse, apiResponse: ApiResponse<T>, successStatus = 200): void {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (apiResponse.success) {
    res.statusCode = successStatus;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      data: apiResponse.data
    }));
  } else {
    // Map error codes to HTTP status codes
    let status = 500;
    
    switch (apiResponse.code) {
      case 'MISSING_FILE':
      case 'MISSING_PROPOSAL_ID':
      case 'MISSING_SESSION_ID':
      case 'MISSING_ISSUE_ID':
      case 'INVALID_FILE_TYPE':
      case 'FILE_TOO_LARGE':
        status = 400;
        break;
      default:
        status = 500;
    }

    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: apiResponse.error,
      code: apiResponse.code
    }));
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCors(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.statusCode = 200;
  res.end();
}

/**
 * Route handler
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { pathname, query } = parse(req.url || '', true);
  const method = req.method?.toUpperCase();

  console.log(`${method} ${pathname}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    handleCors(res);
    return;
  }

  try {
    // Route matching
    if (pathname === '/api/documents/upload' && method === 'POST') {
      const { file } = await parseFormData(req);
      if (!file) {
        sendResponse(res, {
          success: false,
          error: 'No file provided',
          code: 'MISSING_FILE'
        });
        return;
      }
      const result = await mockApiServer.handleDocumentUpload(file);
      sendResponse(res, result, 201);

    } else if (pathname?.startsWith('/api/documents/upload/') && method === 'GET') {
      const sessionId = pathname.split('/').pop();
      if (!sessionId) {
        sendResponse(res, {
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        });
        return;
      }
      const result = await mockApiServer.handleUploadStatus(sessionId);
      sendResponse(res, result);

    } else if (pathname === '/api/analysis/start' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.proposalId) {
        sendResponse(res, {
          success: false,
          error: 'Proposal ID is required',
          code: 'MISSING_PROPOSAL_ID'
        });
        return;
      }
      const result = await mockApiServer.handleAnalysisStart(body.proposalId);
      sendResponse(res, result, 201);

    } else if (pathname?.match(/^\/api\/analysis\/[^/]+$/) && method === 'GET') {
      const sessionId = pathname.split('/').pop();
      if (!sessionId) {
        sendResponse(res, {
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        });
        return;
      }
      const result = await mockApiServer.handleAnalysisStatus(sessionId);
      sendResponse(res, result);

    } else if (pathname?.match(/^\/api\/analysis\/[^/]+\/results$/) && method === 'GET') {
      const parts = pathname.split('/');
      const sessionId = parts[parts.length - 2];
      if (!sessionId) {
        sendResponse(res, {
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        });
        return;
      }
      const result = await mockApiServer.handleAnalysisResults(sessionId);
      sendResponse(res, result);

    } else if (pathname?.match(/^\/api\/results\/issues\/[^/]+$/) && method === 'GET') {
      const issueId = pathname.split('/').pop();
      if (!issueId) {
        sendResponse(res, {
          success: false,
          error: 'Issue ID is required',
          code: 'MISSING_ISSUE_ID'
        });
        return;
      }
      const result = await mockApiServer.handleIssueDetails(issueId);
      sendResponse(res, result);

    } else if (pathname === '/api/health' && method === 'GET') {
      const result = await mockApiServer.handleHealthCheck();
      sendResponse(res, result);

    } else {
      // 404 Not Found
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: 'Not Found',
        code: 'NOT_FOUND'
      }));
    }

  } catch (error) {
    console.error('Request error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR'
    }));
  }
}

/**
 * Create and start the standalone server
 */
export function createStandaloneServer(port = 8081) {
  const server = createServer(handleRequest);

  server.listen(port, () => {
    console.log(`🚀 Standalone Mock API Server running on http://localhost:${port}`);
    console.log('📋 Available endpoints:');
    console.log('  POST   /api/documents/upload');
    console.log('  GET    /api/documents/upload/:sessionId');
    console.log('  POST   /api/analysis/start');
    console.log('  GET    /api/analysis/:sessionId');
    console.log('  GET    /api/analysis/:sessionId/results');
    console.log('  GET    /api/results/issues/:issueId');
    console.log('  GET    /api/health');
    console.log('');
    console.log('💡 This server is framework-independent and can be used with:');
    console.log('   - React (without Next.js)');
    console.log('   - Vue.js');
    console.log('   - Vanilla JavaScript');
    console.log('   - Any frontend framework');
  });

  return server;
}

// Start server if this file is run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '8081', 10);
  createStandaloneServer(port);
}