# Session: Section 1 - Extract Shared Packages

## Metadata
- **Date**: 2025-12-05
- **Session Start**: ~17:00 EST
- **Session End**: ~18:11 EST
- **IDE**: Antigravity (Google DeepMind)
- **AI Model**: Claude Opus 4 (Anthropic)
- **Human**: Alyssa Feola
- **Commits**: 02ac705 (Section 1.1-1.2 partial)

## Summary

Analyzed `inbox/govcheck-1` and created extraction plan. Renamed all packages from `@repo/*` to `@17sierra/*`. Bootstrapped `@17sierra/lib` with `cn()` utility. Established Question ID system for clearer communication.

---

## 🏁 Session End Summary

### What We Accomplished
1. ✅ Analyzed GovCheck source for extractable code (34 components, 1 utility, AI patterns)
2. ✅ Renamed `@repo/ui` → `@17sierra/ui` and `@repo/config` → `@17sierra/config`
3. ✅ Created `@17sierra/lib` package with `cn()` utility (MIT license)
4. ✅ Fixed missing `@vitejs/plugin-react` dependency
5. ✅ Added `*.tsbuildinfo` to `.gitignore`
6. ✅ Documented AI errors and established Question ID system

### What's Ready for Next Session
- `@17sierra/lib` builds and is ready for npm publish
- `@17sierra/ui` exists with Button component, needs remaining 33 shadcn components from GovCheck
- All typechecks pass across 3 apps and 3 packages

### Handoff: Start Here Next Time
1. Read this session record for context
2. Continue with **Section 1.2** (publish @17sierra/lib to npm) OR
3. Continue with **Section 1.3** (add remaining components to @17sierra/ui)
4. Use Question IDs (`[Q1]`, `[Q2]`, etc.) for multi-question scenarios

### Parking Lot (Deferred)
- AI error tracking system (add to workflow)
- Question ID system (add to workflow)
- Style Dictionary alignment review
- Deep dive on tsconfig.json settings

---

## 📊 GovCheck-1 Source Analysis

### Directory Structure
```
inbox/govcheck-1/src/
├── ai/                     # AI flows (Genkit)
│   ├── dev.ts              # Dev server config
│   ├── genkit.ts           # Genkit initialization
│   └── flows/              # AI flow definitions
│       ├── actionable-recommendations.ts
│       └── summarize-compliance-report.ts
├── app/                    # Next.js app router
│   ├── favicon.ico
│   ├── globals.css         # Tailwind + CSS variables
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React components
│   ├── agent-interface.tsx     # App-specific
│   ├── report-preview.tsx      # App-specific
│   ├── layout/                 # App-specific
│   │   ├── sidebar.tsx
│   │   └── top-bar.tsx
│   └── ui/                     # EXTRACTABLE (shadcn)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       └── tooltip.tsx
├── hooks/
│   └── use-toast.ts        # EXTRACTABLE
└── lib/
    ├── placeholder-images.json
    ├── placeholder-images.ts
    └── utils.ts            # EXTRACTABLE (cn utility)
```

---

## 🎯 Extraction Categorization

### @17sierra/lib - Core Utilities

**Extract:**
| File | Contents | Notes |
|------|----------|-------|
| `lib/utils.ts` | `cn()` function | clsx + tailwind-merge wrapper |

**Dependencies needed:**
- `clsx`
- `tailwind-merge`

**Additional exports to add:**
- Common TypeScript types
- Zod schemas if shared
- Any other utility functions

### @17sierra/ui - UI Component Library

**Extract (34 shadcn components):**
All files from `components/ui/`:
- Primitives: `button`, `input`, `textarea`, `label`, `checkbox`, `radio-group`, `switch`, `slider`
- Layout: `card`, `separator`, `scroll-area`, `collapsible`, `accordion`
- Feedback: `alert`, `badge`, `progress`, `skeleton`, `toast`, `toaster`
- Overlay: `dialog`, `alert-dialog`, `popover`, `dropdown-menu`, `sheet`, `tooltip`, `menubar`
- Data: `table`, `tabs`, `calendar`, `carousel`, `chart`, `form`, `select`, `avatar`

**Dependencies needed:**
- `@radix-ui/react-*` (all the Radix primitives)
- `class-variance-authority`
- `@17sierra/lib` (for `cn()`)
- `lucide-react` (icons)
- `react-day-picker` (calendar)
- `embla-carousel-react` (carousel)
- `recharts` (chart)
- `@hookform/resolvers` (form)
- `react-hook-form`
- `tailwindcss-animate`

