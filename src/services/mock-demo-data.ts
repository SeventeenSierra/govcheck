// SPDX-License-Identifier: AGPL-3.0-or-later
import { CoordinatorService } from './agents/coordinator';
import { FarAgent } from './agents/far';
import { EoAgent } from './agents/eo';
import { TechAgent } from './agents/tech';

export type AgentType = 'far' | 'eo' | 'tech' | 'coordinator';

export interface MockStep {
    id: number;
    agent: string;
    message: string;
    duration: number; // ms
    status: 'pending' | 'running' | 'complete';
    details?: string;
}

// Use an async function to get steps since services are async
export const getMockDemoSteps = async (): Promise<MockStep[]> => {
    const s1 = CoordinatorService.initiate();
    const s2 = await FarAgent.runCheck();
    const s3 = await EoAgent.runCheck();
    const s4 = await TechAgent.runCheck();
    const s5 = CoordinatorService.aggregate();

    return [
        { ...s1, id: s1.stepId, agent: 'coordinator', status: 'pending' },
        { ...s2, id: s2.stepId, agent: 'far', status: 'pending' },
        { ...s3, id: s3.stepId, agent: 'eo', status: 'pending' },
        { ...s4, id: s4.stepId, agent: 'tech', status: 'pending' },
        { ...s5, id: s5.stepId, agent: 'coordinator', status: 'pending' }
    ] as MockStep[];
};

export const MOCK_RESULTS = {
    score: 92,
    summary: "Compliance review complete. Proposal is compliant with major FAR clauses. One minor warning detected in budget justification.",
    issues: [
        {
            id: 'issue-1',
            severity: 'warning',
            text: 'Budget justification section approaches page limit (4.8/5 pages).',
            agent: 'tech'
        },
        {
            id: 'issue-2',
            severity: 'success',
            text: 'All required FAR 52.204-xx cyber clauses present.',
            agent: 'far'
        },
        {
            id: 'issue-3',
            severity: 'success',
            text: 'AI safety protocols align with EO 14110 requirements.',
            agent: 'eo'
        }
    ]
};
