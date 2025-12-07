# Updated Implementation Plan

Based on your feedback, here's the revised plan with two sections:
1. **Section 1.A (Backtrack)**: Add Storybook stories to `packages/ui`
2. **Section 2**: Create `apps/proposal-prepper` from inbox

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Directory structure | **Keep `src/`** | Industry standard for monorepos, identical to standalone |
| App name | **proposal-prepper** | More descriptive than gov-check |
| ES target | **ES2022 always** | Target modern output, documented in @17sierra/config |
| External images | **Remove** | Security concern; will use local/CDN in future |
| Storybook location | **packages/ui** | Option A - components live near stories |
| Execution order | **Storybook first** | Option 2 - complete before Section 2 |

---

## Section 1.A: Add Storybook Stories (Backtrack)

> [!NOTE]
> **Good news!** Storybook is already configured in `packages/ui` with Chromatic integration.
> - Storybook 10.1.4 ✅
> - Chromatic addon ✅
> - A11y addon ✅
> - Button story exists ✅
> - Currently running on http://localhost:6006

### What's Missing

Only 1 of 34 components has stories:

| Component | Has Story? |
|-----------|------------|
| button | ✅ |
| accordion | ❌ |
| alert | ❌ |
| alert-dialog | ❌ |
| avatar | ❌ |
| badge | ❌ |
| calendar | ❌ |
| card | ❌ |
| carousel | ❌ |
| chart | ❌ |
| checkbox | ❌ |
| collapsible | ❌ |
| dialog | ❌ |
| dropdown-menu | ❌ |
| form | ❌ |
| input | ❌ |
| label | ❌ |
| menubar | ❌ |
| popover | ❌ |
| progress | ❌ |
| radio-group | ❌ |
| scroll-area | ❌ |
| select | ❌ |
| separator | ❌ |
| sheet | ❌ |
| skeleton | ❌ |
| slider | ❌ |
| switch | ❌ |
| table | ❌ |
| tabs | ❌ |
| textarea | ❌ |
| toast | ❌ |
| toaster | ❌ |
| tooltip | ❌ |

### Proposed Approach

**Priority Tier 1** (most commonly used, do first):
- button ✅ (done)
- card
- input
- dialog
- select
- checkbox
- badge
- tabs

**Priority Tier 2** (important for demo):
- toast/toaster (used in gov-check/proposal-prepper)
- progress
- accordion  
- alert/alert-dialog
- form
- table

**Priority Tier 3** (complete coverage):
- All remaining components

> [!IMPORTANT]
> **Scope question**: Should we write stories for ALL 34 components before Section 2, or just Tier 1 + Tier 2?

---

## Section 2: Create apps/proposal-prepper

### Directory Structure (Using `src/`)

```
apps/proposal-prepper/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── components/
│   │   ├── agent-interface.tsx
│   │   ├── report-preview.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       └── top-bar.tsx
│   └── lib/
│       └── placeholder-images.ts
├── docs/
│   └── blueprint.md
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```
