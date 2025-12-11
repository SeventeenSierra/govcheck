<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# Design Document

## Overview

The Proposal Prepper (Contract Checker) is a Next.js web application that provides federal vendor proposal compliance checking against FAR/DFARS regulations and Executive Orders. The system orchestrates multiple specialized AI agents (FAR Agent, Executive Order Agent, Technical Agent) through a Federated Mesh architecture while providing transparent, educational analysis results with government-grade security and audit capabilities.

The application features dual-analysis validation (tactical and strategic) with convergent results, confidence scoring for assessment reliability, and human-in-the-loop validation for high-risk findings. The system provides evidence-based compliance checking with exact regulatory citations, proposal quotes, and prioritized remediation steps with specific timelines.

## Architecture

### Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│              Federal Vendor Compliance Application                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Main Application UI                           │ │
│  │                                                                 │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │ Document Upload │  │ Agent Interface │  │ Results Display │ │ │
│  │  │ - PDF/Text      │  │ - Multi-Agent   │  │ - Dual Analysis │ │ │
│  │  │ - Validation    │  │ - Chat Interface│  │ - Risk Scoring  │ │ │
│  │  │ - Processing    │  │ - Routing       │  │ - Evidence      │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│                                    ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │              Multi-Agent Orchestration                           │ │
│  │                                                                 │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   FAR Agent     │  │Executive Order  │  │Technical Agent  │ │ │
│  │  │ - FAR/DFARS     │  │     Agent       │  │ - Tech Specs    │ │ │
│  │  │ - Procurement   │  │ - Presidential  │  │ - Requirements  │ │ │
│  │  │ - Compliance    │  │   Directives    │  │ - Analysis      │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│                                    ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │              Analysis & Validation                               │ │
│  │                                                                 │ │
│  │  - Dual Analysis (Tactical + Strategic)                        │ │
│  │  - Convergent Validation                                        │ │
│  │  - Confidence Scoring                                           │ │
│  │  - Human-in-the-Loop Validation                                 │ │
│  │  - Regulatory Currency Tracking                                 │ │
│  │  - Evidence-Based Results                                       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Orchestration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                 FAR Compliance Agent Coordination                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Multi-Agent Team                              │ │
│  │                                                                 │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │   FAR Agent     │  │Executive Order  │  │Technical Agent  │ │ │
│  │  │                 │  │     Agent       │  │                 │ │ │
│  │  │ - FAR Parts     │  │ - Presidential  │  │ - Technical     │ │ │
│  │  │ - DFARS Supp    │  │   Directives    │  │   Specifications│ │ │
│  │  │ - Procurement   │  │ - Policy        │  │ - Requirements  │ │ │
│  │  │   Rules         │  │   Compliance    │  │   Analysis      │ │ │
│  │  │ - Contract      │  │ - Executive     │  │ - System        │ │ │
│  │  │   Requirements  │  │   Guidance      │  │   Architecture  │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  │                                                                 │ │
│  │  Model: Claude 3.5      Model: Claude 3.5      Model: Nova Pro │ │
│  │  SOP: far_agent.md      SOP: eo_agent.md       SOP: tech.md    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│                                    ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                 Coordination Logic                               │ │
│  │                                                                 │ │
│  │  - Route queries to appropriate agents                          │ │
│  │  - Aggregate responses for dual analysis                        │ │
│  │  - Validate convergent results                                  │ │
│  │  - Handle conflicting assessments                               │ │
│  │  - Provide confidence scoring                                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Main Application Interface

#### ProposalComplianceApp Component
```typescript
interface ProposalComplianceAppProps {
  onAnalysisComplete: (analysis: ComplianceAnalysis) => void
  onError: (error: ApplicationError) => void
}

interface ApplicationState {
  currentStep: 'upload' | 'analyzing' | 'results' | 'error'
  uploadedDocuments: UploadedDocument[]
  currentAnalysis?: ComplianceAnalysis
  agentInteractions: AgentInteraction[]
  error?: ApplicationError
}

interface UploadedDocument {
  id: string
  type: 'solicitation' | 'proposal'
  fileName: string
  fileSize: number
  uploadedAt: Date
  status: 'uploaded' | 'processing' | 'processed' | 'error'
}
```

