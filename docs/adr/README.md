# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the 17s monorepo.

## What is an ADR?

An Architecture Decision Record captures an important architectural decision along with its context and consequences. ADRs are numbered sequentially and are never deleted—if a decision is reversed, a new ADR is created that supersedes the old one.

## ADR Index

| Number | Title | Status | Date |
|--------|-------|--------|------|
| [0001](./0001-nix-dev-environment-with-biome.md) | Nix Dev Environment with Biome | Accepted | 2024-12-04 |
| [0002](./0002-copybara-sync-and-npm-scope.md) | Copybara Sync and NPM Scope Strategy | Proposed | 2024-12-05 |

## ADR Template

When creating a new ADR, use the following template:

```markdown
# ADR-XXXX: Title

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXXX](./xxxx-title.md)

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- Benefit 1
- Benefit 2

### Negative

- Tradeoff 1
- Tradeoff 2

### Neutral

- Side effect 1
```

## Creating a New ADR

1. Copy the template above
2. Create a new file: `docs/adr/XXXX-short-title.md`
3. Fill in the sections
4. Update this README's index
5. Submit for review
