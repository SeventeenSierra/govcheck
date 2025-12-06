# Proposal: Gov-Check Monorepo Integration

## Context

**GovCheck AI** is a grant proposal compliance analyzer that helps users validate grant proposals against solicitation requirements (FAR/DFARS, NSF PAPPG, etc.). It's currently in `inbox/govcheck-1` — a standalone Next.js app built in Firebase Studio.

### Why This Matters

- **GSA and AWS collaboration**: Partners need access to the codebase
- **Firebase Studio limitation**: Full monorepo is too large for Firebase Studio
- **First Copybara implementation**: Establishes the pattern for 19 more apps

### Source Material

| Location | Description |
|----------|-------------|
| `inbox/govcheck-1` | Current standalone app (simpler, demo-focused) |
| `inbox/17s-mono-attempt1` | Earlier monorepo attempt (more complete architecture) |

## Goals

1. **Bootstrap shared npm packages** using GovCheck as seed content
2. **Integrate gov-check into monorepo** at `apps/gov-check/`
3. **Set up Copybara sync** to standalone `gov-check` repo
4. **Enable GSA/AWS collaboration** via standalone repo
5. **Establish patterns** for the remaining 19 apps

## Non-Goals (This Session)

- Migrating all 20 apps (future sessions)
- Full AI agent integration (depends on AWS Strands work)
- Perfect/complete shared packages (iterate later)

## Success Criteria

- [ ] `@17sierra/lib` published to npm (v0.1.0)
- [ ] `@17sierra/ui` published to npm (v0.1.0)
- [ ] `@17sierra/ai-flows` published to npm (v0.1.0, private)
- [ ] Gov-check runs in monorepo (`pnpm --filter @17sierra/gov-check dev`)
- [ ] **Standalone repo builds independently** (typecheck, lint, build pass)
- [ ] Copybara config syncs bidirectionally
- [ ] GSA/AWS can clone standalone repo and contribute
- [ ] `.agent/workflows/` syncs with the app

## Dependencies (Critical Path)

1. **npm scope**: `@17s` registration (FIRST!)
2. **Package repos**: `17s-ui`, `17s-lib`, `17s-ai-flows` on GitHub
3. **Packages published to npm**: Before standalone can build!
4. **ADR-0002**: Copybara Sync Architecture (✅ Created)
5. **Standalone repo**: `github.com/SeventeenSierra/gov-check`

## Key Insight

> "The standalone repo needs `@17sierra/ui`, `@17sierra/lib`, and `@17sierra/ai-flows` to exist on npm.
> These packages are **Phase 0**, not Phase 2."

GovCheck's existing code becomes the seed for the shared packages.

