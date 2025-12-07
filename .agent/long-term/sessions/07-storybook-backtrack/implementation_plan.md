# Section 2: Monorepo Integration - proposal-prepper

Create the `apps/proposal-prepper` application by migrating code from `inbox/govcheck-1` and integrating with workspace packages.

## Background

The `govcheck-1` inbox code contains:
- 34 shadcn UI components (already extracted to `@17sierra/ui`)
- `cn()` utility (already extracted to `@17sierra/lib`)
- App-specific components: `agent-interface.tsx`, `report-preview.tsx`, `layout/`
- AI flows: Genkit patterns for compliance analysis
- Next.js 15 app with Tailwind CSS

**Key Decision**: App renamed from `gov-check` to `proposal-prepper` (more descriptive).

---

## User Review Required

> [!IMPORTANT]
> **AI Provider Abstraction (Option B)**: Per discussion, we will create a thin abstraction layer in `@17sierra/ai-flows` that allows swapping between Genkit (in-process) and Strands (HTTP) providers. This enables future migration to the Federated Mesh architecture without rewriting app code.

> [!NOTE]
> **Strands Agents Context**: The AI/ML engineer's target architecture uses [Strands Agents](https://strandsagents.com) - a Python-based multi-agent framework for AWS Bedrock. Key patterns:
> - **Multi-Agent Workflows**: Specialized agents (Researcher, Analyst, Writer) working in sequence
> - **Direct passing** of information between workflow stages
> - **Python FastAPI** service exposing HTTP endpoints
> - **Integration via HTTP** from Next.js "Traffic Cop" to Python Strands service

> [!NOTE]
> **TypeDoc**: Deferred to a future "Documentation" section. Not in scope for Section 2.

---

## Proposed Changes

### Apps Directory

#### [NEW] proposal-prepper

New app directory with the following structure:

```
apps/proposal-prepper/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/                    # API routes (Traffic Cop pattern)
│   │   │   └── mesh/               # Future: Multi-provider routing
│   │   │       └── route.ts
│   │   └── favicon.ico
│   ├── components/
│   │   ├── agent-interface.tsx
│   │   ├── report-preview.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       └── top-bar.tsx
│   ├── ai/                         # App-specific AI configuration
│   │   ├── provider.ts             # Uses AIProvider from @17sierra/ai-flows
│   │   └── dev.ts                  # Genkit dev server (optional)
│   └── lib/
│       ├── placeholder-images.ts
│       └── placeholder-images.json
├── docs/
│   └── blueprint.md
├── .agent/
│   └── workflows/
│       └── human-ai-pair-programming.md (symlink)
├── .storybook/           # App-level Storybook
├── e2e/                  # Playwright E2E tests
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
└── next-env.d.ts
```

---

### AI Provider Abstraction

#### [MODIFY] @17sierra/ai-flows

Refactor to enable swapping between Genkit (in-process) and Strands (HTTP) providers:

**New Package Structure:**
```
packages/ai-flows/
├── src/
│   ├── index.ts              # Re-exports all public API
│   ├── types.ts              # AIProvider interface + input/output types
│   ├── providers/
│   │   ├── index.ts          # Provider exports
│   │   ├── genkit.ts         # GenkitProvider (current)
│   │   └── strands.ts        # StrandsProvider (future HTTP-based)
│   └── flows/                # Existing flows (used by GenkitProvider)
│       ├── summarize-compliance-report.ts
│       └── actionable-recommendations.ts
└── package.json
```

**Types (`types.ts`):**
```typescript
// Core provider interface - implement to add new AI backends
export interface AIProvider {
  summarize(input: SummarizeInput): Promise<SummarizeOutput>;
  recommend(input: RecommendInput): Promise<RecommendOutput>;
}

export interface SummarizeInput {
  reportText: string;
}

export interface SummarizeOutput {
  summary: string;
}

export interface RecommendInput {
  nonCompliantText: string;
}

export interface RecommendOutput {
  recommendations: Array<{
    recommendation: string;
    regulatoryGuidance?: string;
  }>;
}

// Factory function for creating providers
export type AIProviderConfig = 
  | { type: 'genkit' }  // In-process Genkit (current)
  | { type: 'strands'; baseUrl: string };  // HTTP to Strands service (future)
```

