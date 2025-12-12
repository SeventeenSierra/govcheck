/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import type { Request, Response } from 'express';
import { mockApiServer } from '../services/mock-api-server';
import type { ApiResponse } from '../services/strands-api-client';

/**
 * Express.js API Adapter
 * 
 * Adapter layer for using the framework-independent mock API server
 * with Express.js. Demonstrates how the same business logic can be
 * used across different frameworks.
 * 
 * Usage:
 * ```typescript
 * import express from 'express';
 * import { ExpressApiHandlers } from './adapters/express-adapter';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * app.post('/api/documents/upload', ExpressApiHandlers.handleDocumentUpload);
 * app.post('/api/analysis/start', ExpressApiHandlers.handleAnalysisStart);
 * // ... other routes
 * ```
 */

/**
 * Convert API response to Express response
 */
function sendApiResponse<T>(res: Response, apiResponse: ApiResponse<T>, successStatus = 200): void {
  if (apiResponse.success) {
    res.status(successStatus).json({
      success: true,
      data: apiResponse.data
    });
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

    res.status(status).json({
      success: false,
      error: apiResponse.error,
      code: apiResponse.code
    });
  }
}

/**
 * Express.js API Route Handlers
 */
export const ExpressApiHandlers = {
  /**
   * Document upload handler
   * Requires multer middleware for file handling
   */
  async handleDocumentUpload(req: Request, res: Response): Promise<void> {
    try {
      // Assuming multer middleware is used: app.use(multer().single('file'))
      const file = req.file;
      
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No file provided',
          code: 'MISSING_FILE'
        });
        return;
      }

      // Convert multer file to File object
      const fileObj = new File([file.buffer], file.originalname, {
        type: file.mimetype
      });

      const result = await mockApiServer.handleDocumentUpload(fileObj);
      sendApiResponse(res, result, 201);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Upload failed',
        code: 'UPLOAD_FAILED'
      });
    }
  },

  /**
   * Analysis start handler
   */
  async handleAnalysisStart(req: Request, res: Response): Promise<void> {
    try {
      const { proposalId } = req.body;
      
      if (!proposalId) {
        res.status(400).json({
          success: false,
          error: 'Proposal ID is required',
          code: 'MISSING_PROPOSAL_ID'
        });
        return;
      }

      const result = await mockApiServer.handleAnalysisStart(proposalId);
      sendApiResponse(res, result, 201);
    } catch (error) {
      console.error('Analysis start error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start analysis',
        code: 'ANALYSIS_START_FAILED'
      });
    }
  },

  /**
   * Analysis results handler
   */
  async handleAnalysisResults(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        });
        return;
      }

      const result = await mockApiServer.handleAnalysisResults(sessionId);
      sendApiResponse(res, result);
    } catch (error) {
      console.error('Results retrieval error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve results',
        code: 'RESULTS_RETRIEVAL_FAILED'
      });
    }
  },

  /**
   * Upload status handler
   */
  async handleUploadStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        });
        return;
      }

      const result = await mockApiServer.handleUploadStatus(sessionId);
      sendApiResponse(res, result);
    } catch (error) {
      console.error('Upload status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get upload status',
        code: 'UPLOAD_STATUS_FAILED'
      });
    }
  },

  /**
   * Analysis status handler
   */
  async handleAnalysisStatus(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_SESSION_ID'
        });
        return;
      }

      const result = await mockApiServer.handleAnalysisStatus(sessionId);
      sendApiResponse(res, result);
    } catch (error) {
      console.error('Analysis status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get analysis status',
        code: 'ANALYSIS_STATUS_FAILED'
      });
    }
  },

  /**
   * Issue details handler
   */
  async handleIssueDetails(req: Request, res: Response): Promise<void> {
    try {
      const { issueId } = req.params;
      
      if (!issueId) {
        res.status(400).json({
          success: false,
          error: 'Issue ID is required',
          code: 'MISSING_ISSUE_ID'
        });
        return;
      }

      const result = await mockApiServer.handleIssueDetails(issueId);
      sendApiResponse(res, result);
    } catch (error) {
      console.error('Issue details error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get issue details',
        code: 'ISSUE_DETAILS_FAILED'
      });
    }
  },

  /**
   * Health check handler
   */
  async handleHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      const result = await mockApiServer.handleHealthCheck();
      sendApiResponse(res, result);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        code: 'HEALTH_CHECK_FAILED'
      });
    }
  },
};

/**
 * Express router factory
 * Creates a complete Express router with all API routes configured
 */
export function createExpressApiRouter() {
  const express = require('express');
  const router = express.Router();

  // Document routes
  router.post('/documents/upload', ExpressApiHandlers.handleDocumentUpload);
  router.get('/documents/upload/:sessionId', ExpressApiHandlers.handleUploadStatus);

  // Analysis routes
  router.post('/analysis/start', ExpressApiHandlers.handleAnalysisStart);
  router.get('/analysis/:sessionId', ExpressApiHandlers.handleAnalysisStatus);
  router.get('/analysis/:sessionId/results', ExpressApiHandlers.handleAnalysisResults);

  // Results routes
  router.get('/results/issues/:issueId', ExpressApiHandlers.handleIssueDetails);

  // Health check
  router.get('/health', ExpressApiHandlers.handleHealthCheck);

  return router;
}

/**
 * Example Express server setup
 */
export function createExpressServer(port = 8080) {
  const express = require('express');
  const cors = require('cors');
  const multer = require('multer');
  
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(multer().single('file')); // For file uploads
  
  // API routes
  app.use('/api', createExpressApiRouter());
  
  // Start server
  app.listen(port, () => {
    console.log(`Mock API server running on http://localhost:${port}`);
  });
  
  return app;
}