# 17s Monorepo Documentation

Welcome to the documentation hub for the 17s monorepo. This documentation is organized by audience and purpose.

## Quick Links

| Document | Audience | Purpose |
|----------|----------|---------|
| [Getting Started](./guides/getting-started.md) | New Contributors | First-time setup guide |
| [Dev Environment Setup Blog](./blog/setting-up-nix-dev-environment.md) | Developers | Detailed walkthrough with context |
| [Development SOP](./runbooks/dev-environment-sop.md) | Maintainers | Standard procedures for common tasks |
| [Knowledge Base](./knowledge-base/README.md) | Everyone | Troubleshooting and lessons learned |

## Architecture Decisions

We use [Architecture Decision Records (ADRs)](./adr/README.md) to document significant technical decisions.

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-0001](./adr/0001-nix-dev-environment-with-biome.md) | Nix Dev Environment with Biome | Accepted |

## Repository Structure

```
17s-mono/
├── apps/                    # Application packages
│   ├── dashboard/           # Dashboard application
│   ├── internal-tool/       # Internal tooling
│   └── marketing/           # Marketing site
├── packages/                # Shared packages
│   ├── config/              # Shared TypeScript configs
│   └── ui/                  # Shared UI component library
├── docs/                    # This documentation
│   ├── adr/                 # Architecture Decision Records
│   ├── blog/                # In-depth articles and tutorials
│   ├── guides/              # How-to guides
│   ├── knowledge-base/      # Troubleshooting and gotchas
│   └── runbooks/            # SOPs for maintainers
├── biome.json               # Biome linter/formatter config
├── flake.nix                # Nix development environment
├── turbo.json               # Turborepo configuration
└── pnpm-workspace.yaml      # pnpm workspace definition
```

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.x | Runtime |
| pnpm | 9.15.x | Package manager |
| Nix | - | Reproducible dev environment |
| Biome | 2.3.x | Linting & formatting |
| Turbo | 2.6.x | Monorepo build system |
| TypeScript | 5.x | Type checking |
| Vite | - | Build tooling |
| Storybook | - | Component development |

## Contributing

1. Enter the Nix dev shell: `nix develop`
2. Install dependencies: `pnpm install`
3. Run checks before committing:
   - `pnpm run lint` - Check for lint errors
   - `pnpm run format` - Format code
   - `pnpm run typecheck` - Type check all packages

## Need Help?

- Check the [Knowledge Base](./knowledge-base/README.md) for common issues
- Review the [Troubleshooting Guide](./knowledge-base/nix-biome-troubleshooting.md)
