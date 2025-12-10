# Section 12: Turbo Generators & Developer Experience

## CRITICAL: Human-AI Pair Programming Workflow
Read and follow: [.agent/workflows/human-ai-pair-programming.md](file:///Users/afla/Documents/GitHub/17s-mono/.agent/workflows/human-ai-pair-programming.md)

## Agent Self-Identification
At session start, identify yourself:
- Check model in UI (bottom of input area)
- State: "I am [Agent] powered by [Model]. Trailer: AI-Agent: [value]"

## Previous Session (11-monorepo-validation)
- **Commit**: 7ffa5de
- **Branch**: feature/monorepo-setup-and-imports
- **AI-Agent**: gemini-2.5-pro
- **What was done**:
    - Validated runtime for `gemini-oracle` and `proposal-parser`
    - Fixed hydration errors (added `suppressHydrationWarning`)
    - Removed deprecated eslint config from next.config.ts
    - Created Gold Standard documentation: `docs/standards/app-structure.md`
- **Session record**: [.agent/sessions/11-monorepo-validation/session-record.md](file:///Users/afla/Documents/GitHub/17s-mono/.agent/sessions/11-monorepo-validation/session-record.md)

## REQUIRED: Read These Files First
1. `.agent/workflows/human-ai-pair-programming.md`
2. `.agent/sessions/11-monorepo-validation/session-record.md`
3. `docs/standards/app-structure.md` (Gold Standard)

## Your Task
**Goal**: Create Turbo generators for new apps/packages and improve developer experience.

1. **Turbo Generator for Apps**:
    - Create `turbo/generators/app/` generator
    - Use `apps/template` as the source
    - Should scaffold with correct licenses and Gold Standard structure

2. **Turbo Generator for Packages**:
    - Create `turbo/generators/package/` generator
    - Scaffold with correct tsconfig, biome, and license

3. **Validate CI/CD Workflow**:
    - Ensure `pnpm run lint`, `pnpm run typecheck`, `pnpm run build` pass

## Key Decisions Already Made
- **Gold Standard**: Documented in `docs/standards/app-structure.md`
- **Relative Paths**: Used for imported apps; workspace protocol for new apps
- **Biome**: Primary linting/formatting tool
- **License**: AGPL-3.0-or-later for apps

## Remaining Backlog (from Session 10)
```
[ ] Architecture Migration: Genkit → Strands (Python/FastAPI)
[ ] Integration Test Suite: Consumer validation for published packages
[ ] License Review: Confirm @17sierra/ai-flows licensing strategy
[ ] branch protection rules
[ ] Infisical (MIT) chosen for flexibility 
[ ] Branch-to-environment mapping configured
[ ] commitlint check
[ ] Configure branch protection rules on GitHub
[ ] Create Turbo generators for new apps/packages  <-- THIS SESSION
[ ] Set up CLA Assistant GitHub App
[ ] Containerization for apps
[ ] Validate CI/CD workflow  <-- THIS SESSION
[ ] Nix configuration management docs
```

## Session Workflow
1. Self-identify model
2. Read previous session + tasks
3. Complete section tasks
4. Present blocking checklist
5. Create session record
6. Wait for human approval
7. Human commits with -s
8. END SESSION
