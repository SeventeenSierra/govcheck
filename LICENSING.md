# Licensing

This monorepo uses a **multi-license strategy** to balance open source principles with commercial viability.

## Quick Reference

| Directory | License | SPDX Identifier |
|-----------|---------|-----------------|
| `/` (root) | [PolyForm Strict 1.0.0](./LICENSE) | `PolyForm-Strict-1.0.0` |
| `/apps/*` | AGPL-3.0 OR Commercial | `AGPL-3.0-or-later OR LicenseRef-17s-Commercial` |
| `/packages/ui/` | MIT | `MIT` |
| `/packages/lib/` | MIT | `MIT` |
| `/packages/config/` | MIT | `MIT` |
| `/packages/ai-flows-stub/` | MIT | `MIT` |
| `/packages/ai-flows/` | Proprietary (Private) | `UNLICENSED` |
| `/scripts/` | PolyForm Perimeter 1.0.0 | `PolyForm-Perimeter-1.0.0` |
| `/.agent/` | PolyForm Perimeter 1.0.0 | `PolyForm-Perimeter-1.0.0` |
| `/docs/*` | CC-BY-SA-4.0 | `CC-BY-SA-4.0` |
| `/assets/icons/` | CC0 (Public Domain) | `CC0-1.0` |
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

### Web Applications: AGPL-3.0 OR Commercial

Applications in `/apps/` are dual-licensed:

1. **AGPL-3.0-or-later**: Free for use, but modifications must be shared under the same terms
2. **Commercial License**: Contact licensing@seventeensierra.com for proprietary use

### Shared Libraries (UI, Lib, Config): MIT

The shared libraries in `/packages/ui/`, `/packages/lib/`, and `/packages/config/` are MIT-licensed for maximum adoption and ease of use across projects.

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
