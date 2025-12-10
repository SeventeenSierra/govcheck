# AI Autonomy Zones

## Concept

As AI agents (MCPs, Renovate, Jules, Copilot) become more autonomous, we need:
1. **Trust zones**: Which code areas allow autonomous changes
2. **Human involvement levels**: Tracking how much human review occurred
3. **Audit trail**: Who/what touched the code and when

---

## Trust Zones

```
┌─────────────────────────────────────────────────────────────────┐
│ ZONE 0: FULL AUTONOMY (No human required)                       │
│─────────────────────────────────────────────────────────────────│
│ • Dependency updates (Renovate)                                 │
│ • Formatting/linting fixes                                      │
│ • Documentation typo fixes                                      │
│ • Test file updates (non-security)                              │
│ • package.json version bumps                                    │
│ • Lock file regeneration                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ZONE 1: AUTO-MERGE AFTER CI (Human notified, can block)        │
│─────────────────────────────────────────────────────────────────│
│ • Non-security bug fixes                                        │
│ • UI component changes (design system)                          │
│ • API error message improvements                                │
│ • Performance optimizations (benchmarked)                       │
│ • Refactoring (no behavior change)                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ZONE 2: HUMAN REVIEW REQUIRED (1 approval)                     │
│─────────────────────────────────────────────────────────────────│
│ • New features                                                  │
│ • Business logic changes                                        │
│ • Database schema changes                                       │
│ • API contract changes                                          │
│ • Configuration changes                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ZONE 3: SECURITY REVIEW (2 approvals, security team)           │
│─────────────────────────────────────────────────────────────────│
│ • Authentication/authorization code                             │
│ • Cryptography                                                  │
│ • Secrets handling                                              │
│ • CI/CD workflows                                               │
│ • Security policies                                             │
│ • License files                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ZONE 4: HUMAN ONLY (AI cannot modify)                          │
│─────────────────────────────────────────────────────────────────│
│ • CODEOWNERS                                                    │
│ • .ai-zones.yaml (this file)                                    │
│ • root LICENSE                                                  │
│ • CLA.md, DCO.md                                                │
│ • Signing keys                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Human Involvement Levels

Track in commit trailers:

```
Human-Involvement: full      # Human wrote, AI assisted
Human-Involvement: reviewed  # AI wrote, human reviewed  
Human-Involvement: approved  # AI wrote, human approved (didn't review line-by-line)
Human-Involvement: automated # Fully autonomous (Renovate, etc.)
```

---

## Configuration: `.ai-zones.yaml`

```yaml
zones:
  full-autonomy:
    paths:
      - "pnpm-lock.yaml"
      - "**/*.lock"
      - ".changeset/*.md"
    agents: ["renovate", "dependabot"]
    merge: auto
    
  auto-merge-ci:
    paths:
      - "apps/*/src/**/*.test.ts"
      - "packages/ui/**"
      - "docs/**/*.md"
    agents: ["jules", "copilot", "cursor"]
    merge: auto-after-ci
    human-notify: true
    
  human-required:
    paths:
      - "apps/*/src/**"
      - "packages/*/src/**"
    agents: ["jules", "copilot"]
    merge: require-approval
    approvals: 1
    
  security-review:
    paths:
      - "**/auth/**"
      - "**/security/**"
      - ".github/workflows/**"
      - "**/*secret*"
    agents: ["jules"]  # Limited agents
    merge: require-approval
    approvals: 2
    required-reviewers: ["security-team"]
    
  human-only:
    paths:
      - "CODEOWNERS"
      - ".ai-zones.yaml"
      - "LICENSE"
      - "CLA.md"
    agents: []  # No AI can touch
    merge: human-only
```

---

## Audit Trail

Every commit includes:

```
feat(ui): improve button accessibility

AI-Agent: jules
AI-Session: abc123
Human-Involvement: reviewed
Reviewed-By: alice <alice@example.com>
Zone: auto-merge-ci
CI-Passed: true
Signed-off-by: alice <alice@example.com>
```

---

## Workflow Integration

### GitHub Actions Check

```yaml
- name: Validate AI Zone
  run: |
    ZONE=$(./scripts/get-zone.sh ${{ github.event.pull_request.files }})
    if [[ "$ZONE" == "human-only" && "${{ github.actor }}" == *"bot"* ]]; then
      echo "::error::AI cannot modify files in human-only zone"
      exit 1
    fi
```

### Auto-merge Logic

```yaml
- name: Auto-merge if allowed
  if: |
    github.actor == 'renovate[bot]' &&
    steps.zone.outputs.zone == 'full-autonomy'
  run: gh pr merge --auto --squash
```
