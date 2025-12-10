<!--
SPDX-License-Identifier: LicenseRef-AllRightsReserved
SPDX-FileCopyrightText: 2025 Alyssa Feola

Copyright (c) 2025 Alyssa Feola. All rights reserved.

This document is made publicly available for reference and educational purposes.
While publicly accessible, all rights remain reserved. No part of this document
may be reproduced, modified, distributed, or used for commercial purposes without
the prior written permission of the copyright holder, except in the case of brief
quotations embodied in critical reviews and certain other noncommercial uses
permitted by copyright law.

For permission requests, contact: alyssa@seventeensierra.com
-->

# AI Contributor Policy

This policy defines how autonomous AI agents participate in development of the Proposal Prepper (Contract Checker) project.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Trust Zones Overview](#trust-zones-overview)
3. [Approved AI Agents](#approved-ai-agents)
4. [Commit Standards](#commit-standards)
5. [Human Involvement Framework](#human-involvement-framework)
6. [Branch & Workflow Rules](#branch--workflow-rules)
7. [Project-Specific Guidelines](#project-specific-guidelines)
8. [Validation & Examples](#validation--examples)
9. [Legal Considerations](#legal-considerations)
10. [Enforcement](#enforcement)

## Core Principles

1. **AI is a tool, not an author** - Humans are always responsible for AI contributions
2. **Transparency** - All AI involvement is tracked and visible
3. **Graduated autonomy** - Trust zones define what AI can do autonomously
4. **Audit trail** - Every AI action is logged for accountability

## Trust Zones Overview

See [.ai-zones.yaml](/.ai-zones.yaml) for authoritative configuration.

| Zone | Auto-merge | Human Involvement | Typical Files |
|------|------------|-------------------|---------------|
| Zone 0: Full Autonomy | ✅ | None | Lock files, changelogs |
| Zone 1: After CI | ✅ | Notified | Tests, docs, UI components |
| Zone 2: Review Required | ❌ | 1 approval | Features, service code |
| Zone 3: Security Review | ❌ | 2 approvals | Auth, crypto, workflows |
| Zone 4: Human Only | ❌ | AI blocked | Legal docs, configs |

## Commit Standards

### Required Format

All AI-authored commits must follow conventional commit format with required trailers:

```
<type>(<scope>): <description>

[optional body explaining the change]

[optional footer(s)]

AI-Agent: <agent-name>
Human-Involvement: <level>
Signed-off-by: Human Sponsor <human@seventeensierra.com>
```

### Conventional Commit Types & Scopes

| Type | Purpose | Common Scopes | Example |
|------|---------|---------------|---------|
| `feat` | New feature | web, strands, genkit, ui, compliance | `feat(web): add NSF compliance dashboard` |
| `fix` | Bug fix | web, strands, genkit, api, components | `fix(api): resolve validation error` |
| `docs` | Documentation | docs, web, ui, lib | `docs(readme): update setup instructions` |
| `style` | Code formatting | web, ui, components | `style(ui): apply biome formatting` |
| `refactor` | Code restructuring | web, strands, genkit, orchestration | `refactor(orchestration): extract validation logic` |
| `test` | Testing | tests, web, strands, compliance | `test(compliance): add NSF validation tests` |
| `chore` | Maintenance | deps, config, ci | `chore(deps): update dependencies` |
| `ci` | CI/CD changes | ci, docker, railway, security | `ci(docker): add security workflow` |
| `perf` | Performance | web, strands, orchestration | `perf(orchestration): optimize mesh routing` |
| `build` | Build system | docker, railway, config | `build(docker): update compose config` |
| `revert` | Revert commit | any scope | `revert(web): revert dashboard changes` |

### Microservice Scopes

| Category | Scopes | Purpose |
|----------|--------|---------|
| **Services** | `web`, `strands`, `genkit` | Federated Mesh services |
| **Packages** | `ui`, `lib` | Shared component libraries |
| **Infrastructure** | `docker`, `railway`, `ci`, `deps` | Deployment and tooling |
| **Business Logic** | `compliance`, `orchestration`, `api` | Core functionality |
| **Development** | `components`, `tests`, `docs`, `config` | Development workflow |
| **Data** | `seed`, `schemas` | Data and type definitions |
| **Security** | `security` | Security configurations |

## Human Involvement Framework

### Involvement Levels Defined

| Level | Definition | When to Use |
|-------|------------|-------------|
| `full` | Human wrote code, AI assisted | Complex logic, architecture decisions |
| `reviewed` | AI wrote, human reviewed line-by-line | Features, fixes, critical changes |
| `approved` | AI wrote, human approved without line review | Documentation, tests, formatting |
| `automated` | Fully autonomous, no human involvement | Dependency updates, lock files |

### Commit Type Requirements

Different commit types require different oversight levels based on risk:

| Commit Type | Min. Human Involvement | Rationale |
|-------------|----------------------|-----------|
| **High Risk** | | |
| `feat` | `reviewed` | New features affect user experience |
| `fix` | `reviewed` | Bug fixes can introduce regressions |
| `refactor` | `reviewed` | Code restructuring can introduce bugs |
| `ci` | `reviewed` | CI/CD changes affect deployment security |
| `perf` | `reviewed` | Performance changes affect system behavior |
| **Medium Risk** | | |
| `docs` | `approved` | Documentation needs accuracy check |
| `test` | `approved` | Tests improve quality, low production risk |
| `chore` | `approved` | Maintenance tasks are typically safe |
| `build` | `approved` | Build configs are usually low-risk |
| `style` | `approved` | Formatting changes are mechanical |

### Zone Override Matrix

Zones can elevate requirements beyond commit type minimums:

| Zone | Override Rule | Example |
|------|---------------|---------|
| **Zone 0** | Always `automated` | Lock files, changelogs |
| **Zone 1** | Minimum `approved` | UI components, tests |
| **Zone 2** | Minimum `reviewed` | Service code, features |
| **Zone 3** | Always `full` | Security, auth, crypto |
| **Zone 4** | Always `full` | Legal docs, core configs |

## Legal Considerations

### Copyright
- AI-generated code cannot be copyrighted by AI (Thaler v. Perlmutter, 2023)
- Copyright belongs to human sponsor who directed the AI
- Human sponsor must have signed the CLA

### CLA
- AI cannot sign legal agreements
- Human sponsor signs on behalf of AI contributions
- Sponsor assumes responsibility for AI output

### DCO
- Human sponsor must sign off (`Signed-off-by:`)
- This attests the human authorized the AI to make these changes

## Approved AI Agents

### AI Development Assistants
| Agent | Class | Allowed Zones | Capabilities |
|-------|-------|---------------|--------------|
| **Kiro** | IDE Assistant | 0-3 | Full development workflow, security review |
| **Antigravity** | IDE Assistant | 0-3 | Google DeepMind integration, security review |
| **Cline** | IDE Assistant | 0-2 | VS Code extension, general development |
| **Jules** | IDE Assistant | 0-3 | Google AI assistant, security review |
| **GitHub Copilot** | Code Completion | 0-2 | Code suggestions with human oversight |
| **Cursor** | IDE Assistant | 0-2 | AI-powered code editor |
| **Gemini** | Chat Assistant | 0-2 | Google AI chat interface |

### Automation Agents
| Agent | Class | Allowed Zones | Purpose |
|-------|-------|---------------|---------|
| **Renovate** | Dependency Bot | 0, 1 | Automated dependency updates |
| **Dependabot** | Security Bot | 0 | Security vulnerability patches |
| **Release Please** | Release Bot | 0, 1 | Automated version releases |

## Environment Configuration

AI agents should set:

```bash
export HUSKY=0  # Skip pre-commit hooks
export CI=true  # Non-interactive mode
```

See [.agent/config.yaml](/.agent/config.yaml) for full configuration.

## Branch & Workflow Rules

### Branch Access Permissions

| Branch Pattern | AI Direct Push | Allowed Commit Types | Notes |
|----------------|----------------|---------------------|-------|
| **Feature Branches** | | | |
| `feature/*` | ✅ Yes | `feat`, `docs`, `test` | Feature development from develop |
| `fix/*` | ✅ Yes | `fix`, `test`, `docs` | Bug fixes from develop |
| `docs/*` | ✅ Yes | `docs`, `style` | Documentation updates |
| `refactor/*` | ✅ Yes | `refactor`, `test`, `docs` | Code improvements |
| `test/*` | ✅ Yes | `test`, `docs` | Test additions |
| `chore/*` | ✅ Yes | `chore`, `ci`, `build` | Maintenance |
| **Protected Branches** | | | |
| `develop` | ❌ PR only | All types (via PR) | Integration branch - main development |
| `release/*` | ❌ PR only | `chore`, `docs`, `fix` only | Release preparation from develop |
| `hotfix/*` | ❌ PR only | `fix` only | Critical fixes from main |
| `main` | ❌ Never | Human only | Production releases only |

### Scope Validation Rules

AI agents must use appropriate scopes based on the files being modified:

| File Pattern | Required Scope | Zone |
|--------------|----------------|------|
| `apps/web/**` | `web` | 2+ |
| `services/strands-agent/**` | `strands` | 3 (security) |
| `services/genkit-service/**` | `genkit` | 2+ |
| `packages/ui/**` | `ui` | 1+ |
| `packages/lib/**` | `lib` | 1+ |
| `docker-compose.yml` | `docker` | 4 (human-only) |
| `railway.toml` | `railway` | 4 (human-only) |
| `.github/workflows/**` | `ci` | 3 (security) |
| `**/*.md` | `docs` | 1+ |
| `**/package.json` | `deps` | 0+ |

### Workflow Requirements

1. **Scope-Path Validation**: Commit scope must match modified file paths
2. **Feature branches**: AI can push directly (subject to zone rules)
3. **Pull requests**: Required for protected branches
4. **Code review**: Automatic based on zone, commit type, and scope
5. **CI validation**: Must pass before any merge
6. **Human sign-off**: Required for all AI contributions

## Project-Specific Guidelines

### Federated Mesh Architecture

| Component | Zone | Special Rules |
|-----------|------|---------------|
| **Service APIs** | Zone 2+ | Cross-service changes need human review |
| **Service Integration** | Zone 3 | Security review for service-to-service auth |
| **Orchestration Logic** | Zone 2 | Business logic requires human oversight |

### NSF PAPPG 23-1 Compliance

| Component | Zone | Rationale |
|-----------|------|-----------|
| **Compliance Logic** | Zone 2+ | Core business functionality |
| **SOP Files** | Zone 3 | Claude 3.5 Sonnet instructions are security-sensitive |
| **Seed Data** | Zone 1 | Test data is low-risk |
| **Validation Rules** | Zone 2+ | Affects compliance accuracy |

### Infrastructure & Deployment

| Component | Zone | Access Level |
|-----------|------|--------------|
| **Railway Config** | Zone 4 | Human-only (deployment critical) |
| **Docker Compose** | Zone 4 | Human-only (local dev environment) |
| **Environment Templates** | Zone 2 | Reviewed (can affect security) |
| **Service Discovery** | Zone 3 | Security review (network configuration) |

## Validation & Examples

### ✅ Valid Commit Examples

#### High-Risk Change (Feature)
```bash
feat(compliance): add NSF PAPPG 23-1 validation engine

Implements evidence-based validation for NSF grant proposals
against PAPPG 23-1 requirements with fuzzy header matching.

AI-Agent: kiro
Human-Involvement: reviewed
Zone: 2
Commit-Type: feat
Scope: compliance
Reviewed-By: afeola
Signed-off-by: Alyssa Feola <afeola@seventeensierra.com>
```

#### Medium-Risk Change (Documentation)
```bash
docs(orchestration): update federated mesh architecture

Documents the service-to-service communication patterns
and AI provider routing in the mesh architecture.

AI-Agent: antigravity
Human-Involvement: approved
Zone: 1
Commit-Type: docs
Scope: orchestration
Signed-off-by: Alyssa Feola <afeola@seventeensierra.com>
```

#### Low-Risk Change (Dependencies)
```bash
chore(deps): update @biomejs/biome to 2.3.8

Updates biome for improved TypeScript support and
new CSS parsing features.

AI-Agent: renovate
Human-Involvement: automated
Zone: 0
Commit-Type: chore
Scope: deps
```

#### Infrastructure Change (CI)
```bash
ci(security): add gitleaks scanning for AI service secrets

Adds detection for AWS Bedrock and Google Genkit
credentials in the pre-commit pipeline.

AI-Agent: kiro
Human-Involvement: reviewed
Zone: 3
Commit-Type: ci
Scope: security
Reviewed-By: afeola
Signed-off-by: Alyssa Feola <afeola@seventeensierra.com>
```

### ❌ Invalid Commit Examples

#### Insufficient Human Involvement
```bash
# ❌ INVALID: Feature requires 'reviewed', not 'approved'
feat(compliance): add new validation rule
AI-Agent: kiro
Human-Involvement: approved  # ❌ Should be 'reviewed' for feat
Scope: compliance
```

#### Wrong Zone for Commit Type
```bash
# ❌ INVALID: CI changes need proper review and security zone
ci(security): update gitleaks configuration
AI-Agent: cline
Human-Involvement: approved  # ❌ Should be 'reviewed' for ci
Zone: 1  # ❌ Security scope requires Zone 3
Scope: security
```

#### Invalid Scope for Commit Type
```bash
# ❌ INVALID: Style changes shouldn't affect strands service
style(strands): format Python code
AI-Agent: kiro
# ❌ Python service uses Black, not Biome
# ❌ Should use scope 'genkit' or 'web' for style changes
```

#### Missing Required Trailers
```bash
# ❌ INVALID: Missing AI-Agent and Human-Involvement
feat(web): add compliance dashboard
# ❌ No AI agent trailers provided
```

#### Scope-Path Mismatch
```bash
# ❌ INVALID: Scope doesn't match file paths
feat(ui): add web app routing
# Files: apps/web/src/app/page.tsx
# ❌ Should be scope 'web', not 'ui'
```

## Enforcement

1. **Zone validation** runs on all PRs
2. **Commits without trailers** are flagged
3. **Human-only files** cannot be modified by bots
4. **Security zones** require security team review
5. **Microservice boundaries** are enforced via path restrictions
6. **Commit type validation** ensures appropriate human involvement levels
7. **Cross-validation** between commit type, zone, and human involvement
