<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# AI Agent Rules (Auto-Applied)

These rules apply to ALL sessions in this repository for the **Proposal Prepper** (Contract Checker) project.

## Core Principles
1. **Design First** - No code without a design document
2. **Test First** - Write tests before implementation
3. **Atomic Commits** - One logical change per commit
4. **Section = Commit** - Each task section ends with human review + commit
5. **AI Follows Human Rules** - AI must follow ALL conventions humans follow
6. **Blocking Review** - AI CANNOT proceed until human confirms ALL checklist items
7. **Microservice Architecture** - Follow Federated Mesh patterns for service communication

## Session Protocol
1. **Self-identify** at start: "I am [Agent] powered by [Model]"
2. **Read** `.agent/session-context.md` for current context
3. **Check environment**: Acknowledge if Nix development shell is needed
4. **Default workflow**: `/design-first` — NO CODE without design.md and task.md
5. **Follow** blocking review before any commit
3.  **Blocking review**: Present checklist before commits, WAIT for human approval
4.  **Human signs off**: Only human runs `git commit -s`
5.  **Session record**: Create `.agent/sessions/<N>/session-record.md`


### Alternative Modes (human must explicitly request)
- **Dialogue** - Exploring requirements, clarifying ambiguity
- **Research** - Investigating tools, libraries, patterns
- **Diagram** - Creating visual documentation only

⚠️ **If no mode specified, assume `/design-first`.**

## Session Workflow (FOLLOW THIS)
```
┌────────────────────────────────────────────────────────┐
│  0. AI self-identifies: model, trailer value           │
│  1. Read: .agent/session-context.md                    │
│  2. Read: previous session record (if continuing)      │
│  3. Create design.md + task.md (if new work)           │
│  4. Execute section tasks                              │
│  5. Present blocking checklist                         │
│  6. ⛔ STOP and WAIT for human approval                │
│  7. Create session record                              │
│  8. Human commits with -s flag                         │
│  9. END or continue to next section                    │
└────────────────────────────────────────────────────────┘
```

## AI Must Follow Human Standards
- ✅ **Strictly follow all commit standards**: You MUST read `/commit-standards` and `commitlint.config.mjs` at the start of every session. All generated commits MUST perfectly match the standard, including:
  - Conventional Commit `type` and `scope`.
  - Body line length (max 100 characters).
  - A blank line between subject and body.
  - ALL required trailers: `AI-Agent` and `Human-Involvement`.
- ✅ Pass all CI checks (pre-commit hooks, tests, linting).
- ✅ Follow code style (Biome configuration).
- ✅ Respect AI zones (see `.ai-zones.yaml`).
- ✅ Human signs off (AI cannot use `-s`).
- ✅ **Use Nix environment**: All development tools available via `nix develop`.
- ✅ **Environment awareness**: Don't run tools outside Nix shell.


## Blocking Review
⛔ **AI CANNOT proceed until human explicitly confirms EACH item.**

After completing a section, AI presents this and **WAITS**:

```markdown
## Section Complete: [Section Name]

### Changes Made
- file1.ts (new) - X lines
- file2.ts (modified) - +X/-Y lines

### BLOCKING Review Checklist
- [ ] Changes match section scope (no extra files)
- [ ] Tests written before implementation
- [ ] No unintended modifications
- [ ] Commit message follows commitlint format with proper scope
- [ ] AI zones respected (check .ai-zones.yaml)
- [ ] Ready to commit

⛔ Waiting for human to check ALL items before proceeding...

### Ready to Commit (copy and run)
\`\`\`bash
git commit -s -m '<type>(<scope>): description

Body.

Human-Involvement: reviewed
AI-Agent: <model>'
\`\`\`
```

**Human checks items → copies command → runs it.**

## Nix Environment Awareness

This project uses **Nix flakes** for reproducible development environments:

- **All development tools** (pnpm, python, biome, etc.) are available via `nix develop`
- **AI cannot run tools directly** without the Nix shell environment
- **When tools are needed**: Inform human to run `nix develop` first
- **Environment validation**: If commands fail, suggest Nix environment setup

**Example AI Response:**
```
I need to run pnpm to check dependencies, but this requires the Nix development 
environment. Please run `nix develop` first, then I can guide you through the 
validation steps.
```

## Microservice Scopes
Use these scopes in commit messages (aligned with commitlint.config.mjs):

**Services:**
- `web` - Next.js web app
- `strands` - Python strands-agent service  
- `genkit` - Node.js genkit service

**Packages:**
- `ui` - @aatb/ui package
- `lib` - @aatb/lib package

**Infrastructure:**
- `docker` - Docker and compose files
- `railway` - Railway deployment
- `ci` - GitHub Actions
- `deps` - Dependencies

**Project Areas:**
- `compliance` - NSF PAPPG compliance logic
- `orchestration` - Federated mesh orchestration
- `api` - API routes and endpoints
- `components` - UI components
- `docs` - Documentation
- `config` - Configuration files
- `security` - Security and secrets
- `tests` - Testing
- `seed` - Seed data and fixtures
- `schemas` - Data schemas and validation

## Session Record
Create `.agent/sessions/<N>/session-record.md` at end of work with:
- Date, AI model, human, summary
- Decisions made, files changed
- Architecture context (which services affected)

---

## ✅ AI MUST DO
- Create design.md before any implementation
- Write tests before implementation code
- STOP at every section boundary
- Present blocking checklist and WAIT
- Use commitlint format with proper microservice scopes
- Follow same standards as human developers
- Create session record before commit
- Read previous session record at start
- **Suggest fresh conversation at section end** (see `/context-management`)
- Respect AI zones and human involvement levels
- **Acknowledge Nix environment**: Inform human when tools need `nix develop`
- **Environment-aware validation**: Use available tools or request human setup

## ❌ AI MUST NOT
- Commit without human checking ALL items
- Skip test tasks
- Bundle multiple sections into one commit
- Continue to next section without explicit approval
- Use non-conventional commit messages or invalid scopes
- Modify files outside section scope or AI zone permissions
- Use `--no-verify` or skip any checks
- Use `git commit -s` flag (sign-off is HUMAN ONLY)
- **Assume context from long-running conversation** (context creep)
- Modify security-sensitive areas without proper human involvement
- **Run development tools without Nix environment** (pnpm, python, etc.)
- **Ignore environment setup requirements** (assume tools are globally available)

---

## References
- `/design-first` - Three-stage workflow (Design → Implement → Archive)
- `/commit-standards` - Detailed commit format with microservice scopes
- `/session-records` - Session documentation guide
- `/context-management` - Preventing context creep
- `.ai-zones.yaml` - AI autonomy zones and permissions
- `commitlint.config.mjs` - Commit validation rules
