/*
 * SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStrandsApiClient } from '@/services/strands-api-client';

/**
 * GET /api/seed - Get seeded documents status and list
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    const strandsClient = getStrandsApiClient();

    switch (action) {
      case 'status':
        // Get seeding status
        const statusResponse = await fetch(`${strandsClient.baseUrl}/api/seed/status`);
        if (!statusResponse.ok) {
          throw new Error(`Failed to get seeding status: ${statusResponse.statusText}`);
        }
        const statusData = await statusResponse.json();
        
        return NextResponse.json({
          success: true,
          data: statusData,
        });

      case 'documents':
        // Get list of seeded documents
        const documentsResponse = await fetch(`${strandsClient.baseUrl}/api/seed/documents`);
        if (!documentsResponse.ok) {
          throw new Error(`Failed to get seeded documents: ${documentsResponse.statusText}`);
        }
        const documentsData = await documentsResponse.json();
        
        return NextResponse.json({
          success: true,
          data: documentsData,
        });

      case 'verify':
        // Verify seeded files
        const verifyResponse = await fetch(`${strandsClient.baseUrl}/api/seed/verify`);
        if (!verifyResponse.ok) {
          throw new Error(`Failed to verify seeded files: ${verifyResponse.statusText}`);
        }
        const verifyData = await verifyResponse.json();
        
        return NextResponse.json({
          success: true,
          data: verifyData,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Supported actions: status, documents, verify',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Seed API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seed - Trigger database reseeding
 */
export async function POST(request: NextRequest) {
  try {
    const strandsClient = getStrandsApiClient();

    // Trigger database reseeding
    const reseedResponse = await fetch(`${strandsClient.baseUrl}/api/seed/reseed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!reseedResponse.ok) {
      throw new Error(`Failed to reseed database: ${reseedResponse.statusText}`);
    }

    const reseedData = await reseedResponse.json();
    
    return NextResponse.json({
      success: true,
      data: reseedData,
    });
  } catch (error) {
    console.error('Seed reseed error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}