# Design: Gov-Check Integration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL NPM PACKAGES                               │
│                    (Separate repos, published to npm)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   @17sierra/ui       │  │   @17sierra/lib      │  │  @17sierra/ai-flows  │              │
│  │   (public)      │  │   (public)      │  │   (private)     │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           └───────────────┬────┴────────────────────┘                        │
│                           │ npm install                                      │
│                           ▼                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        17s-mono (Source of Truth)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  apps/gov-check/              ← Application code                            │
│  ├── src/                                                                    │
│  │   ├── app/                 ← Next.js App Router                          │
│  │   ├── components/          ← App-specific components (NOT @17sierra/ui)       │
│  │   ├── ai/                  ← App-specific AI flows                       │
│  │   ├── lib/                 ← App-specific utilities                      │
│  │   └── services/            ← Integration with Strands Agent              │
│  ├── .agent/workflows/        ← AI session guidelines (SYNCS!)              │
│  ├── docs/                    ← App documentation                           │
│  ├── Dockerfile               ← Container definition                        │
│  ├── package.json             ← Uses @17sierra/* from npm                        │
│  └── next.config.ts           ← Next.js configuration                       │
│                                                                              │
│  packages/                    ← Development mirrors of npm packages         │
│  ├── ui/                      → @17sierra/ui (can contribute back)               │
│  ├── lib/                     → @17sierra/lib (can contribute back)              │
│  └── ai-flows/                → @17sierra/ai-flows (can contribute back)         │
│                                                                              │
│  tools/copybara/                                                             │
│  └── gov-check.bara.sky       ← Copybara sync config                        │
│                                                                              │
│  services/                    ← Optional: Strands Agent for AWS collab      │
│  └── strands-agent/           ← Python/FastAPI (if vendored)                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
        │                               ▲
        │ Copybara push                 │ Copybara pull (PR branch)
        ▼                               │
┌─────────────────────────────────────────────────────────────────────────────┐
│                    gov-check Standalone Repo                                 │
│           (github.com/SeventeenSierra/gov-check)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  src/                         ← Synced from monorepo                        │
│  .agent/workflows/            ← Synced! Same AI guidelines                  │
│  docs/                        ← Synced                                      │
│  Dockerfile                   ← Synced                                      │
│  package.json                 ← Transformed (workspace:* → @17sierra/*@version)  │
│  .github/workflows/                                                          │
│  ├── ci.yml                   ← Synced (build, test, lint)                  │
│  └── security.yml             ← Synced (MVS: CodeQL, Dependabot)            │
│  .env.example                 ← Synced (documents required vars)            │
│  CONTRIBUTING.md              ← Instructions for GSA/AWS                    │
│                                                                              │
│  [NOT SYNCED]                                                                │
│  ├── .env.local               ← GitHub Secrets                              │
│  └── .github/workflows/deploy.yml  ← Standalone-specific deploy            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        │ GSA/AWS Contributors
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          External Development                                │
│                                                                              │
│  • Firebase Studio (small enough to fit!)                                   │
│  • Standard git clone workflow                                               │
│  • PRs go to standalone repo                                                 │
│  • Copybara pulls changes back to monorepo                                  │
│  • Full security gate on sync back                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Package Structure

### Current (`inbox/govcheck-1`)

```json
{
  "name": "nextn",
  "dependencies": {
    "@genkit-ai/google-genai": "^1.20.0",
    "@radix-ui/*": "^1.x.x",
    "next": "^15.3.6",
    "react": "^19.2.1",
    // ... 30+ deps inline
  }
}
```

### Target (`apps/gov-check`)

```json
{
  "name": "@17sierra/gov-check",
  "dependencies": {
    "@17sierra/ui": "workspace:*",      // For future shared components
    "@17sierra/lib": "workspace:*",     // For future shared utilities
    "@genkit-ai/google-genai": "^1.20.0",
    "next": "^15.3.6",
    "react": "^19.2.1"
  }
}
```

## What Stays App-Specific

These remain in `apps/gov-check/`, NOT in shared packages:

| Content | Reason |
|---------|--------|
| `src/components/` | Gov-check specific UI |
| `src/ai/` | Genkit flows for compliance analysis |
| `src/lib/` | Gov-check specific utilities |
| Radix UI primitives | Already using directly, no abstraction needed |
| Tailwind config | App-specific design tokens |

## Shared Packages Strategy (Refined)

### Package Overview

| Package | Contents | Visibility |
|---------|----------|------------|
| `@17sierra/lib` | Common utilities (`cn()`), types, zod schemas | Public |
| `@17sierra/ui` | Multi-brand design system (tokens + components) | Public |
| `@17sierra/ai-flows` | Reusable AI patterns (not just Genkit) | **Private** |
| `@17sierra/config` | Shared configs (Tailwind, TypeScript, Biome) | Public |

### AI Flows Package (`@17sierra/ai-flows`)

All 20 apps have AI flows — consolidate shared patterns:

```typescript
// @17sierra/ai-flows
export { 
  // Common patterns
  complianceCheckFlow,
  documentParserFlow,
  summarizationFlow,
  
  // Provider abstractions (not just Genkit)
  createAIClient,
  AIProvider,
  
  // Shared tools
  ragRetrieval,
  structuredOutput,
} from './flows';
```

**Why private?** AI flows may contain proprietary logic, provider credentials patterns, internal SOPs.

### Multi-Brand Design System (`@17sierra/ui`)

The design system uses **CSS custom properties** for multi-brand theming:

```
@17sierra/ui (shared)
├── tokens/
│   ├── base.css           # Semantic tokens (--color-primary, etc.)
│   └── components.css     # Component tokens
├── components/
│   └── Button.tsx         # Uses tokens, brand-agnostic
└── themes/
    ├── default.css        # Default brand values
    └── gov-check.css      # Gov-check specific overrides

apps/gov-check (app-specific)
├── styles/
│   └── theme.css          # Imports @17sierra/ui + local overrides
└── tailwind.config.ts     # Points to theme, extends tokens
```

**Heavy lifting**: Design system handles layouts, interactions, accessibility
**App-specific**: Brand colors, typography scale, custom variants

### For Now (Gov-Check v1)

Keep everything inline. Extract after patterns stabilize across 2-3 apps:

- [ ] Ship gov-check with inline components
- [ ] Ship 1-2 more apps
- [ ] Identify common patterns
- [ ] Extract to shared packages

## Copybara Transformations

### Push (Monorepo → Standalone)

1. Move `apps/gov-check/` → root
2. Transform `workspace:*` → actual npm versions
3. Add standalone `.github/workflows/` (lightweight)
4. Add `CONTRIBUTING.md` for external contributors
5. **Exclude** `.env*` files (never sync secrets!)

### Pull (Standalone → Monorepo)

1. Move root → `apps/gov-check/`
2. Transform npm versions → `workspace:*`
3. Remove standalone-specific files
4. Preserve any new `.env.example` entries

## Environment Variables Strategy

### What Syncs

| Item | Syncs? | Notes |
|------|--------|-------|
| `.env.example` | ✅ Yes | Documents required vars |
| `.env.local` | ❌ No | Contains secrets |
| `.env.*.local` | ❌ No | Contains secrets |
| Infisical config | ❌ No | Monorepo-specific |

### Per-Environment Secrets

| Environment | Management |
|-------------|------------|
| **Monorepo** | Infisical (centralized) |
| **Standalone** | GitHub Secrets (per-repo) |
| **Firebase Studio** | Project-level secrets |
| **Production** | Cloud Secret Manager |

### Copybara `.gitignore` Handling

```python
# Exclude secrets from sync
origin_files = glob(["apps/gov-check/**"], exclude = [
    "**/.env",
    "**/.env.local",
    "**/.env.*.local",
])
```

## CI/CD Strategy: Monorepo vs Standalone

### Monorepo (Full Security Gate)

All the heavy lifting happens here:

- ✅ Full SAST scanning (Semgrep, custom rules)
- ✅ SCA / Dependency audit (npm audit + Snyk/Trivy)
- ✅ License compliance checks
- ✅ AI zone validation
- ✅ Complete E2E tests
- ✅ Multi-app integration tests
- ✅ Container image scanning
- ✅ Production deployment gates

### Standalone (Minimum Viable Security + Development Velocity)

**Philosophy**: Security designed in, not bolted on — but fast and non-blocking.

### Standalone Security Matrix

| Category | Tool | Blocking? | When |
|----------|------|-----------|------|
| **Secret Detection** | GitHub Secret Scanning | 🔴 Yes | Push |
| **Dependency Audit** | `pnpm audit` / Dependabot | 🟡 Warning | PR |
| **Code Quality** | Biome lint | 🟡 Warning | PR |
| **Type Safety** | TypeScript strict | 🔴 Yes | PR |
| **Basic SAST** | CodeQL (GitHub native) | 🟡 Warning | PR |
| **Container Scan** | Trivy (if containerized) | 🟡 Warning | Build |

### Standalone Workflows (Syncs)

```yaml
# .github/workflows/ci.yml (SYNCS from monorepo)
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck      # 🔴 Blocking
      - run: pnpm lint           # 🟡 Warning only
      - run: pnpm test           # 🔴 Blocking
      - run: pnpm build          # 🔴 Blocking

  security-quick:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=high  # 🟡 Warning
        continue-on-error: true