**Also extract:**
| File | Contents | Notes |
|------|----------|-------|
| `hooks/use-toast.ts` | Toast hook | Goes with toast.tsx |

### @17sierra/ai-flows - AI Patterns (Private)

**Extract:**
| File | Contents | Notes |
|------|----------|-------|
| `ai/genkit.ts` | Genkit initialization | Plugin config, model selection |
| `ai/flows/summarize-compliance-report.ts` | Summarization flow | Zod schemas + prompt pattern |
| `ai/flows/actionable-recommendations.ts` | Recommendations flow | Provider abstraction pattern |

**Key patterns to generalize:**
1. **Genkit initialization** - Move to shared, parameterize plugins/model
2. **Prompt definition pattern** - `ai.definePrompt({ name, input, output, prompt })`
3. **Flow definition pattern** - `ai.defineFlow({ name, inputSchema, outputSchema }, handler)`
4. **Server action pattern** - `'use server'` + exported async function

**Dependencies needed:**
- `genkit`
- `@genkit-ai/google-genai` (optional, per-project)
- `zod` (or from genkit)

---

## 🏠 What Stays App-Specific

### Components (NOT extracted)
| File | Reason |
|------|--------|
| `components/agent-interface.tsx` | GovCheck-specific agent UI |
| `components/report-preview.tsx` | GovCheck-specific report layout |
| `components/layout/sidebar.tsx` | App-specific navigation |
| `components/layout/top-bar.tsx` | App-specific header/branding |

### Files (NOT extracted)
| File | Reason |
|------|--------|
| `app/page.tsx` | App entry point |
| `app/layout.tsx` | App root layout |
| `app/globals.css` | App-specific CSS variables (theme) |
| `lib/placeholder-images.*` | App-specific data |
| `ai/dev.ts` | Dev-only genkit server |

---

## 🎨 Design System Strategy

### CSS Custom Properties (for theming)
From `globals.css`, these CSS variables allow multi-brand theming:

```css
:root {
  --background: 210 40% 98%;
  --foreground: 222.2 84% 4.9%;
  --primary: 244 80% 63%;        /* Purple-ish brand color */
  --primary-foreground: 210 40% 98%;
  --secondary: ...
  --accent: 262 83% 65%;         /* Purple accent */
  --destructive: ...
  --border: ...
  --radius: 0.5rem;
}
```

