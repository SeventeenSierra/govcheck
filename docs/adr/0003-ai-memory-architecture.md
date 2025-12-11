# ADR-0003: AI Memory Architecture (The "Hippocampus" Protocol)

## Context
As we develop the monorepo using Human-AI Pair Programming, we engaged in a "Split Brain" problem:
1.  **Short-Term Memory (RAM)**: The AI's context window contains the active plan (`tasks.md`), design, and thought process. This is ephemeral and lost when the session ends.
2.  **Long-Term Memory (Storage)**: The repository (`git`) stores the code and finalized docs, but loses the *reasoning* and *intermediate artifacts* that led to those decisions.
3.  **The Gap**: Retrieving context from previous sessions (e.g., "Why did we decide X in Session 1?") was difficult because the "Thought Process" was not persisted.

We evaluated three external solutions to bridge this gap:
*   **Zep**: Temporal Knowledge Graph. Excellent for recall but adds external dependency and "Black Box" complexity.
*   **Mem0**: Memory Layer middleware. Good for personalization, but primarily database-centric.
*   **Letta (formerly MemGPT)**: OS-inspired architecture. Explicitly manages "Virtual Memory" (Context Window) vs "Archival Storage".

## Decision
We will **adopt a Letta-inspired Memory Architecture** implemented natively within our `.agent` protocol, without adding external infrastructure dependencies yet.

We define the following memory tiers:

### 1. Short-Term Memory (RAM)
*   **Location**: `apps/<app>/.agent/short-term/`
*   **Contents**: `tasks.md` (Active), `context.md` (Transient), `scratchpad.md`.
*   **Behavior**: These files are loaded into the AI context window at the start of a session. They are mutable and reflect the "Now".

### 2. Long-Term Memory (Storage)
*   **Location**: `apps/<app>/.agent/long-term/sessions/`
*   **Contents**: `01-planning/`, `02-extraction/`, etc.
*   **Behavior**: At the end of every session, we **persist** the Short-Term artifacts into a dedicated Session Directory. This creates an immutable snapshot of the "Thought Process" at that time.

### 3. Retrieval Mechanism (The "Recall" Function)
*   **Protocol**: When an agent needs past context, it performs a **Context Retrieval** step:
    1.  Search `long-term/sessions/` for relevant keywords/decisions.
    2.  Copy excerpts into `short-term/context.md`.
    3.  This mimics "paging" data from Disk to RAM.

## Consequences
### Positive
*   **Ejectability**: The entire memory is just Markdown files in Git. No vendor lock-in.
*   **Auditability**: We have a perfect history of *what* we thought and *when*.
*   **Simplicity**: No new servers or APIs to maintain.

### Negative
*   **Manual Overhead**: Agents must strictly follow the "Persist" and "Retrieve" protocol (enforced via `human-ai-pair-programming.md`).
*   **Duplication**: `long-term` stores snapshots, leading to some data duplication (acceptable for text files).

## Future Consideration
We may automate the "Context Retrieval" step with a CLI tool (`scripts/recall.ts`) or eventually adopt the full Letta framework if complexity grows beyond file-based management.
