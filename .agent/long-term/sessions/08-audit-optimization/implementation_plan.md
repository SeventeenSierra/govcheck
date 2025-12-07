# Architecture: The ".agent" Protocol (Universal Brain)

**Core Principle**: The `.agent/` directory is the single source of truth for **all** AI tools (Cursor, Antigravity, etc.). It travels with the code.

## 1. Directory Structure (Decentralized)

### Monorepo Root (`/.agent`)
Contains globally shared context and workflows.
```
/.agent/
├── workflows/
│   ├── human-ai-pair-programming.md
│   └── ...
├── rules/
│   └── monorepo-policy.md
└── memory/
    └── root-tasks.md (Cross-cutting work)
```

### Application (`apps/proposal-prepper/.agent`)
Contains the specific "Brain" for this app. This is what you "eject" with the app.
```
apps/proposal-prepper/.agent/
├── memory/
│   ├── tasks.md               <-- The Active Task List
│   └── scratchpad.md          <-- Current context
├── sessions/                  <-- Historical Work Logs
│   ├── 01-planning.md
│   └── ...
├── rules/                     <-- App-specific constraints
│   └── tech-stack.md
└── config.json                <-- Tool-specific bridging (e.g. mapping .gemini features)
```

## 2. The Move (Retroactive)

Instead of `apps/proposal-prepper/activity/`, we move to `apps/proposal-prepper/.agent/`.

**Steps**:
1.  `mkdir -p apps/proposal-prepper/.agent/sessions`
2.  `mkdir -p apps/proposal-prepper/.agent/memory`
3.  **Move**: `changes/gov-check-integration/sessions/*` -> `apps/proposal-prepper/.agent/sessions/`
4.  **Move**: `changes/gov-check-integration/tasks.md` -> `apps/proposal-prepper/.agent/memory/tasks.md`

## 3. Tool Interoperability

To ensure we don't lose features from specific tools (like `.gemini` or `.cursor`):
- We treat `.gemini` (Antigravity's internal cache) as **ephemeral**.
- On startup, Antigravity reads `.agent/memory/tasks.md`.
- On finish, Antigravity writes back to `.agent/memory/tasks.md`.
- **Cursor**: Configured to look at `.agent/rules` for `.cursorrules`.

## 4. Execution

1.  Review and Apply the move.
2.  Update `human-ai-pair-programming.md` to define this standard `.agent` layout.