**Decision**: 
- `@17sierra/ui` ships with **default** theme (can be GovCheck's or a neutral one)
- Each app overrides with their brand colors via CSS custom properties
- No need for complex theming in the package itself

### Tailwind Config Strategy
From `tailwind.config.ts`:
- Uses `hsl(var(--xxx))` color references
- Custom animations for accordion
- Custom `inner-xl` shadow
- Inter font family

**Decision**:
- `@17sierra/config` will provide base Tailwind preset
- Apps extend with their specific content paths and customizations

---

## 📋 Task Breakdown for Section 1

### 1.2 Bootstrap @17sierra/lib
1. [ ] Create `packages/lib/` directory structure
2. [ ] Set up `package.json` with correct peerDependencies
3. [ ] Extract `cn()` utility
4. [ ] Add TypeScript config
5. [ ] Add build script (tsup or similar)
6. [ ] Test locally with `pnpm link`
7. [ ] Publish v0.1.0

### 1.3 Bootstrap @17sierra/ui
1. [ ] Create `packages/ui/` directory structure
2. [ ] Set up `package.json` with all Radix dependencies
3. [ ] Copy all 34 shadcn components
4. [ ] Copy `use-toast.ts` hook
5. [ ] Update imports to use `@17sierra/lib`
6. [ ] Add CSS base (can be injected or documented)
7. [ ] Add TypeScript config
8. [ ] Add build script
9. [ ] Test locally with `pnpm link`
10. [ ] Publish v0.1.0

### 1.4 Bootstrap @17sierra/ai-flows
1. [ ] Create `packages/ai-flows/` directory structure
2. [ ] Set up `package.json` (private: true)
3. [ ] Create `createAI()` factory function (provider-agnostic init)
4. [ ] Create base types for flows (input/output schemas)
5. [ ] Document pattern for app-specific flows
6. [ ] Add TypeScript config
7. [ ] Add build script
8. [ ] Test locally
9. [ ] Publish v0.1.0 to npm (private)

---

## 🔍 Open Questions

### Resolved
1. **Where does `use-toast.ts` go?** → `@17sierra/ui` (it's tightly coupled to toast.tsx)

### Still Open
1. **Should we extract the Genkit flows or just the patterns?**
   - The actual flows (`summarize-compliance-report`, `actionable-recommendations`) are GovCheck-specific
   - But the _pattern_ (schema → prompt → flow) is reusable
   - **Leaning toward**: Export helper functions and example patterns, not the actual flows

2. **How do apps specify their AI provider?**
   - Option A: Each app calls `genkit(...)` with their config
   - Option B: `@17sierra/ai-flows` provides a factory
   - **Leaning toward**: Option A (simpler, apps own their config)

3. **What about form validation schemas?**
   - Zod is used in flows for I/O validation
   - Could be useful to have shared schema patterns
   - **Defer**: Address when we have 2+ apps with shared schemas

---

## ✅ Human Review: APPROVED (2025-12-05 17:20 EST)

### Decisions Finalized

| Decision | Choice | Rationale |
|----------|--------|-----------|
| `use-toast.ts` location | `@17sierra/ui` | Tightly coupled to toast.tsx; can move to @17sierra/hooks later |
| Hooks repo | Defer | Create when we have non-UI hooks (use-debounce, etc.) |
| Default theme | Ships with `@17sierra/ui` | Apps override CSS custom properties |
| Base Tailwind preset | Ships with `@17sierra/config` | Shared animations, colors config |
| AI configuration | Each app owns `genkit()` | Simpler; can evolve later |
| Layout components | App-specific for now | Extract after patterns emerge (2-3 apps) |

### Dependency Strategy

**@17sierra/lib**: Bundle `clsx` and `tailwind-merge` directly.

**@17sierra/ui**:
- `dependencies`: `class-variance-authority`, `@17sierra/lib`
- `peerDependencies`: `react`, `react-dom`, all `@radix-ui/*` 
- `optionalPeerDependencies`: `recharts`, `react-day-picker`, `embla-carousel-react`

Apps install what they use; tree-shaking excludes unused components.

### Parking Lot: Future Layout Extraction

After 2-3 apps exist:
- Analyze common patterns in sidebar, header, navigation
- Consider `@17sierra/ui/layouts` or `@17sierra/layouts`
- Watch for: responsive behaviors, nav patterns, header structures

---

## Next Steps

1. ~~**REVIEW GATE**: Get human approval on this analysis~~ ✅ APPROVED
2. **NOW**: Start with `@17sierra/lib` (smallest, no dependencies on others)
3. **THEN**: `@17sierra/ui` (depends on lib)
4. **LATER**: `@17sierra/ai-flows` (patterns only, may defer)

---

## Files to Reference
- `inbox/govcheck-1/components.json` - shadcn configuration
- `inbox/govcheck-1/package.json` - dependency versions
- `inbox/govcheck-1/tailwind.config.ts` - theme configuration

---

## 📝 Future Reference Notes

### @17sierra/lib and Style Dictionary Alignment
- **Note**: Review how the effort for `@17sierra/lib` aligns with [Style Dictionary](https://amzn.github.io/style-dictionary/)
- Style Dictionary is a build system for design tokens
- May want to investigate: Does our utility approach complement or conflict with token-based design systems?

### Deep Dive: TypeScript Configuration
- **Note**: Schedule a session to walk through `packages/lib/tsconfig.json` in detail
- Topics to cover: module resolution, declaration generation, strict settings, ESM output

### License Alignment
- Checked against `LICENSING.md`: Shared packages (`/packages/lib/`, `/packages/ui/`) should use **MIT** license
- Updated `@17sierra/lib` from Apache-2.0 → MIT to align with strategy

---

## ⚠️ AI Errors This Session

| Time | Error | Impact | Correction |
|------|-------|--------|------------|
| ~17:35 | Presented commit without BLOCKING checklist format | Human had to remind about workflow | Corrected on next attempt |
| ~17:22 | Misinterpreted "start A, evolve B" answer as applying to package naming | Confusion about which question answer addressed | Clarified; user requested Question IDs going forward |

### Deferred: AI Error Tracking System
- **Problem**: AI agents make workflow mistakes that need to be tracked for improvement
- **Proposal**: Create a structured way to log AI errors per session
- **Possible solutions**:
  - Add "AI Errors" section template to session record format
  - Create a centralized log (e.g., `docs/ai-errors.md`) for pattern analysis
  - Add error categories (workflow, code, communication, scope)
  - Track frequency to identify systemic issues
- **Action**: Update `human-ai-pair-programming.md` workflow with error tracking guidance

### Deferred: Question ID System
- **Problem**: When AI asks multiple questions and human answers multiple, context can get confused
- **Solution implemented this session**: Use `[Q1]`, `[Q2]`, etc. for AI questions; human responds with `A1`, `A2`, etc.
- **Action**: Add to workflow documentation as standard practice
