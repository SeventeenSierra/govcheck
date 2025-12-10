# ADR-0001: Record Architecture Decisions

## Status

**Accepted**

## Context

We need to record significant architectural decisions to maintain a history of "why" we did things, especially in a monorepo with multiple apps and shared packages.

## Decision

We will use **Architecture Decision Records (ADRs)**.

*   **Location**:
    *   **Root**: `docs/adr/` for monorepo-wide or cross-cutting decisions.
    *   **Apps**: `apps/<app>/docs/adr/` for app-specific decisions.
*   **Format**: [MADR 3.0.0](https://adr.github.io/madr/) (Markdown).
*   **Numbering**: Monotonically increasing integers (e.g., `0001-record-architecture-decisions.md`).

## Consequences

*   We will have a persistent memory of decisions.
*   New contributors can understand the context.
*   Decision-making becomes explicit.
