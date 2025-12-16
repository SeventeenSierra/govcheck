// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { AnalysisStatus, AnalysisResult, AnalysisSession } from '@/components/analysis/types';

export interface WebSocketMessage {
    type: string;
    sessionId: string;
    data: any;
}

export class MockAnalysisService {
    async startAnalysis(request: any): Promise<{ success: boolean; sessionId?: string; error?: string }> {
        console.log('MockAnalysisService: Starting analysis', request);
        return {
            success: true,
            sessionId: `analysis_${Date.now()}_mock`
        };
    }

    async getAnalysisStatus(sessionId: string): Promise<AnalysisSession | null> {
        return {
            id: sessionId,
            proposalId: 'mock-proposal-id',
            status: AnalysisStatus.EXTRACTING, // Was PROCESSING (invalid)
            progress: 50,
            currentStep: 'Simulating analysis...',
            startedAt: new Date(Date.now() - 5000)
        };
    }

    async getResults(sessionId: string): Promise<{ success: boolean; data?: any; error?: string }> {
        return {
            success: true,
            data: {
                status: 'pass',
                summary: {
                    total_issues: 0,
                    critical_count: 0,
                    warning_count: 0
                }
            }
        };
    }

    async retryAnalysis(sessionId: string): Promise<{ success: boolean; newSessionId?: string; error?: string }> {
        return {
            success: true,
            newSessionId: `retry_${sessionId}`
        };
    }

    async exportResults(proposalId: string, format: string): Promise<{ success: boolean; data?: string; error?: string }> {
        return {
            success: true,
            data: JSON.stringify({ proposalId, format, mock: true }, null, 2)
        };
    }

    setEventHandlers(handlers: any) {
        // No-op for mock, or implement simulation loop
        console.log('MockAnalysisService: Event handlers set');
    }
}

export const analysisService = new MockAnalysisService();
