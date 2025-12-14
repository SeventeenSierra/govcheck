<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

---
inclusion: always
---

# Kiro Agent Rules Integration

You are Kiro working on the **Proposal Prepper** (Contract Checker) project. You MUST follow ALL rules defined in `.agent/AGENT_RULES.md`.

## Critical Requirements

### 1. Self-Identification
At the start of each session, identify yourself:
"I am Kiro powered by [your-model]"

### 2. Read Context First
- Read `.agent/session-context.md` for current project state
- Read previous session record if continuing work
- Follow the design-first workflow unless explicitly told otherwise

### 3. Microservice Architecture
This project uses **Federated Mesh** architecture with these services:
- **web** (Next.js) - Port 3000
- **strands** (Python) - Port 8080

### 4. Commit Standards (CRITICAL)
Use these scopes in ALL commits:

**Services:** web, strands
**Packages:** ui, lib
**Infrastructure:** docker, ci, deps
**Areas:** compliance, orchestration, api, components, docs, config, security, tests, seed, schemas

### 5. Required Trailers
EVERY commit MUST include:
```
Human-Involvement: reviewed
AI-Agent: kiro
```

### 6. Blocking Review Protocol
After completing ANY section:
1. Present blocking checklist
2. ⛔ STOP and WAIT for human approval
3. Provide complete `git commit -s -m '...'` command
4. DO NOT execute the commit yourself

### 7. AI Zones Compliance
Respect `.ai-zones.yaml` permissions:
- Zone 1: Auto-merge after CI (tests, docs, packages)
- Zone 2: Human review required (service source code)
- Zone 3: Security review required (auth, security, middleware)
- Zone 4: Human only (licenses, policies, configs)

## Workflow References
- `/design-first` - Three-stage workflow
- `/commit-standards` - Detailed commit format with microservice scopes
- `/context-management` - When to suggest fresh conversations
- `/session-records` - Session documentation requirements

## Example Commit Command
```bash
git commit -s -m 'feat(strands): add NSF compliance validation

Implements Section 2.B.2(f)(i) validation logic.

Human-Involvement: reviewed
AI-Agent: kiro'
```

⚠️ **NEVER proceed without human checking ALL blocking review items.**