```

```yaml
# .github/workflows/security.yml (SYNCS - Minimum Viable)
name: Security Scan
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3

  dependency-review:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: critical  # Only block on critical
```

### What's Built Into GitHub (Free!)

| Feature | What It Does |
|---------|--------------|
| **Secret Scanning** | Blocks pushes containing API keys, tokens |
| **Dependabot** | Auto-creates PRs for vulnerable dependencies |
| **CodeQL** | Basic SAST for common vulnerabilities |
| **Dependency Review** | Shows new vulnerabilities in PR diffs |

### Rationale

> "Monorepo is the full security gate. Standalone has security designed in."

The standalone workflow:
1. **Catches 80% of issues** with 20% of the effort
2. **Uses free GitHub-native tools** — no extra setup
3. **Non-blocking on warnings** — development velocity preserved
4. **Blocking on critical** — secrets, type errors, critical vulns
5. **Weekly scheduled scans** — catches new CVEs

When PRs sync back to monorepo, they go through the full security gate.

### Security Comparison

| Check | Standalone | Synced to Mono |
|-------|------------|----------------|
| Secret scanning | ✅ GitHub native | ✅ + Infisical |
| Dependency audit | ✅ pnpm audit | ✅ + Snyk/Trivy |
| SAST | ✅ CodeQL basic | ✅ + Semgrep |
| Container scan | ⚠️ Optional Trivy | ✅ Full scan |
| License compliance | ❌ Skip | ✅ Full check |
| AI zone validation | ❌ Skip | ✅ Full check |

### What Syncs for CI

```
.github/workflows/
├── ci.yml           # ← Syncs (build, test, lint, quick security)
├── security.yml     # ← Syncs (MVS: CodeQL + Dependency Review)
├── deploy.yml       # ← Syncs (if standalone deployment)
│
└── [monorepo-only]
    ├── full-security.yml    # ❌ Does NOT sync
    ├── license.yml          # ❌ Does NOT sync
    └── ai-zones.yml         # ❌ Does NOT sync
```

## Container Strategy

```dockerfile
# apps/gov-check/Dockerfile
FROM node:22-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

## Correctness Properties

1. **Sync integrity**: Copybara push then pull = identity (no code changes)
2. **Build equivalence**: Both repos produce identical Docker images
3. **Guidelines preservation**: `.agent/workflows/` syncs without modification
4. **Package resolution**: Standalone resolves all deps from npm
5. **Secret isolation**: No secrets ever appear in Copybara diffs
6. **CI differentiation**: Standalone CI is subset of monorepo CI
7. **MVS coverage**: Standalone catches critical vulns; full gate on sync back

## Answered Design Questions

| Question | Decision |
|----------|----------|
| Tailwind CSS | Multi-brand via design system tokens; app-level themes |
| AI flows | Extract to `@17sierra/ai-flows` (private package) |
| Component naming | Defer until patterns emerge across 2-3 apps |
| Standalone CI/CD | MVS: CodeQL + Dependabot + Secret Scanning + pnpm audit |
| Environment vars | Never sync; each environment manages its own |
| Standalone security | Security designed in: blocking on critical, warning on high |
