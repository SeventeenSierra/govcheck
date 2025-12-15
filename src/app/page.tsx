// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

'use client';

import Link from 'next/link';
import { FileText } from '@17sierra/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <FileText size={40} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">GovCheck</h1>
          </div>
          <p className="text-gray-600">AI-powered federal proposal compliance analysis</p>
        </div>

        <Link
          href="/rfp"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Analysis
        </Link>
      </div>
    </div>
  );
}