### Shared Components

#### AgentInterface Component
```typescript
interface AgentInterfaceProps {
  availableAgents: AgentConfig[]
  onAgentQuery: (query: string, targetAgent?: string) => Promise<AgentResponse>
  currentAnalysis?: ComplianceAnalysis
}

interface AgentConfig {
  id: string
  name: string
  description: string
  capabilities: string[]
  model: string
  sopFile: string
  specialization: string
}

interface AgentResponse {
  agentId: string
  agentName: string
  response: string
  citations: RegulatoryReference[]
  confidence: number
  timestamp: Date
  provenance: ProvenanceInfo
}

const FAR_AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'far-agent',
    name: 'FAR Agent',
    description: 'Federal Acquisition Regulation and DFARS compliance expert',
    capabilities: ['far_compliance', 'dfars_supplement', 'procurement_rules', 'contract_requirements'],
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    sopFile: 'far_agent.sop.md',
    specialization: 'Federal procurement regulations and contract compliance'
  },
  {
    id: 'executive-order-agent',
    name: 'Executive Order Agent',
    description: 'Presidential directive and executive policy compliance specialist',
    capabilities: ['executive_orders', 'presidential_directives', 'policy_compliance', 'federal_mandates'],
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    sopFile: 'executive_order_agent.sop.md',
    specialization: 'Executive Orders and presidential policy compliance'
  },
  {
    id: 'technical-agent',
    name: 'Technical Agent',
    description: 'Technical specification and system requirements analyst',
    capabilities: ['technical_specs', 'requirements_analysis', 'system_architecture', 'performance_standards'],
    model: 'amazon.nova-pro-v1:0',
    sopFile: 'technical_agent.sop.md',
    specialization: 'Technical requirements and system specifications'
  }
]
```

#### ComplianceResults Component
```typescript
interface ComplianceResultsProps {
  analysis: ComplianceAnalysis
  onFindingExpand: (findingId: string) => void
  onExpertReview: (findingId: string) => void
  onRemediationRequest: (findingId: string) => void
}

interface ComplianceAnalysis {
  id: string
  overallScore: number
  status: ComplianceStatus
  findings: ComplianceFinding[]
  dualAnalysis: DualAnalysisResult
  riskClassification: RiskClassification
  regulatoryInfo: RegulatoryInfo
  timestamp: Date
  processingTime: number
}

interface ComplianceFinding {
  id: string
  requirementId: string
  requirementText: string
  verdict: 'PASS' | 'FAIL' | 'WARNING' | 'UNVERIFIED'
  confidence: number
  evidenceQuote?: string
  pageNumber?: number
  reasoning: string
  criticality: 'high' | 'medium' | 'low'
  remediation?: RemediationSuggestion
  provenance: ProvenanceInfo
  regulatoryReferences: RegulatoryReference[]
}

interface DualAnalysisResult {
  tacticalAnalysis: ComplianceFinding[]
  strategicAnalysis: ComplianceFinding[]
  convergentFindings: string[]
  conflictingAssessments: ConflictingAssessment[]
}

interface ConflictingAssessment {
  requirementId: string
  tacticalVerdict: string
  strategicVerdict: string
  confidenceScores: {
    tactical: number
    strategic: number
  }
  recommendedAction: 'expert_review' | 'accept_higher_confidence' | 'additional_analysis'
}
```

#### ProvenanceDisplay Component
```typescript
interface ProvenanceDisplayProps {
  provenance: ProvenanceInfo
  showTimestamp?: boolean
  showModel?: boolean
}

interface ProvenanceInfo {
  agentId: string
  agentName: string
  service: 'strands' | 'genkit'
  model: string
  timestamp: Date
  processingTime: number
  confidence: number
}

const PROVENANCE_STYLES = {
  'far-agent': {
    color: 'blue',
    icon: 'GovernmentBuilding',
    label: 'FAR Agent (Claude 3.5)'
  },
  'executive-order-agent': {
    color: 'purple',
    icon: 'Gavel',
    label: 'EO Agent (Claude 3.5)'
  },
  'technical-agent': {
    color: 'green',
    icon: 'Cog',
    label: 'Technical Agent (Nova Pro)'
  },
  'nsf-agent': {
    color: 'orange',
    icon: 'GraduationCap',
    label: 'NSF Agent (Claude 3.5)'
  }
}
```

