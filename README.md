# Proposal Prepper (Contract Checker) - Phase 1

> SPDX-License-Identifier: AGPL-3.0-or-later

## Overview

Proposal Prepper Phase 1 is a **laptop-deployable application** designed to validate NSF PAPPG compliance for research proposals. The system uses AI-powered analysis to ensure proposals meet federal funding requirements before submission.

**Note:** This is Phase 1 of the larger OBI-One platform. For comprehensive end-state specifications and the full platform architecture, see the [obi-one repository](https://github.com/yourusername/obi-one).

## Quick Start

```bash
# Enter Nix development shell
nix develop

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Documentation

| Document | Purpose |
|----------|---------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community guidelines |
| [SECURITY.md](./SECURITY.md) | Security policy |
| [DEPENDENCY-MANAGEMENT.md](./DEPENDENCY-MANAGEMENT.md) | Dependency guidelines |
| [VERSIONING.md](./VERSIONING.md) | Version strategy |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| [docs/](./docs/) | Additional documentation |

## Architecture

**Federated Mesh Microservices:**

- **Web Service** (Next.js) - Port 3000: User interface and orchestration
- **Strands Service** (Python) - Port 8080: NSF PAPPG compliance validation using AWS Bedrock

```
apps/web/                 # Next.js web application
services/strands-agent/   # Python compliance validation service
packages/ui/              # Shared UI components
packages/lib/             # Shared utilities
```

## Specification Structure

The base application specifications are organized in `.kiro/specs/base-app/` with the following architecture:

### Strategic Planning
- **`product/`** - Product management, roadmap, user stories, sprint planning
- **`docs/`** - Documentation strategy, user guides, API docs, architecture docs

### Core Application
- **`app-base/`** - Core application architecture and design
- **`app-enhancement/`** - Application improvements and feature enhancements
- **`api/`** - API design, interfaces, and integration patterns

### Domain-Specific
- **`compliance/`** - NSF/FAR compliance logic, validation rules, regulatory requirements
- **`ai/`** - AI integration, model configuration, prompt engineering
- **`data/`** - Data management, storage, processing pipelines

### Infrastructure & Operations
- **`infrastructure/`** - Infrastructure setup, deployment configuration
- **`deployment/`** - Deployment strategies, environment management
- **`security/`** - Security architecture, access controls, compliance
- **`ops/`** - Operations, monitoring, logging, performance metrics

### Development
- **`design-system/`** - UI components, design tokens, accessibility standards
- **`testing/`** - Testing strategies, test automation, quality assurance
- **`repository/`** - Repository structure, development workflows, CI/CD

Each specification folder contains requirements, design, and task documents following the three-stage design-first workflow.

## License

This project uses a multi-license strategy. See [LICENSING.md](./LICENSING.md) for details.

## Contact

- Security Issues: security@seventeensierra.com
- General: support@seventeensierra.com
