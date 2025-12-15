/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
 */

'use client';

import { UploadManager } from '@/components/upload/upload-manager';
import { UploadSession } from '@/types/app';

export default function TestUploadPage() {
  const handleUploadComplete = (session: UploadSession) => {
    console.log('Upload completed:', session);
    alert(`Upload completed: ${session.filename}`);
  };

  const handleUploadError = (error: string, session: UploadSession) => {
    console.log('Upload error:', error, session);
    alert(`Upload error: ${error}`);
  };

  const handleUploadProgress = (progress: number, session: UploadSession) => {
    console.log('Upload progress:', progress, session.filename);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Upload Test Page</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test Upload Manager</h2>
          <p className="text-sm text-gray-600 mb-4">
            This page tests the upload functionality with console logging. Open browser dev tools to
            see debug messages.
          </p>

          <UploadManager
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadProgress={handleUploadProgress}
          />
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Open browser developer tools (F12)</li>
            <li>Go to the Console tab</li>
            <li>Try clicking the "Select PDF File" button</li>
            <li>Try dragging and dropping a PDF file</li>
            <li>Check console for debug messages and any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
