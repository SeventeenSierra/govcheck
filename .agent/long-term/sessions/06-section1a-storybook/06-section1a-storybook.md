# Session: Section 1.A - Storybook Stories (Backtrack)

## Metadata
- **Date**: 2025-12-06
- **AI Agent**: gemini (Antigravity)
- **Human**: afla
- **Commit**: (pending human commit)
- **Duration**: ~45 minutes

## Summary
Created Storybook stories for all 34 UI components in `@17sierra/ui`. This was a backtrack requested by the user before proceeding with Section 2 (proposal-prepper app creation).

## Decisions Made
- **Storybook location**: Option A - stories live in `packages/ui` alongside components
- **Storybook timing**: Option 2 - complete before Section 2
- **Story scope**: Write stories for ALL 34 components (not just Tier 1+2)
- **App name change**: `gov-check` → `proposal-prepper` (more descriptive)
- **Directory structure**: Keep `src/` subdirectory pattern for apps (matches standalone repos)
- **External images**: Removed from next.config.ts for security; will use local assets
- **ES target**: ES2022 standardized in @17sierra/config

## Questions Discussed
- **Q**: All 34 components or just Tier 1+2?
- **A**: All 34 - user confirmed.

- **Q**: External image hosts (placehold.co, unsplash, picsum)?
- **A**: Remove for security, address placeholder images "soonest" - deferred to Section 2.

## Problems Encountered
- **Issue 1**: Storybook 10 TypeScript type issues with components that have required props
- **Resolution**: Used function exports `export const Story = () => (...)` instead of `Story = { render: () => ... }` pattern for components with complex prop requirements (Accordion, Chart, Calendar, etc.)

- **Issue 2**: Naming conflict - `Info` import from lucide-react conflicted with `Info` story name
- **Resolution**: Renamed import to `InfoIcon`

- **Issue 3**: Unused imports causing build failures
- **Resolution**: Removed unused Button imports from tabs.stories.tsx and toast.stories.tsx

- **Issue 4**: Form story was documentation-only, not interactive
- **Resolution**: Added `zod` as devDependency and created 3 interactive Form stories (LoginForm, ProfileForm, WithValidationErrors)

- **Issue 5**: FormLabel turned red on validation error (bad UX)
- **Resolution**: Removed `text-destructive` styling from FormLabel. Labels should stay neutral; only FormMessage shows error color. This is a **component fix**, not just a story fix.

## Context for Next Session
- Storybook is fully set up and building successfully
- Chromatic integration is already configured but not yet activated
- Section 2 (create apps/proposal-prepper) is next
- Placeholder images need to be created/generated as local assets
- The user has a workflow doc at `.agent/workflows/human-ai-pair-programming.md` that should be followed

## Files Changed
- `packages/ui/src/components/*.stories.tsx` (34 new files) - Stories for all UI components
- `.gemini/antigravity/brain/.../task.md` (modified) - Updated task checklist
- `.gemini/antigravity/brain/.../implementation_plan.md` (modified) - Updated plan with decisions

## Storybook Status
- **Running**: http://localhost:6006
- **Build**: `pnpm --filter @17sierra/ui build-storybook` ✅ Completes successfully
- **Output**: `packages/ui/storybook-static/`

## Links
- Workflow: [human-ai-pair-programming.md](file:///Users/afla/Documents/GitHub/17s-mono/.agent/workflows/human-ai-pair-programming.md)
- Main tasks: [tasks.md](file:///Users/afla/Documents/GitHub/17s-mono/changes/gov-check-integration/tasks.md)
