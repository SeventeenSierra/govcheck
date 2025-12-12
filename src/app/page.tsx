// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

'use client';

import Link from 'next/link';
import { Bot, FileText, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-primary text-primary-foreground p-3 rounded-xl">
                <FileText size={32} />
              </div>
              <h1 className="text-4xl font-bold text-slate-900">
                Proposal Prepper
              </h1>
            </div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Automated compliance analysis for federal procurement proposals. 
              Choose your preferred interface below.
            </p>
          </div>

          {/* Interface Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Proposals Interface */}
            <Link 
              href="/proposals"
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-primary/30"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 text-primary p-4 rounded-xl mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Standard Interface
                </h3>
                <p className="text-slate-600 mb-4">
                  Step-by-step workflow for document upload, analysis, and results review. 
                  Perfect for detailed compliance checking.
                </p>
                <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                  Start Analysis
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Agent Interface */}
            <Link 
              href="/agent"
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-primary/30"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-teal-50 text-teal-600 p-4 rounded-xl mb-4 group-hover:bg-teal-100 transition-colors">
                  <Bot size={32} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  AI Agent Interface
                </h3>
                <p className="text-slate-600 mb-4">
                  Interactive AI-powered analysis with real-time feedback and recommendations. 
                  Includes live report preview.
                </p>
                <div className="flex items-center text-teal-600 font-medium group-hover:gap-3 transition-all">
                  Try Agent Demo
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-4">Key Features</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                FAR/DFARS Compliance
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Automated Analysis
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Detailed Reports
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
