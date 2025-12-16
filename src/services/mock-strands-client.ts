// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import { UploadSession, UploadStatus } from '@/types/app';

interface UploadResponse {
    success: boolean;
    data?: UploadSession;
    error?: string;
}

export class MockStrandsClient {
    async uploadDocument(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<UploadResponse> {
        console.log('MockStrandsClient: Starting simulated upload for', file.name);

        const totalSteps = 10;
        const stepDuration = 200; // 2 seconds total

        for (let i = 1; i <= totalSteps; i++) {
            await new Promise((resolve) => setTimeout(resolve, stepDuration));
            const progress = (i / totalSteps) * 100;
            onProgress?.(progress);
        }

        const mockSessionId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        return {
            success: true,
            data: {
                id: mockSessionId,
                filename: file.name,
                fileSize: file.size,
                mimeType: file.type,
                status: UploadStatus.COMPLETED,
                progress: 100,
                startedAt: new Date(Date.now() - 2000),
                completedAt: new Date(),
                analysisSessionId: `analysis_${mockSessionId}`
            }
        };
    }
}