### FAR Compliance Components

#### DualAnalysisDisplay Component
```typescript
interface DualAnalysisDisplayProps {
  dualAnalysis: DualAnalysisResult
  onFindingSelect: (findingId: string, analysisType: 'tactical' | 'strategic') => void
  onConvergenceReview: (requirementId: string) => void
}

interface ConvergentValidationIndicator {
  requirementId: string
  tacticalVerdict: string
  strategicVerdict: string
  convergent: boolean
  confidenceLevel: 'high' | 'medium' | 'low'
  recommendedAction: 'accept' | 'expert_review' | 'additional_analysis'
}
```

#### RiskClassificationDashboard Component
```typescript
interface RiskClassificationDashboardProps {
  findings: ComplianceFinding[]
  criticalThreshold: number
  secondaryThreshold: number
  onRiskLevelFilter: (level: 'critical' | 'secondary' | 'compliant') => void
}

interface RiskClassification {
  critical: ComplianceFinding[]
  secondary: ComplianceFinding[]
  compliant: ComplianceFinding[]
  nonWaivableViolations: ComplianceFinding[]
  totalRiskScore: number
}
```

#### RegulatoryTimelineDisplay Component
```typescript
interface RegulatoryTimelineDisplayProps {
  regulatoryReferences: RegulatoryReference[]
  asOfDate: Date
  onRegulatoryUpdate: (referenceId: string) => void
}

interface RegulatoryTimeline {
  farUpdates: RegulatoryUpdate[]
  executiveOrderUpdates: RegulatoryUpdate[]
  lastCrawlDate: Date
  nextScheduledUpdate: Date
}

interface RegulatoryUpdate {
  id: string
  type: 'FAR' | 'DFARS' | 'EXECUTIVE_ORDER'
  effectiveDate: Date
  title: string
  impact: 'high' | 'medium' | 'low'
  affectedFindings: string[]
}
```

### API Layer

