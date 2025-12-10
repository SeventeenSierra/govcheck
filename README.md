# Proposal Prepper (Contract Checker)

> SPDX-License-Identifier: PolyForm-Strict-1.0.0

## Overview

Proposal Prepper is a **Federated Mesh microservice architecture** designed to validate NSF PAPPG compliance for research proposals. The system uses AI-powered analysis to ensure proposals meet federal funding requirements before submission.

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
| [SECURITY.md](./SECURITY.md) | Security policy |
| [DEPENDENCY-MANAGEMENT.md](./DEPENDENCY-MANAGEMENT.md) | Dependency guidelines |
| [VERSIONING.md](./VERSIONING.md) | Version strategy |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |
| [docs/](./docs/) | Additional documentation |

## Architecture

**Federated Mesh Microservices:**

- **Web Service** (Next.js) - Port 3000: User interface and orchestration
- **Strands Service** (Python) - Port 8080: NSF PAPPG compliance validation using AWS Bedrock
- **Genkit Service** (Node.js) - Port 8081: AI workflow orchestration and document processing

```
apps/web/                 # Next.js web application
services/strands-agent/   # Python compliance validation service
services/genkit-service/  # Node.js AI orchestration service
packages/ui/              # Shared UI components
packages/lib/             # Shared utilities
```

## License

This project uses a multi-license strategy. See [LICENSING.md](./LICENSING.md) for details.

## Contact

- Security Issues: security@seventeensierra.com
- General: support@seventeensierra.com
