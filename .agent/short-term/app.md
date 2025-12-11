<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# Application: Proposal Prepper (Contract Checker)

## Application Overview
Proposal Prepper (branded as "Contract Checker" in the UI) is a **microservice-based application** that automates NSF grant proposal compliance checking against the NSF PAPPG 23-1 rulebook. The system uses a **Federated Mesh architecture** to orchestrate analysis across multiple AI services while providing evidence-based validation with educational transparency.

## Core Value Proposition
The application demonstrates what **Agentic AI can do for the acquisition community** by:
- **Transparent Operations**: Every AI decision shows evidence quotes, page citations, and SDK attribution
- **Educational Visibility**: Users see how different AI services work together in the Federated Mesh
- **Vendor Neutrality**: Component provenance shows which service provided each analysis
- **Demo Readiness**: Public Railway deployment with realistic seed data from grant-trace AATB dataset

## Core Features (NSF PAPPG 23-1 Compliance)

### Federated Mesh AI Analysis
- **Multi-Service Orchestration**: Coordinates AWS Strands (Claude 3.5), Google Genkit (Gemini 1.5), and future Semantic Kernel services
- **NSF-Specific Validation**: Validates against NSF PAPPG 23-1 requirements including:
  - Required sections (Project Summary, Project Description, References Cited, Budget Justification, Biographical Sketches)
  - Page limits (Project Summary: 1 page, Project Description: 15 pages)
  - Required subsections (Intellectual Merit, Broader Impacts)
  - Formatting requirements and administrative compliance
- **Evidence-Based Results**: Every finding includes exact quotes, page citations, and reasoning
- **Fuzzy Validation**: Accepts header variations (e.g., "Intellectual Merit of the Work" → "Intellectual Merit")

### Proposal Management
- **Agent Interface**: Interactive AI assistant for proposal guidance
- **Report Preview**: Real-time compliance analysis display
- **Template System**: Pre-built proposal templates for different grant types
- **Version Control**: Track changes and maintain proposal history

### User Interface Components
- **Layout System**: Responsive sidebar and top-bar navigation
- **34 UI Components**: Complete shadcn component library via `@17sierra/ui`
- **Form Validation**: React Hook Form integration with Zod schemas
- **Toast Notifications**: User feedback and status updates

## Application Architecture

### Frontend Structure (Migrated from inbox/govcheck-1)
```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with Inter font
│   ├── page.tsx               # Home page
│   ├── globals.css            # Tailwind + CSS custom properties theming
│   ├── favicon.ico
│   └── api/                   # API routes (Traffic Cop pattern)
│       └── mesh/              # Multi-provider AI routing
├── components/                # React Components
│   ├── agent-interface.tsx    # Main AI interaction component
│   ├── report-preview.tsx     # Compliance report display
│   └── layout/                # Navigation components
│       ├── sidebar.tsx        # App navigation
│       └── top-bar.tsx        # Header with branding
├── ai/                        # AI Configuration
│   ├── provider.ts            # AIProvider configuration
│   └── dev.ts                 # Genkit dev server (optional)
└── lib/
    ├── placeholder-images.ts   # Local image assets (security)
    └── placeholder-images.json
```

### Component Architecture
- **Shared Components**: 34 shadcn components from `@17sierra/ui`
- **App-Specific Components**: Agent interface, report preview, layout
- **AI Integration**: Provider abstraction with Genkit flows
- **Form Components**: React Hook Form with Zod validation

### AI Integration Architecture

#### Current Implementation (Genkit)
- **Flows**: `summarize-compliance-report`, `actionable-recommendations`
- **Provider**: Google Vertex AI / Gemini models
- **Patterns**: Zod schemas for input/output validation
- **Server Actions**: Next.js server actions for AI calls

#### Future Architecture (Strands)
- **Multi-Agent Workflows**: Specialized agents (Researcher, Analyst, Writer)
- **HTTP Integration**: Python FastAPI service with AWS Bedrock
- **Traffic Cop Pattern**: Next.js API routes for provider routing
- **Provider Abstraction**: Seamless switching between Genkit and Strands

### State Management
- **React State**: Local component state for UI interactions
- **Server Actions**: Next.js server actions for AI flows
- **Context API**: Global application state (future)

## User Experience

### Core User Flows
1. **Proposal Analysis**: Upload/paste proposal text for compliance checking
2. **AI Assistance**: Interactive agent provides recommendations and guidance
3. **Report Generation**: View detailed compliance analysis with actionable items
4. **Iterative Improvement**: Apply recommendations and re-analyze

