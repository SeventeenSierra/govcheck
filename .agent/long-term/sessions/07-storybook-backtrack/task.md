# Task: Section 2 - Monorepo Integration (proposal-prepper)

## Session Info
- **Session**: 07-section2-integration
- **AI-Agent**: claude-sonnet-4
- **Previous Session**: 06-section1a-storybook
- **Target**: Create `apps/proposal-prepper` from `inbox/govcheck-1`

---

## 2.1 Create App Structure
- [x] Create `apps/proposal-prepper/` directory
- [x] Create `apps/proposal-prepper/src/` subdirectory structure
- [x] Copy `inbox/govcheck-1/src/app/` → `apps/proposal-prepper/src/app/`
- [x] Copy `inbox/govcheck-1/src/components/` → `apps/proposal-prepper/src/components/`
  - **Exclude** `src/components/ui/` (use `@17sierra/ui` instead)
  - Keep: `agent-interface.tsx`, `report-preview.tsx`, `layout/`
- [x] Copy `inbox/govcheck-1/src/ai/` → `apps/proposal-prepper/src/ai/`
- [x] Copy `inbox/govcheck-1/src/lib/` → `apps/proposal-prepper/src/lib/`
- [x] Copy `inbox/govcheck-1/docs/` → `apps/proposal-prepper/docs/`

## 2.2 Create package.json
- [x] Create `apps/proposal-prepper/package.json` with:
  - Name: `@17sierra/proposal-prepper`
  - Private: true
  - Workspace dependencies: `@17sierra/ui`, `@17sierra/lib`, `@17sierra/ai-flows`
  - App-specific dependencies from inbox version
  - Port: 9002
  - Biome-aligned scripts

## 2.3 Create Configuration Files
- [x] Create `apps/proposal-prepper/next.config.ts`
  - **REMOVE** `ignoreBuildErrors: true`
  - **REMOVE** external image hosts
  - Add output: 'standalone' for container support
- [x] Create `apps/proposal-prepper/tsconfig.json`
  - Extend `@17sierra/config/tsconfig.json`
  - Target: ES2022
  - Path aliases for `@/*` → `./src/*`
- [x] Copy `inbox/govcheck-1/tailwind.config.ts` → `apps/proposal-prepper/`
- [x] Copy `inbox/govcheck-1/postcss.config.mjs` → `apps/proposal-prepper/`
- [x] Copy `inbox/govcheck-1/next-env.d.ts` → `apps/proposal-prepper/`

## 2.4 Transform Imports
- [x] Transform `@/components/ui/*` → `@17sierra/ui` in:
  - [x] `agent-interface.tsx`
  - [x] `report-preview.tsx`
  - [x] `layout/sidebar.tsx`
  - [x] `layout/top-bar.tsx`
- [ ] Transform `@/lib/utils` (cn) → `@17sierra/lib` (if used)
- [ ] Transform `@/hooks/use-toast` → `@17sierra/ui` (if used)

## 2.5 Create .agent Guidelines
- [x] Create `apps/proposal-prepper/.agent/workflows/` directory
- [x] Symlink `human-ai-pair-programming.md`

## 2.6 AI Provider Abstraction (Option B)
- [x] Create `@17sierra/ai-flows/src/types.ts`:
  - [x] Define `AIProvider` interface with `summarize()` and `recommend()` methods
  - [x] Define input/output types (`SummarizeInput`, `SummarizeOutput`, etc.)
  - [x] Define `AIProviderConfig` discriminated union for provider selection
- [x] Create `@17sierra/ai-flows/src/providers/` directory
- [x] Create `providers/genkit.ts` implementing `AIProvider` using existing flows
- [x] Create `providers/strands.ts` placeholder (TODO comments for HTTP implementation)
- [x] Create `providers/index.ts` barrel export
- [x] Update `@17sierra/ai-flows/src/index.ts` to export new types and providers
- [x] Create `apps/proposal-prepper/src/ai/provider.ts` to instantiate provider
- [ ] Remove `apps/proposal-prepper/src/ai/genkit.ts` (deferred - local flows still use it)
- [ ] Update any app code that imported directly from local ai/

## 2.7 Fix TypeScript Errors
- [x] Run `pnpm install` from root
- [x] Run typecheck and fix any errors
- [x] Ensure no `ignoreBuildErrors` workarounds

## 2.8 Create Placeholder Images
- [x] ~~Generate or create local placeholder images as needed~~ (N/A - no images in app)
- [x] ~~Remove any external image URLs from code~~ (N/A - none found)

## 2.9 Validate Build
- [x] Run `pnpm --filter @17sierra/proposal-prepper typecheck`
- [x] Run `pnpm --filter @17sierra/proposal-prepper lint`
- [x] Run `pnpm --filter @17sierra/proposal-prepper format`
- [x] Run `pnpm --filter @17sierra/proposal-prepper build`
- [x] Run `pnpm --filter @17sierra/proposal-prepper dev`
- [x] Verify app loads at localhost:9002

---

## 2.10 Storybook + Chromatic (App-Level)
- [x] Initialize Storybook for `apps/proposal-prepper`
- [x] Create stories for app components:
  - [x] `agent-interface.stories.tsx` (idle, analyzing, results states)
  - [x] `report-preview.stories.tsx` (visible, hidden states)
  - [x] `layout/sidebar.stories.tsx` (open, closed states)
  - [x] `layout/top-bar.stories.tsx` (default state)
- [x] Configure Chromatic for visual regression testing
- [x] Verify Storybook builds successfully

## 2.11 E2E Tests (Playwright)
- [x] Install Playwright
- [x] Create E2E test structure:
  - [x] `e2e/app.spec.ts` - Basic app loading tests
  - [x] `e2e/navigation.spec.ts` - Navigation flow tests
  - [x] `e2e/responsive.spec.ts` - Responsive design tests (mobile, tablet, desktop)
- [x] Verify all E2E tests pass

---

## Blocking Review Checklist
- [x] Changes match section scope (no extra files)
- [x] No unintended modifications
- [x] Commit message follows commitlint format
- [x] AI Provider abstraction is minimal/future-proof
- [x] Storybook stories cover all app components
- [x] E2E tests pass
- [x] Ready to commit

## Privacy & Licensing Refinements
- [x] Remove sensitive AI implementations from `packages/ai-flows`
- [x] Add LICENSE to `apps/proposal-prepper`
- [x] Update `apps/proposal-prepper/package.json` license
- [x] Update `changes/gov-check-integration/tasks.md`
