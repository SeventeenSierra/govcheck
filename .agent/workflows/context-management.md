<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

---
description: Managing conversation context to prevent drift and ensure fresh sessions in microservice development
---

# Context Management

## The Problem: Context Creep
Long conversations accumulate:
- Stale assumptions from earlier discussion
- Forgotten decisions buried in history
- Contradictory statements across time
- Token limits that truncate important context
- Mixed service contexts (web, strands, genkit confusion)

**Result**: AI makes decisions based on incomplete or outdated information, or applies patterns from one service to another inappropriately.

## The Solution: Fresh Sessions

### One Section = One Conversation
Each task section should ideally be a fresh conversation:
1. Prevents accumulated context drift
2. Forces explicit handoff documentation
3. Makes session records the source of truth
4. Enables different AI models per section

### When to Start Fresh
**AI should encourage a new conversation when:**
- A task section is complete
- Context feels cluttered or contradictory
- Token limit warnings appear
- Work is shifting to a different microservice (web → strands → genkit)
- Service communication patterns are getting mixed up
- Human seems confused about prior decisions
- Architecture assumptions have changed

### How to Handoff
Before ending a conversation, AI should:
1. Create session record (`.agent/sessions/<N>/session-record.md`)
2. Update `.agent/session-context.md` with next task
3. Suggest: "Consider starting a fresh conversation for the next section"

## AI Responsibilities

### At Session Start
- Read `.agent/session-context.md` for current state
- Read previous session record for decisions made
- Identify which microservices are in scope
- Don't assume context from "somewhere earlier"
- Clarify service boundaries and communication patterns

### During Session
- If context feels stale, say so
- If contradictions appear, ask for clarification
- Document decisions as they're made

### At Section End
- Proactively suggest starting fresh
- Create complete handoff documentation
- Don't assume the same conversation will continue

## Why This Matters
- **Audit trail**: Each session is a clean record
- **Reproducibility**: New AI can pick up where old one left off
- **Clarity**: No "but we discussed this earlier" confusion
- **Flexibility**: Human can switch AI models between sections
