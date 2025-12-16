
import { NextRequest, NextResponse } from 'next/server';
import { MockStrandsClient } from '@/services/mock-strands-client';

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
        const mockClient = new MockStrandsClient();
        const result = await mockClient.uploadDocument(new File([""], filename), () => { });

        if (result.success && result.data) {
            // Automatically start analysis after simulated upload, similar to real upload workflow
            // Mock analysis start
            const analysisSessionId = `analysis_${result.data.id}`;

            return NextResponse.json({
                success: true,
                data: {
                    ...result.data,
                    analysisSessionId: analysisSessionId,
                    analysisStatus: 'queued',
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
