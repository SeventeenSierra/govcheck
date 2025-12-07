# Task: Storybook + Proposal Prepper Integration

## Goal
1. Add Storybook stories to `@17sierra/ui` (Section 1.A)
2. Migrate `inbox/govcheck-1` to `apps/proposal-prepper/` (Section 2)

---

## Section 1.A: Add Storybook Stories (Backtrack)

### 1.A.1: Tier 1 Stories (Most Used)
- [x] button ✅
- [x] card ✅
- [x] input ✅
- [x] dialog ✅
- [x] select ✅
- [x] checkbox ✅
- [x] badge ✅
- [x] tabs ✅

### 1.A.2: Tier 2 Stories (Demo Critical)
- [x] toast/toaster ✅
- [x] progress ✅
- [x] accordion ✅
- [x] alert/alert-dialog ✅
- [x] form ✅
- [x] table ✅

### 1.A.3: Tier 3 Stories (Complete Coverage)
- [x] avatar ✅
- [x] calendar ✅
- [x] carousel ✅
- [x] chart ✅
- [x] collapsible ✅
- [x] dropdown-menu ✅
- [x] label ✅
- [x] menubar ✅
- [x] popover ✅
- [x] radio-group ✅
- [x] scroll-area ✅
- [x] separator ✅
- [x] sheet ✅
- [x] skeleton ✅
- [x] slider ✅
- [x] switch ✅
- [x] textarea ✅
- [x] tooltip ✅

### 1.A.4: Verify Storybook
- [x] Run `pnpm --filter @17sierra/ui storybook` ✅
- [x] Run `pnpm --filter @17sierra/ui build-storybook` ✅
- [x] All stories render without errors ✅

---

## Section 2: Create apps/proposal-prepper

### 2.1: Create App Structure
- [ ] Create `apps/proposal-prepper/` directory
- [ ] Copy app-specific files (keeping `src/` structure):
  - [ ] `src/app/` (page.tsx, layout.tsx, globals.css, favicon.ico)
  - [ ] `src/components/layout/` (sidebar.tsx, top-bar.tsx)
  - [ ] `src/components/agent-interface.tsx`
  - [ ] `src/components/report-preview.tsx`
  - [ ] `src/lib/placeholder-images.*`
  - [ ] `docs/blueprint.md`
- [ ] DO NOT copy (already in packages):
  - `src/components/ui/` → use @17sierra/ui
  - `src/lib/utils.ts` → use @17sierra/lib
  - `src/hooks/use-toast.ts` → use @17sierra/ui
  - `src/ai/flows/` → use @17sierra/ai-flows

### 2.2: Create package.json
- [ ] Create `apps/proposal-prepper/package.json`
  - Name: `@17sierra/proposal-prepper`
  - Dependencies: workspace packages + app-specific
  - No external image hosts (security)

### 2.3: Update Imports
- [ ] `@/components/ui/*` → `@17sierra/ui`
- [ ] `@/lib/utils` → `@17sierra/lib`
- [ ] `@/hooks/use-toast` → `@17sierra/ui`

### 2.4: Config Files
- [ ] `tsconfig.json` extending `@17sierra/config`
- [ ] `tailwind.config.ts` (app-specific)
- [ ] `next.config.ts` (no external images)
- [ ] `postcss.config.mjs`

### 2.5: Fix TypeScript Errors
- [ ] Remove `ignoreBuildErrors: true`
- [ ] Fix any type errors that surface

### 2.6: Validate Build
- [ ] `pnpm install`
- [ ] `pnpm --filter @17sierra/proposal-prepper typecheck`
- [ ] `pnpm --filter @17sierra/proposal-prepper lint`
- [ ] `pnpm --filter @17sierra/proposal-prepper build`
- [ ] `pnpm --filter @17sierra/proposal-prepper dev`
- [ ] Verify app loads at localhost:9002

---

## Notes
- Keep `src/` structure (matches standalone after Copybara sync)
- ES2022 target is now standardized in @17sierra/config
- No external image hosts for security
