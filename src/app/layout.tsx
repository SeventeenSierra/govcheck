// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@17sierra/ui';

export const metadata: Metadata = {
  title: 'GovCheck AI',
  description: 'Autonomous agent for federal procurement compliance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Font optimization for Requirement 5.1: Load time performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon.ico" as="image" />
        {/* DNS prefetch for API endpoints */}
        <link rel="dns-prefetch" href="//localhost:8080" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
