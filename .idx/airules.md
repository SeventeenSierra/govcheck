<!-- SPDX-License-Identifier: PolyForm-Strict-1.0.0 -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# IDX Environment AI Rules

This file provides the initial bootstrap instructions for AI agents operating within the IDX environment.

## 1. Core Directive: Default to the .agent Directory

**All AI operations, configurations, and session records MUST use the `.agent` directory as the source of truth.** This ensures a clear separation of concerns and aligns with the project's established AI integration patterns.

## 2. Session Initialization

On session start, the agent MUST immediately read and adhere to the rules defined in **`.agent/AGENT_RULES.md`**.

The key rules found in that file are:

1.  **Self-identify**: "I am [Agent] powered by [Model]. Trailer: AI-Agent: [value]"
2.  **Read context**: `.agent/session-context.md`
3.  **Blocking review**: Present checklist before commits, WAIT for human approval
4.  **Human signs off**: Only human runs `git commit -s`
5.  **Session record**: Create `.agent/sessions/<N>/session-record.md`

## 3. Environment Configuration

To ensure smooth operation and prevent conflicts with local development setups, AI agents must operate with the following environment settings:

```bash
export HUSKY=0  # Skip pre-commit hooks
export CI=true  # Operate in non-interactive mode
```
