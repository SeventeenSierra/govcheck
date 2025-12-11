# Repository: Proposal Prepper (Contract Checker)

## Overview
Proposal Prepper (branded as "Contract Checker" in the UI) is a **microservice-based application** using the **Federated Mesh architecture pattern**. The system orchestrates NSF grant proposal compliance checking across multiple AI services (AWS Strands, Google Genkit, Semantic Kernel/Autogen) while providing a unified Next.js frontend for user interaction.

## Architecture Pattern: Federated Mesh
The application follows a **vendor-neutral microservice architecture** where:
- **Next.js Web App** (Port 3000): UI layer and orchestration controller
- **Proposal Parser Service** (Port 8080): Python/FastAPI service with AWS Bedrock (Claude 3.5 Sonnet)
- **Genkit Service** (Port 8081): Node.js service with Google Genkit (Gemini 1.5 Pro)
- **Semantic Kernel Service** (Port 8082): Future C#/.NET service for multi-agent orchestration

This separation enables independent scaling, vendor-neutral interoperability, and transparent "glass box" operations with component provenance tracking.

## Repository Structure (Federated Mesh)

```
proposal-prepper/
├── .agent/                     # AI Agent Memory & Workflows
│   ├── short-term/             # Current project documentation
│   └── workflows/              # Development workflows
│
├── apps/
│   └── web/                    # Next.js Web App (Port 3000)
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   │   ├── api/        # Orchestration API routes
│       │   │   │   ├── upload/ # Document upload endpoints
│       │   │   │   └── analyze/# Analysis orchestration
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/     # React Components
│       │   │   ├── DualDocumentUploadZone.tsx
│       │   │   ├── OrchestrationProgress.tsx
│       │   │   ├── RiskScorecard.tsx
│       │   │   ├── CompetitiveEdgeDashboard.tsx
│       │   │   ├── TransparencyTable.tsx
│       │   │   ├── FixItButton.tsx
│       │   │   └── ProvenanceTag.tsx
│       │   ├── services/       # Service layer
│       │   │   ├── DocumentParserService.ts
│       │   │   ├── OrchestrationService.ts
│       │   │   └── ComplianceScoringService.ts
│       │   └── lib/
│       │       └── utils.ts
│       ├── .storybook/         # Component documentation
│       ├── e2e/               # Playwright E2E tests
│       ├── next.config.ts
│       └── package.json
│
├── services/
│   ├── strands-agent/          # Python/FastAPI Service (Port 8080)
│   │   ├── app/
│   │   │   ├── main.py         # FastAPI application
│   │   │   ├── models.py       # Pydantic models
│   │   │   └── routes/
│   │   │       └── validate_evidence.py
│   │   ├── sops/
│   │   │   └── contract_checker.sop.md  # Claude 3.5 instructions
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── genkit-service/         # Node.js/Genkit Service (Port 8081)
│   │   ├── src/
│   │   │   ├── index.ts        # Genkit application
│   │   │   └── flows/
│   │   │       └── document-extraction.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── semantic-kernel/        # Future: C#/.NET Service (Port 8082)
│       └── (future implementation)
│
├── packages/                   # Shared packages
│   ├── ui/                     # @aatb/ui - Shared components
│   └── lib/                    # @aatb/lib - Shared utilities
│
├── data/
│   └── seed/                   # Grant-trace AATB dataset
│       ├── nsf-proposal-1/
│       │   ├── solicitation.pdf
│       │   ├── proposal.pdf
│       │   └── expected-results.json
│       └── fixtures/
│           └── proposal-1-parsed.json  # Pre-parsed for demos
│
├── docker-compose.yml          # Local development orchestration
├── railway.toml               # Railway.app deployment config
└── pnpm-workspace.yaml        # Workspace configuration
```

## Development Workflow

### Microservice Development
- **Service Independence**: Each service can be developed, tested, and deployed independently
- **Docker Compose**: Local development orchestration across all services
- **API-First Design**: Well-defined interfaces between services
- **Service Discovery**: Internal networking for service-to-service communication

### Version Control
- Git-based version control with conventional commits
- Feature branch workflow with service-specific branches
- Pull request reviews for all changes
- Automated CI/CD pipeline per service

### Code Quality
- **Per-Service Standards**: Each service uses appropriate tooling (Biome for Node.js, Black for Python)
- **TypeScript**: Type safety for Next.js and Genkit services
- **Pydantic**: Type validation for Python FastAPI service
- **Cross-Service Testing**: Integration tests across service boundaries

### Documentation
- **Service Documentation**: Each service has its own README and API docs
- **Architecture Decision Records (ADRs)**: For cross-service architectural decisions
- **Component Documentation**: Storybook for UI components
- **API Documentation**: OpenAPI specs for each service

## Dependencies Management

### Core Dependencies
- **Next.js 15+**: React framework with App Router
- **React 19+**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

### UI Components
- **@17sierra/ui**: Shared component library (34 shadcn components)
- **@17sierra/lib**: Core utilities and helper functions
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### AI Integration
- **@17sierra/ai-flows**: AI provider abstraction layer
- **Genkit**: Google's AI framework for flows and prompts
- **Zod**: Schema validation for AI inputs/outputs

### Development Tools
- **Storybook**: Component development and documentation
- **Playwright**: End-to-end testing
- **Vitest**: Fast unit testing
- **Biome**: Linting and formatting
- **Husky**: Git hooks for quality gates

## Security & Compliance
- Automated dependency vulnerability scanning
- License compliance checking
- Secure secrets management
- Regular security audits and updates

## Project Goals

### Primary Objectives
- **Streamline Proposal Writing**: Reduce time and effort required to create high-quality grant proposals
- **Ensure Compliance**: Automated checking against solicitation requirements (FAR/DFARS, NSF PAPPG, etc.)
- **Improve Quality**: AI-powered content suggestions and structure validation
- **Enable Collaboration**: Support for team-based proposal development and review

### Target Users
- **Grant Writers**: Professionals creating proposals for government and foundation grants
- **Research Teams**: Academic and industry researchers seeking funding
- **Consultants**: Grant writing consultants serving multiple clients
- **Organizations**: Nonprofits, universities, and companies pursuing grant funding

### Success Metrics
- Reduced proposal preparation time (target: 50% reduction)
- Improved compliance scores and success rates
- User satisfaction and adoption rates
- Quality of AI-generated suggestions and recommendations