### Key Interactions
- **Agent Interface**: Chat-like interaction with AI assistant
- **Report Preview**: Expandable/collapsible compliance analysis
- **Navigation**: Responsive sidebar with contextual navigation
- **Real-time Feedback**: Toast notifications for user actions

## Technical Implementation Details

### Extracted Components (from Session 02)
**From `inbox/govcheck-1/src/components/ui/` (34 components):**
- Primitives: button, input, textarea, label, checkbox, radio-group, switch, slider
- Layout: card, separator, scroll-area, collapsible, accordion
- Feedback: alert, badge, progress, skeleton, toast, toaster
- Overlay: dialog, alert-dialog, popover, dropdown-menu, sheet, tooltip, menubar
- Data: table, tabs, calendar, carousel, chart, form, select, avatar

**App-Specific Components:**
- `agent-interface.tsx`: Main AI interaction component
- `report-preview.tsx`: Compliance report display
- `layout/sidebar.tsx`: Navigation sidebar
- `layout/top-bar.tsx`: Application header

### AI Flows (Extracted to @17sierra/ai-flows)
```typescript
// Summarization Flow
interface SummarizeInput {
  reportText: string;
}

interface SummarizeOutput {
  summary: string;
}

// Recommendations Flow  
interface RecommendInput {
  nonCompliantText: string;
}

interface RecommendOutput {
  recommendations: Array<{
    recommendation: string;
    regulatoryGuidance?: string;
  }>;
}
```

### Theming & Design System
- **CSS Custom Properties**: Multi-brand theming support
- **Tailwind Configuration**: Custom animations, shadows, Inter font
- **Component Variants**: Class Variance Authority for component styling
- **Responsive Design**: Mobile-first approach with breakpoint system

## Success Metrics (Historical Context)

### Completed Milestones
- [x] **Package Extraction**: Successfully extracted 34 UI components to `@17sierra/ui@0.1.0`
- [x] **Utility Library**: Published `@17sierra/lib@0.1.1` with `cn()` utility
- [x] **AI Flows**: Extracted Genkit patterns to `@17sierra/ai-flows`
- [x] **Storybook Integration**: 34 component stories with interactive examples
- [x] **Build Validation**: All packages build and typecheck successfully
- [x] **Security Compliance**: Package auditing and license compliance

### Current Status
- [x] **Component Library**: Complete shadcn component set with stories
- [x] **AI Integration**: Working Genkit flows for compliance analysis
- [x] **Build System**: Optimized builds with standalone output
- [x] **Testing Infrastructure**: Playwright E2E and Vitest unit testing setup
- [ ] **Standalone Deployment**: Migration from monorepo to standalone repo
- [ ] **External Collaboration**: GSA/AWS partner access via standalone repo

### Quality Requirements
- [x] **Performance**: Core Web Vitals optimization
- [x] **Accessibility**: WCAG 2.1 AA compliance patterns
- [x] **Security**: No external image hosts, package auditing
- [x] **Code Quality**: Biome linting/formatting, TypeScript strict mode
- [ ] **Test Coverage**: Comprehensive E2E and unit test coverage

### Partnership Goals
- **GSA Collaboration**: Enable government partners to contribute via standalone repo
- **AWS Integration**: Support for AWS Bedrock via Strands provider
- **Copybara Sync**: Bidirectional sync between monorepo and standalone
- **Firebase Studio**: Lightweight development environment for partners

## Development Workflow

### AI-Human Collaboration
- **Supervised Development**: AI assists with code generation under human oversight
- **Review Gates**: Mandatory human review for all AI-generated changes
- **Session Documentation**: Comprehensive records of development decisions and rationale
- **Design-First Approach**: Architecture and specifications created before implementation

### Quality Assurance
- **Structured Development**: Follows established patterns for Next.js applications
- **Automated Testing**: Comprehensive test suite with Playwright E2E and Vitest unit tests
- **Visual Testing**: Storybook for component development and visual regression testing
- **Code Quality**: Biome linting, TypeScript checking, and automated formatting

### Deployment & Distribution
- **Standalone Application**: Self-contained Next.js application with all dependencies
- **Container Ready**: Optimized for Docker deployment with standalone output
- **Environment Flexibility**: Configurable for development, staging, and production
- **External Dependencies**: Uses published npm packages for shared functionality