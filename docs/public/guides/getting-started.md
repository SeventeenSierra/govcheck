<!-- SPDX-License-Identifier: LicenseRef-AllRightsReserved -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Getting Started

Welcome to the 17s monorepo! This guide will help you set up your development environment.

## Prerequisites

1. **Nix** with flakes enabled
   - [Install Nix](https://nixos.org/download.html)
   - [Enable Flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes)

2. **Git** for version control

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd 17s-mono

# 2. Enter the Nix development shell
nix develop

# 3. Install dependencies
pnpm install

# 4. Verify everything works
pnpm run lint
pnpm run typecheck
```

That's it! You're ready to start developing.

## What's in the Dev Shell?

When you run `nix develop`, you get:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.x | JavaScript runtime |
| pnpm | 9.15.x | Package manager |
| Biome | 2.3.x | Linting & formatting |
| TypeScript | 5.x | Type checking |
| Playwright | - | E2E testing |

## Common Commands

```bash
# Development
pnpm run dev          # Start all apps in dev mode

# Quality checks
pnpm run lint         # Check for lint errors
pnpm run format       # Auto-format code
pnpm run typecheck    # Type check all packages

# Building
pnpm run build        # Build all packages

# Testing
pnpm run e2e          # Run E2E tests
```

## Project Structure

```
17s-mono/
├── apps/             # Application packages
│   ├── dashboard/    # Main dashboard app
│   ├── internal-tool/# Internal tools
│   └── marketing/    # Marketing website
├── packages/         # Shared libraries
│   ├── config/       # Shared configs
│   └── ui/           # UI component library
└── docs/             # Documentation
```

## Next Steps

- Read the [Dev Environment Blog Post](../blog/setting-up-nix-dev-environment.md) for deeper understanding
- Check out the [UI Component Library](../../packages/ui/README.md)
- Review [Architecture Decisions](../adr/README.md)

## Troubleshooting

Having issues? Check the [Knowledge Base](../knowledge-base/nix-biome-troubleshooting.md).
