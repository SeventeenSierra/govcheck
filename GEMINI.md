# Gemini & Jules Integration Guide

This document outlines the patterns and best practices for integrating our two primary AI systems: the real-time **Gemini-powered Swarm** and the asynchronous **Jules** coding agent.

---

## ⚠️ CRITICAL: Session Rules (ALWAYS APPLY)

**Read `.agent/AGENT_RULES.md` at session start.** Key rules:

1. **Self-identify**: "I am [Agent] powered by [Model]. Trailer: AI-Agent: [value]"
2. **Read context**: `.agent/session-context.md`
3. **Blocking review**: Present checklist before commits, WAIT for human approval
4. **Human signs off**: Only human runs `git commit -s`
5. **Session record**: Create `.agent/sessions/<N>/session-record.md`

---

## Core Philosophy: The Right Agent for the Job

- **Use the Swarm for Collaboration & Review:** When you need immediate feedback, brainstorming, or a detailed review of a specific change, use the `SwarmRouter`.
- **Use Jules for Delegation & Automation:** When you have a large, well-defined task that can be done in the background, delegate it to Jules.

## Integration Patterns

The `jules` CLI is designed to be scriptable, allowing us to create powerful, automated workflows by composing it with other tools, including our own Gemini-powered agents.

### Pattern 1: Swarm-to-Jules Delegation

This is the most common pattern. The collaborative swarm identifies a large task and delegates it to Jules.

**Scenario:** During a PR review, the swarm notes that a new utility function should be applied across 20 different files.

**Workflow:**

1.  **Swarm Identifies Task:** **James (Lead Dev)**, acting as Director, summarizes the finding: "This refactoring is too large for this PR. It should be a separate task."
2.  **Delegation via MCP:** James then uses an MCP tool that wraps the `jules` CLI to create a new task.
    > **Command:** `jules remote new --repo . --session "Refactor all instances of 'oldApiCall()' to use the new 'newApiHelper()' in the 'apps/main-app' directory."`
3.  **Asynchronous Work:** Jules accepts the task, performs the refactoring in a separate environment, and submits a new PR (`feature/JULES-101-api-refactor`).
4.  **Closing the Loop:** The new PR submitted by Jules is then reviewed by our standard `Hierarchical Swarm`, ensuring even AI-generated code meets our quality and security standards.

### Pattern 2: Scripted Issue-to-Jules Pipeline

We can automate the process of turning GitHub issues into Jules tasks.

**Scenario:** We want to automatically assign bugs with the `good first issue` label to Jules.

**Workflow:**

1.  **GitHub Action Trigger:** A GitHub Action runs on a schedule or when an issue is labeled.
2.  **CLI Composition:** The Action uses a script that pipes information from the GitHub CLI to the Jules CLI.
    > **Example Script:**
    > ```shell
    > gh issue list --label "good first issue" --limit 1 --json title \
    >  | jq -r '.[0].title' \
    >  | jules remote new --repo .
    > ```
3.  **Result:** The oldest "good first issue" is automatically assigned to Jules to be worked on.
