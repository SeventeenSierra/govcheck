<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# Current Session Context

> **AI: Read this file and `.agent/AGENT_RULES.md` at session start.**

## Rules
Follow `.agent/AGENT_RULES.md`

---

## Current Work
**Task**: ✅ Validate AI Flows via `proposal-prepper` - COMPLETE

### Results
- `proposal-prepper` running successfully with `@17sierra/ai-flows@0.2.0` from Artifact Registry
- All 10 apps updated from `workspace:*` to `^0.2.0`
- Monorepo now resolves `@17sierra/ai-flows` from private registry

### Architecture (Finalized)
1. **Private/Real**: `.private/packages/ai-flows` (symlink) → `@17sierra/ai-flows@0.2.0` (Artifact Registry)
2. **Public/Stub**: TBD - Will publish to npm as `@17sierra/ai-flows` for ejected apps without auth
3. **App Usage**: All apps use `@17sierra/ai-flows": "^0.2.0"` (resolved via `.npmrc`)

### This Session Completed
- [x] Verified `GenkitProvider` in private package
- [x] Published `@17sierra/ai-flows@0.2.0` to Artifact Registry
- [x] Restructured `.private/packages/ai-flows/`
- [x] Created root `.npmrc` for Artifact Registry routing
- [x] Updated all 10 apps to registry version
- [x] Tested `proposal-prepper` - runs on localhost:9002

### Deferred
- [ ] Publish stub to npm (public fallback for ejected apps)

### Previous Session
- **Date**: 2025-12-08
- **AI-Agent**: gemini-2.5-pro (Antigravity)
- **What was done**:
  - Removed AI code from public monorepo git history (git filter-repo)
  - Created private repo `SeventeenSierra/17sierra-ai-flows`
  - Set up Google Artifact Registry (us-east1, project: dev-tools-475316)
  - Published `@17sierra/ai-flows@0.1.0` to private registry
  - Published `@17sierra/ai-flows-stub@0.1.0` to public npm
- **Commits**:
  - `921b451` docs(agent): add focused workflow documentation
  - `be8429a` docs(agent): add core rules and session context
  - `f9f6b7f` chore(nix): add google-cloud-sdk to dev environment

---

## Key Decisions Already Made
- **Option A (flat structure)** for private ai-flows repo — flows organized by category
- **Google Artifact Registry** in us-east1 for private npm hosting
- **Dual-package approach**: real package (private) + stub (public npm)
- Temporarily excluded flows need Firebase refactoring before adding back
- Design-first is the default workflow
- Human signs off commits (AI cannot use -s)

## Published Packages
| Package | Registry | Version |
|---------|----------|---------|
| `@17sierra/ai-flows` | Google Artifact Registry | 0.2.0 |
| `@17sierra/ai-flows-stub` | npm (public) | 0.1.0 *(needs 0.2.0 publish)* |

## Backlog
- Refactor excluded flows (conversation/, design-system/, content/) - require Firebase refactoring
- Configure CI/CD with Artifact Registry auth
- Update remaining apps using `@17sierra/ai-flows`

### Next Session Priorities
1. Migrate app-specific flows (`gemini-oracle`, `design-system`, `kakoru`) to shared package
2. Update monorepo scripts with learnings from today's sessions
3. Get all apps to build/typecheck successfully