#### FAR Compliance API Implementation
```typescript
// apps/web/src/app/api/analyze/route.ts
interface AnalyzeRequest {
  documents: {
    solicitation?: File
    proposal: File
  }
  options?: AnalysisOptions
}

interface AnalysisOptions {
  agents?: string[]
  confidenceThreshold?: number
  includeExpertReview?: boolean
  regulatoryAsOfDate?: Date
  analysisDepth?: 'standard' | 'comprehensive'
}

export async function POST(request: Request) {
  const { documents, options } = await request.json()
  
  // Validate documents
  if (!documents.proposal) {
    return NextResponse.json({ error: 'Proposal document required' }, { status: 400 })
  }
  
  // Orchestrate FAR compliance analysis
  return await orchestrateFARAnalysis(documents, options)
}

async function orchestrateFARAnalysis(
  documents: AnalyzeRequest['documents'],
  options?: AnalysisOptions
): Promise<ComplianceAnalysis> {
  // Coordinate FAR Agent, Executive Order Agent, Technical Agent
  const agents = ['far-agent', 'executive-order-agent', 'technical-agent']
  
  // Extract and process documents
  const proposalContent = await extractDocumentContent(documents.proposal)
  const solicitationContent = documents.solicitation 
    ? await extractDocumentContent(documents.solicitation)
    : await getDefaultFARRequirements()
  
  // Perform dual analysis (tactical + strategic)
  const tacticalAnalysis = await performTacticalAnalysis({
    proposal: proposalContent,
    solicitation: solicitationContent,
    agents: agents.filter(a => a !== 'technical-agent') // FAR and EO agents
  })
  
  const strategicAnalysis = await performStrategicAnalysis({
    proposal: proposalContent,
    solicitation: solicitationContent,
    agents: ['technical-agent'] // Technical agent for strategic view
  })
  
  // Convergent validation
  const convergentResults = await validateConvergence(tacticalAnalysis, strategicAnalysis)
  
  // Risk classification
  const riskClassification = await classifyRisks([...tacticalAnalysis, ...strategicAnalysis])
  
  // Calculate overall compliance score
  const overallScore = calculateComplianceScore(tacticalAnalysis, strategicAnalysis)
  
  return {
    id: generateAnalysisId(),
    overallScore,
    status: determineComplianceStatus(overallScore),
    findings: [...tacticalAnalysis, ...strategicAnalysis],
    dualAnalysis: {
      tacticalAnalysis,
      strategicAnalysis,
      convergentFindings: convergentResults.convergent,
      conflictingAssessments: convergentResults.conflicts
    },
    riskClassification,
    regulatoryInfo: await getCurrentRegulatoryInfo(),
    timestamp: new Date(),
    processingTime: Date.now() - startTime
  }
}

async function performTacticalAnalysis(params: {
  proposal: string
  solicitation: string
  agents: string[]
}): Promise<ComplianceFinding[]> {
  // Focus on immediate FAR/DFARS compliance issues
  // Non-waivable requirements, contract terms, procurement rules
  const farFindings = await callAgent('far-agent', {
    proposal: params.proposal,
    solicitation: params.solicitation,
    analysisType: 'tactical'
  })
  
  const eoFindings = await callAgent('executive-order-agent', {
    proposal: params.proposal,
    analysisType: 'tactical'
  })
  
  return [...farFindings, ...eoFindings]
}

async function performStrategicAnalysis(params: {
  proposal: string
  solicitation: string
  agents: string[]
}): Promise<ComplianceFinding[]> {
  // Focus on strategic regulatory framework alignment
  // Technical requirements, system architecture, long-term compliance
  return await callAgent('technical-agent', {
    proposal: params.proposal,
    solicitation: params.solicitation,
    analysisType: 'strategic'
  })
}
```

## Data Models

### Regulatory Reference Model
```typescript
interface RegulatoryReference {
  id: string
  type: 'FAR' | 'DFARS' | 'EXECUTIVE_ORDER' | 'NSF_PAPPG'
  citation: string
  title: string
  section?: string
  subsection?: string
  effectiveDate: Date
  asOfDate: Date
  url?: string
  criticality: 'high' | 'medium' | 'low'
}
```

### Confidence Scoring Model
```typescript
interface ConfidenceScore {
  overall: number // 0-100
  factors: {
    evidenceClarity: number
    regulatoryAlignment: number
    agentConsensus: number
    historicalAccuracy: number
  }
  threshold: {
    highConfidence: number // 85+
    mediumConfidence: number // 70-84
    lowConfidence: number // <70
  }
  recommendsExpertReview: boolean
}
```