---

### Configuration Files

#### [NEW] next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // For container support
  // NOTE: No ignoreBuildErrors - must fix actual TS errors
  // NOTE: No external image hosts - use local assets only
};

export default nextConfig;
```

> [!IMPORTANT]
> - **Removed** `typescript.ignoreBuildErrors: true`
> - **Removed** external image hosts (placehold.co, unsplash, picsum)
> - **Added** `output: 'standalone'` for containerization (smaller Docker images, fast cold starts)

---

### Import Transformations

Files requiring import changes:

| File | Transform |
|------|-----------|
| `src/components/agent-interface.tsx` | `@/components/ui/button` → `@17sierra/ui` |
| `src/components/agent-interface.tsx` | `@/components/ui/card` → `@17sierra/ui` |
| `src/components/agent-interface.tsx` | `@/components/ui/textarea` → `@17sierra/ui` |
| `src/components/report-preview.tsx` | `@/components/ui/*` → `@17sierra/ui` |
| `src/components/layout/sidebar.tsx` | `@/components/ui/*` → `@17sierra/ui` |
| `src/components/layout/top-bar.tsx` | `@/components/ui/*` → `@17sierra/ui` |

**Pattern**:
```typescript
// Before
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// After
import { Button, Card, CardContent } from "@17sierra/ui";
```

---

### Files NOT Copied (already extracted)

| Source | Reason |
|--------|--------|
| `src/components/ui/*` (34 files) | Already in `@17sierra/ui` |
| `src/lib/utils.ts` | Already in `@17sierra/lib` |
| `src/hooks/use-toast.ts` | Already in `@17sierra/ui` |

---

## Verification Plan

### Automated Tests

```bash
# From monorepo root
pnpm install
pnpm --filter @17sierra/proposal-prepper typecheck
pnpm --filter @17sierra/proposal-prepper lint
pnpm --filter @17sierra/proposal-prepper format
pnpm --filter @17sierra/proposal-prepper build
```

---

### Storybook + Chromatic (App-Level)

Set up Storybook for app-specific components with Chromatic visual testing.

**Components to document**:
- `agent-interface.tsx` (idle, analyzing, results states)
- `report-preview.tsx` (visible, hidden states)
- `layout/sidebar.tsx` (open, closed states)
- `layout/top-bar.tsx` (default state)

---

### E2E Tests (Playwright)

Add Playwright E2E tests:

**Test files**:
```
apps/proposal-prepper/e2e/
├── app.spec.ts          # Basic app tests
├── navigation.spec.ts   # Navigation flow tests
└── responsive.spec.ts   # Responsive design tests
```

---

## Session Metadata

- **Section**: 2 (Monorepo Integration)
- **Commit Boundary**: Yes
- **AI-Agent**: claude-sonnet-4
- **Decisions Made**:
  - AI Provider Abstraction: Option B (thin abstraction now)
  - TypeDoc: Deferred to future section
  - Storybook + Chromatic: Part of verification
  - E2E Tests: Playwright, similar to prior attempt

## Privacy & Licensing Refinements (Post-Review)

### AI IP Protection (`@17sierra/ai-flows`)
To protect "crown jewels" IP while keeping the monorepo public:
- **Action**: Remove sensitive implementations from `packages/ai-flows` in this repo.
  - [DELETE] `src/flows/*.ts` (Specific Genkit flows/prompts)
  - [DELETE] `src/providers/genkit.ts` (In-process implementation)
- **Result**: `packages/ai-flows` becomes a pure interface/client package containing:
  - `AIProvider` interface
  - `StrandsProvider` (HTTP client to private service)
  - `MockProvider` (optional, for testing)

### Proposal Prepper Licensing
- **Action**: Apply `PolyForm Strict License 1.0.0` to `apps/proposal-prepper`.
  - [NEW] `apps/proposal-prepper/LICENSE` (Copy from root)
  - [MODIFY] `apps/proposal-prepper/package.json` (Add license field)

### Task Tracking
- **Action**: Sync progress to `changes/gov-check-integration/tasks.md`.
