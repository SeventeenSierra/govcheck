// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

'use client';

import { useRef } from 'react';
import { UploadManager } from '@/components/upload';

export default function DebugUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectClick = () => {
    console.log('Direct click triggered');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('File selected:', files[0].name);
      alert(`File selected: ${files[0].name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Upload Debug Page</h1>
        
        {/* Test 1: Direct file input */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test 1: Direct File Input</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Test 2: Button that triggers file input */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test 2: Button Trigger</h2>
          <button
            onClick={handleDirectClick}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open File Dialog (Direct)
          </button>
        </div>

        {/* Test 3: Upload Manager Component */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test 3: Upload Manager Component</h2>
          <UploadManager 
            onUploadComplete={(session) => {
              console.log('Upload completed:', session);
              alert(`Upload completed: ${session.filename}`);
            }}
            onUploadError={(error) => {
              console.log('Upload error:', error);
              alert(`Upload error: ${error}`);
            }}
          />
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. Open browser developer tools (F12)</li>
            <li>2. Check the Console tab for debug messages</li>
            <li>3. Try each test above and see which ones work</li>
            <li>4. Look for any JavaScript errors or security restrictions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}