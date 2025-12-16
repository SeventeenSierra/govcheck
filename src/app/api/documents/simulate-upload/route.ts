
import { NextRequest, NextResponse } from 'next/server';
import { strandsApiClient } from '@/services/strands-api-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filename } = body;

        if (!filename) {
            return NextResponse.json(
                { success: false, error: 'Filename is required' },
                { status: 400 }
            );
        }

        // Call Strands service to simulate upload
        const result = await strandsApiClient.simulateUpload(filename);

        if (result.success && result.data) {
            // Automatically start analysis after simulated upload, similar to real upload workflow
            const analysisResult = await strandsApiClient.startAnalysis(
                result.data.id,
                result.data.id,
                result.data.filename,
                result.data.s3Key
            );

            return NextResponse.json({
                success: true,
                data: {
                    ...result.data,
                    analysisSessionId: analysisResult.data?.id,
                    analysisStatus: analysisResult.data?.status || 'queued',
                    message: 'Simulation started successfully'
                }
            });
        } else {
            return NextResponse.json(
                { success: false, error: result.error || 'Simulation failed' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Simulation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
