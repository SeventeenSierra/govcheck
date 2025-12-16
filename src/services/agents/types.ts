export interface AgentResponse {
    stepId: number;
    status: 'pending' | 'running' | 'complete';
    message: string;
    details: string;
    duration?: number;
}

export interface AgentService {
    id: string;
    name: string;
    runCheck(): Promise<AgentResponse>;
}
