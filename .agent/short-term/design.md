# Design: Monorepo Template Factory (Revised)

## 1. Goal
Create `apps/template` as a "Golden Master" and `scripts/create-app.ts` to scaffold new apps with **full SSDF compliance** baked in.

---

## 2. Template Directory Structure (`apps/template`)

```
apps/template/
├── .agent/                     # AI Agent Memory (Decentralized)
│   ├── short-term/
│   │   ├── tasks.md
│   │   ├── context.md
│   │   └── scratchpad.md
│   └── long-term/
│       ├── sessions/
│       └── knowledge/
│
├── docs/                       # App-Specific Documentation
│   ├── README.md               # App Overview
│   ├── adr/                    # Architecture Decision Records
│   └── runbooks/               # Operational Runbooks
│
├── e2e/                        # End-to-End Tests (Playwright)
│   └── example.spec.ts
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css         # Tailwind 4 CSS-first
│   └── components/             # App-Specific Components
│
├── .storybook/                 # Storybook Config (Optional)
│
├── biome.json                  # Linting/Formatting (inherits root)
├── next.config.ts
├── package.json                # @17sierra/<app-name>
├── playwright.config.ts
├── postcss.config.mjs          # Tailwind 4 PostCSS
├── tailwind.config.ts          # Tailwind 4 Config
└── tsconfig.json
```

### Key SSDF Features Included
| Artifact          | Source              | Purpose                       |
|-------------------|---------------------|-------------------------------|
| `.agent/`         | App-Local           | Per-App AI Memory             |
| `docs/adr/`       | App-Local           | App-Level ADRs                |
| `docs/runbooks/`  | App-Local           | Operational Docs              |
| `e2e/`            | App-Local           | E2E Testing (Playwright)      |
| `biome.json`      | Extends Root        | Linting/Formatting            |

> **Note**: Monorepo-level SSDF artifacts (`SECURITY.md`, `LICENSING.md`, `DCO.md`, etc.) live at the **root** and are NOT duplicated per-app.

---

## 3. `scripts/create-app.ts` CLI

### Usage
```bash
pnpm create-app <app-name>
```

### Logic
1. **Validate**: `<app-name>` is kebab-case, doesn't exist.
2. **Copy**: `apps/template` → `apps/<app-name>`.
3. **Transform**:
   - Update `package.json` name to `@17sierra/<app-name>`.
   - Clear `.agent/short-term/*.md` content (retain structure).
4. **Output**: Success message with next steps.

---

## 4. Dependencies (Template `package.json`)

### Production
- `next`, `react`, `react-dom` (v15, v19)
- `@17sierra/ui`, `@17sierra/lib` (workspace:*)

### Development
- `tailwindcss`, `@tailwindcss/postcss`, `postcss` (v4 stack)
- `@17sierra/config` (workspace:*)
- `@playwright/test`, `typescript`
