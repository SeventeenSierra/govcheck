
'use client';

import React, { useState } from 'react';
import { Button, Select, Badge } from '@17sierra/ui';
import { Play, FileText } from 'lucide-react';
// import { strandsApiClient } from '@/services/strands-api-client';
import type { UploadSession } from '@/types/app';

// List of available seed files
const SEED_FILES = [
    "baecher_joseph_2023_d1f8a239-27c0-4a38-a333-ea4e82533d1b_PROPOSAL_1.pdf",
    "baecher_joseph_2024_c6f0ae22-48ba-4044-a44c-d860f9b8d17f_PROPOSAL_1.pdf",
    "barker_michelle_2020_1b5d2213-4c72-4da8-a7b8-bece5b27d280_PROPOSAL_1.pdf",
    "bertolet_brittnil_2021_9d34d838-4fd8-4fbd-b94e-766d1dd82d23_PROPOSAL_1.pdf",
    "brown_ctitus_2014_afd7eaff-7bea-45d0-be3e-33188b448cd1_PROPOSAL_1.pdf",
    "frazer_ryane_2019_74f22e94-b364-482e-a2c1-0892b705f0c6_PROPOSAL_1.pdf",
    "gregory_samantha_2018_7f2475c4-2fad-498f-beac-e3044183b996_PROPOSAL_1.pdf",
    "jensen_jan_2015_02ecd4f0-ac84-4cf4-8d10-1aed8faa6767_PROPOSAL_1.pdf",
    "nell_lucas_2022_6306262d-9317-4f58-aadc-caf26325862d_PROPOSAL_1.pdf",
    "polino_alexander_2017_f990c0ee-e9e0-4f31-b050-9ed3a0b4c2e5_PROPOSAL_1.pdf"
];

interface SimulationControlsProps {
    onComplete: (session: UploadSession) => void;
    onError: (error: string) => void;
}

export function SimulationControls({ onComplete, onError }: SimulationControlsProps) {
    const [selectedFile, setSelectedFile] = useState(SEED_FILES[0]);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulate = async () => {
        setIsSimulating(true);
        try {
            // Note: Client calls Next.js proxy route, which calls backend
            const response = await fetch('/api/documents/simulate-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: selectedFile })
            });

            const result = await response.json();

            if (result.success && result.data) {
                onComplete(result.data);
            } else {
                onError(result.error || 'Simulation failed');
            }
        } catch (error) {
            onError('Simulation failed: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    Dev Tools
                </Badge>
                <span className="text-sm font-medium text-gray-700">Test with Seed Data</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <select
                        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                    >
                        {SEED_FILES.map(file => (
                            <option key={file} value={file}>
                                {file.split('_').slice(0, 3).join(' ')}...
                            </option>
                        ))}
                    </select>
                </div>
                <Button
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {isSimulating ? (
                        <>Simulating...</>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            Simulate Upload
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
