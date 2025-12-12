/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  analyzeDocumentStructure,
  detectCriticalViolations,
  detectWarningIssues,
  generateComplianceStatus,
} from '@/utils/compliance-detection';
import {
  type AnalysisResult,
  type AnalysisSession,
  AnalysisStatus,
  type ComplianceIssue,
  IssueSeverity,
  type TextExtractionResult,
  type ValidationResult,
} from './types';

/**
 * Analysis Coordinator Props
 */
export interface AnalysisCoordinatorProps {
  /** Document ID to analyze */
  proposalId: string;
  /** File content for analysis */
  fileContent?: File | string;
  /** Callback when analysis starts */
  onAnalysisStart?: (session: AnalysisSession) => void;
  /** Callback for progress updates */
  onProgressUpdate?: (session: AnalysisSession) => void;
  /** Callback when analysis completes */
  onAnalysisComplete?: (result: AnalysisResult) => void;
  /** Callback for analysis errors */
  onAnalysisError?: (error: string, session: AnalysisSession) => void;
  /** Whether to auto-start analysis */
  autoStart?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Analysis Coordinator Component
 *
 * Orchestrates the basic compliance analysis process including:
 * - FAR/DFARS validation framework
 * - Text extraction capabilities
 * - Analysis progress tracking
 * - Critical compliance violation flagging
 * - Basic compliance status generation
 * - Analysis error handling and recovery
 */
export const AnalysisCoordinator: React.FC<AnalysisCoordinatorProps> = ({
  proposalId,
  fileContent,
  onAnalysisStart,
  onProgressUpdate,
  onAnalysisComplete,
  onAnalysisError,
  autoStart = false,
  className = '',
}) => {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  /**
   * Generate unique session ID
   */
  const generateSessionId = useCallback((): string => {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Extract text content from document
   * Implements Requirement 2.2: Text extraction for compliance checking
   */
  const extractTextContent = useCallback(
    async (content: File | string): Promise<TextExtractionResult> => {
      const startTime = Date.now();

      try {
        let extractedText: string;
        let pageCount = 1;

        if (typeof content === 'string') {
          // Handle string content
          extractedText = content;
          pageCount = Math.ceil(content.length / 3000); // Estimate pages
        } else {
          // Handle File content - for threshold implementation, use simple text extraction
          const text = await content.text();
          extractedText = text;
          pageCount = Math.ceil(text.length / 3000); // Estimate pages
        }

        const processingTime = Date.now() - startTime;

        return {
          success: true,
          text: extractedText,
          pageCount,
          metadata: {
            extractionMethod: 'basic-text',
            processingTime,
            confidence: 0.95, // High confidence for basic text extraction
          },
        };
      } catch (error) {
        return {
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Text extraction failed',
          metadata: {
            extractionMethod: 'basic-text',
            processingTime: Date.now() - startTime,
            confidence: 0,
          },
        };
      }
    },
    []
  );

  /**
   * Core FAR/DFARS validation rules
   * Implements Requirement 2.1: Validate against core FAR/DFARS requirements
   */
  const validateFARDFARS = useCallback(async (text: string): Promise<ValidationResult[]> => {
    const results: ValidationResult[] = [];

    // Basic FAR/DFARS validation rules for threshold implementation
    const validationRules = [
      {
        id: 'far_52_204_21',
        name: 'FAR 52.204-21 Basic Safeguarding',
        pattern: /basic\s+safeguarding|cybersecurity|information\s+security/i,
        required: true,
        section: 'FAR 52.204-21',
      },
      {
        id: 'dfars_252_204_7012',
        name: 'DFARS 252.204-7012 Cybersecurity',
        pattern: /cybersecurity|nist\s+800-171|controlled\s+unclassified\s+information/i,
        required: true,
        section: 'DFARS 252.204-7012',
      },
      {
        id: 'far_52_219_8',
        name: 'FAR 52.219-8 Small Business Subcontracting',
        pattern: /small\s+business|subcontracting\s+plan|socioeconomic/i,
        required: false,
        section: 'FAR 52.219-8',
      },
    ];

    for (const rule of validationRules) {
      const matches = rule.pattern.test(text);
      const issues: ComplianceIssue[] = [];

      if (rule.required && !matches) {
        issues.push({
          id: `issue_${rule.id}_${Date.now()}`,
          severity: IssueSeverity.CRITICAL,
          title: `Missing ${rule.name} compliance`,
          description: `Document does not appear to address ${rule.name} requirements`,
          regulation: rule.section,
          remediation: `Ensure document includes ${rule.name} compliance information`,
        });
      }

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        passed: rule.required ? matches : true,
        issues,
        confidence: matches ? 0.8 : 0.6,
      });
    }

    return results;
  }, []);

  /**
   * Update session progress
   */
  const updateProgress = useCallback(
    (sessionId: string, status: AnalysisStatus, progress: number, currentStep: string) => {
      setSession((prev) => {
        if (!prev || prev.id !== sessionId) return prev;

        return {
          ...prev,
          status,
          progress,
          currentStep,
          ...(status === AnalysisStatus.COMPLETED && { completedAt: new Date() }),
        };
      });
    },
    []
  );

  // Call onProgressUpdate when session changes (outside of render)
  useEffect(() => {
    if (session) {
      onProgressUpdate?.(session);
    }
  }, [session, onProgressUpdate]);

  /**
   * Start analysis process
   * Implements Requirements 2.1, 2.2, 2.4: Analysis orchestration
   */
  const startAnalysis = useCallback(async () => {
    if (!fileContent || isAnalyzing) return;

    const sessionId = generateSessionId();
    const newSession: AnalysisSession = {
      id: sessionId,
      proposalId,
      status: AnalysisStatus.QUEUED,
      progress: 0,
      startedAt: new Date(),
      currentStep: 'Initializing analysis',
    };

    setSession(newSession);
    setIsAnalyzing(true);
    setResult(null);
    onAnalysisStart?.(newSession);

    try {
      // Step 1: Text Extraction (Requirement 2.2)
      updateProgress(sessionId, AnalysisStatus.EXTRACTING, 20, 'Extracting text content');
      const extractionResult = await extractTextContent(fileContent);

      if (!extractionResult.success || !extractionResult.text) {
        throw new Error(extractionResult.errorMessage || 'Text extraction failed');
      }

      // Step 2: FAR/DFARS Validation (Requirement 2.1)
      updateProgress(sessionId, AnalysisStatus.ANALYZING, 50, 'Analyzing FAR/DFARS compliance');
      const validationResults = await validateFARDFARS(extractionResult.text);

      // Step 3: Enhanced Compliance Issue Detection (Requirement 2.3)
      updateProgress(sessionId, AnalysisStatus.VALIDATING, 70, 'Detecting compliance violations');

      const criticalViolations = detectCriticalViolations(extractionResult.text);
      const warningIssues = detectWarningIssues(extractionResult.text);
      const _documentStructure = analyzeDocumentStructure(extractionResult.text);

      // Step 4: Generate Results (Requirement 2.4)
      updateProgress(sessionId, AnalysisStatus.VALIDATING, 85, 'Generating compliance report');

      const validationIssues = validationResults.flatMap((result) => result.issues);
      const allIssues = [...validationIssues, ...criticalViolations, ...warningIssues];
      const complianceStatus = generateComplianceStatus(allIssues);

      const analysisResult: AnalysisResult = {
        sessionId,
        proposalId,
        status: complianceStatus.status,
        overallScore: complianceStatus.overallScore,
        issues: allIssues,
        extractedText: extractionResult.text,
        analysisMetadata: {
          totalPages: extractionResult.pageCount || 1,
          processingTime: Date.now() - newSession.startedAt.getTime(),
          rulesChecked: validationResults.map((r) => r.ruleId),
          completedAt: new Date(),
        },
      };

      // Complete analysis
      updateProgress(sessionId, AnalysisStatus.COMPLETED, 100, 'Analysis complete');
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';

      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: AnalysisStatus.FAILED,
              currentStep: 'Analysis failed',
              errorMessage,
            }
          : null
      );

      onAnalysisError?.(errorMessage, newSession);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    fileContent,
    isAnalyzing,
    proposalId,
    generateSessionId,
    extractTextContent,
    validateFARDFARS,
    updateProgress,
    onAnalysisStart,
    onAnalysisComplete,
    onAnalysisError,
  ]);