### Session Management Model
```typescript
interface AnalysisSession {
  id: string
  service: 'far' | 'nsf'
  userId?: string
  createdAt: Date
  lastUpdated: Date
  status: 'active' | 'completed' | 'expired'
  documents: {
    solicitation?: DocumentInfo
    proposal: DocumentInfo
  }
  analyses: ComplianceAnalysis[]
  agentInteractions: AgentInteraction[]
}

interface DocumentInfo {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: Date
  processedAt?: Date
  pageCount?: number
  sections?: ExtractedSection[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: File format validation consistency
*For any* file upload, the validation should accept PDF and text formats for federal procurement proposal analysis
**Validates: Requirements 1.1**

Property 2: Evidence-based result formatting
*For any* compliance analysis result, it should include exact proposal quotes, FAR/DFARS regulatory citations, and reasoning
**Validates: Requirements 1.3**

Property 3: Critical issue identification
*For any* compliance analysis, critical issues should be properly flagged as non-waivable requirements that create immediate rejection risk
**Validates: Requirements 1.4**

Property 4: Agent coordination consistency
*For any* analysis request, the correct specialized agents (FAR Agent, Executive Order Agent, Technical Agent) should be coordinated
**Validates: Requirements 2.2, 2.3, 2.4**

Property 5: Regulatory citation appropriateness
*For any* agent recommendation, it should include specific FAR/DFARS citations appropriate to federal procurement compliance
**Validates: Requirements 2.5**

Property 6: Dual-analysis validation
*For any* compliance analysis, it should perform both tactical FAR compliance and strategic regulatory framework analysis with convergent validation
**Validates: Requirements 3.1**

Property 7: Risk classification consistency
*For any* compliance findings, they should be organized by risk classification (critical vs. secondary deficiencies) with clear severity indicators
**Validates: Requirements 3.2**

Property 8: Remediation timeline specificity
*For any* compliance recommendation, it should provide prioritized remediation steps with specific timelines (0-10 days for critical actions)
**Validates: Requirements 3.4**

Property 9: Provenance transparency
*For any* analysis result, it should clearly show which specialized agent (FAR Agent, Executive Order Agent, Technical Agent) provided each analysis
**Validates: Requirements 4.1**

Property 10: Regulatory currency display
*For any* compliance result, it should include regulatory update dates for FAR/DFARS references and Executive Order compliance checks
**Validates: Requirements 4.5**

Property 11: Confidence scoring inclusion
*For any* compliance assessment, it should include confidence scores indicating interpretation certainty levels for each finding
**Validates: Requirements 8.1**

Property 12: High-confidence vs expert review distinction
*For any* compliance finding, it should be properly classified as high-confidence violation or requiring expert review based on confidence thresholds
**Validates: Requirements 8.2**

Property 13: Compliance flag transparency
*For any* regulatory interpretation, it should show the specific proposal text that triggered the compliance flag for expert validation
**Validates: Requirements 8.3**

Property 14: Human-in-the-loop validation
*For any* complex proposal processing, it should implement human-in-the-loop validation checkpoints for high-risk findings
**Validates: Requirements 8.4**

Property 15: Uncertainty handling
*For any* assessment with uncertain reliability, it should recommend expert review rather than providing potentially incorrect automated guidance
**Validates: Requirements 8.5**

## Error Handling

### Service Selection Errors
- **Invalid service selection**: Graceful fallback to service selection page with error message
- **Routing failures**: Clear error messages with retry options
- **Session conflicts**: Automatic session cleanup and recovery

### Analysis Processing Errors
- **Agent coordination failures**: Fallback to available agents with degraded functionality notice
- **Confidence threshold failures**: Clear indication of low-confidence results with expert review recommendations
- **Regulatory data unavailability**: Fallback to cached regulatory data with currency warnings

### File Processing Errors
- **Invalid file formats**: Clear validation messages with supported format information
- **File size limits**: Progress indicators with size limit warnings
- **Processing timeouts**: Graceful timeout handling with retry options

## Testing Strategy

### Unit Testing
Unit tests will verify individual components and functions:
- Service selection routing logic
- Agent coordination and routing
- Confidence scoring calculations
- File validation and processing
- Session management and isolation
- Regulatory citation formatting

### Property-Based Testing
Property-based tests will verify universal properties using **fast-check**. Each test will run a minimum of 100 iterations.

Tests will cover:
- Service routing consistency across different user selections
- Session isolation across service switches
- File format validation across different file types
- Agent coordination consistency across different service configurations
- Confidence scoring accuracy across different analysis scenarios
- Regulatory citation appropriateness across different compliance domains

Each property-based test will be tagged with: `**Feature: app-development, Property {number}: {property_text}**`

### Integration Testing
Integration tests will verify component interactions:
- End-to-end service selection and analysis workflows
- Agent coordination and response handling
- File upload and processing pipelines
- Session management across service switches
- Confidence scoring and expert review integration

### End-to-End Testing
E2E tests using Playwright will verify complete user workflows:
- Select FAR service and complete federal vendor compliance analysis
- Select NSF service and complete grant proposal compliance analysis
- Switch between services and verify session isolation
- Test agent interactions and provenance display
- Verify confidence scoring and expert review recommendations
- Test responsive behavior and accessibility compliance