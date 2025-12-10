# Licensing

The Proposal Prepper (Contract Checker) project uses a **multi-license strategy** to balance open source principles with commercial viability for NSF PAPPG compliance validation.

## Quick Reference

| Directory | License | SPDX Identifier |
|-----------|---------|-----------------|
| `/` (root) | [PolyForm Strict 1.0.0](./LICENSE) | `PolyForm-Strict-1.0.0` |
| `/apps/web/` | All Rights Reserved | `UNLICENSED` |
| `/services/strands-agent/` | All Rights Reserved | `UNLICENSED` |
| `/services/genkit-service/` | All Rights Reserved | `UNLICENSED` |
| `/packages/ui/` | All Rights Reserved | `UNLICENSED` |
| `/packages/lib/` | All Rights Reserved | `UNLICENSED` |
| `/scripts/` | PolyForm Perimeter 1.0.0 | `PolyForm-Perimeter-1.0.0` |
| `/.agent/` | PolyForm Perimeter 1.0.0 | `PolyForm-Perimeter-1.0.0` |
| `/.kiro/` | PolyForm Perimeter 1.0.0 | `PolyForm-Perimeter-1.0.0` |
| `/docs/*` | CC-BY-SA-4.0 | `CC-BY-SA-4.0` |
| `/vendor/*` | Various (see directory) | Original licenses preserved |

## License Details

### Monorepo Root: PolyForm Strict

The monorepo structure, build configurations, and DevSecOps automation are licensed under [PolyForm Strict 1.0.0](https://polyformproject.org/licenses/strict/1.0.0/).

**You may:**
- View and study the code
- Use for personal learning and education
- Evaluate for potential licensing

**You may not:**
- Use commercially without a license
- Redistribute or create derivative works

### Microservices and Applications: All Rights Reserved

The core Proposal Prepper services and applications are proprietary:

- **Web App** (`/apps/web/`): Next.js interface for proposal validation
- **Strands Service** (`/services/strands-agent/`): NSF PAPPG compliance validation engine
- **Genkit Service** (`/services/genkit-service/`): AI workflow orchestration
- **Shared Packages** (`/packages/`): UI components and utilities

Contact licensing@seventeensierra.com for licensing inquiries.

### Tools & Utilities: PolyForm Perimeter

### Tools & Utilities (Scripts & Agent): PolyForm Perimeter

Internal tools in `/scripts/` and `/.agent/` use [PolyForm Perimeter 1.0.0](https://polyformproject.org/licenses/perimeter/1.0.0/):
- Use internally however you want
- Do not expose to external users or offer as a service

### Documentation: Creative Commons

- Guides and tutorials: CC-BY-SA-4.0
- API reference: CC-BY-4.0

### Vendor Code

Code in `/vendor/` retains its original license. See `vendor/*/LICENSE` files.

## SPDX Headers

All source files include SPDX license identifiers:

```typescript
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution requirements including DCO sign-off and CLA.

## Commercial Licensing

For commercial licensing inquiries: **licensing@seventeensierra.com**