  /**
   * Retry failed analysis
   * Implements Requirement 2.5: Error recovery options
   */
  const retryAnalysis = useCallback(() => {
    if (session?.status === AnalysisStatus.FAILED) {
      startAnalysis();
    }
  }, [session, startAnalysis]);

  /**
   * Auto-start analysis when fileContent is provided
   */
  useEffect(() => {
    if (autoStart && fileContent && !session && !isAnalyzing) {
      startAnalysis();
    }
  }, [autoStart, fileContent, session, isAnalyzing, startAnalysis]);

  /**
   * Render analysis status and controls
   */
  return (
    <div className={`analysis-coordinator ${className}`}>
      {/* Analysis Status Display */}
      {session && (
        <div className="analysis-status mb-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Analysis Status</h3>
            <span
              className={`px-2 py-1 rounded text-sm ${
                session.status === AnalysisStatus.COMPLETED
                  ? 'bg-green-100 text-green-800'
                  : session.status === AnalysisStatus.FAILED
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {session.status.toUpperCase()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{session.currentStep}</span>
              <span>{session.progress}%</span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-2"
              role="progressbar"
              aria-valuenow={session.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Analysis progress"
            >
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${session.progress}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {session.status === AnalysisStatus.FAILED && session.errorMessage && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {session.errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Analysis Controls */}
      <div className="analysis-controls">
        {!session || session.status === AnalysisStatus.FAILED ? (
          <button
            type="button"
            onClick={session?.status === AnalysisStatus.FAILED ? retryAnalysis : startAnalysis}
            disabled={!fileContent || isAnalyzing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {session?.status === AnalysisStatus.FAILED ? 'Retry Analysis' : 'Start Analysis'}
          </button>
        ) : null}
      </div>

      {/* Results Summary */}
      {result && (
        <div className="analysis-results mt-4 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span
                className={`ml-2 px-2 py-1 rounded ${
                  result.status === 'pass'
                    ? 'bg-green-100 text-green-800'
                    : result.status === 'fail'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {result.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium">Score:</span>
              <span className="ml-2">{result.overallScore}/100</span>
            </div>
            <div>
              <span className="font-medium">Issues Found:</span>
              <span className="ml-2">{result.issues.length}</span>
            </div>
            <div>
              <span className="font-medium">Processing Time:</span>
              <span className="ml-2">
                {(result.analysisMetadata.processingTime / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
