# Dependency Management

## Overview

This application manages dependencies using pnpm.

## Internal Packages

### In Monorepo (workspace:*)
When running in the monorepo, internal packages use workspace protocol:

| Package | Purpose |
|---------|---------|
| `@17sierra/ui` | Shared UI components |
| `@17sierra/lib` | Shared utilities |
| `@17sierra/config` | Shared TypeScript configs |

### When Ejected (npm versions)
When this app is extracted to a standalone repository, workspace dependencies are transformed to published npm versions:
- `"@17sierra/ui": "workspace:*"` → `"@17sierra/ui": "^0.1.0"`

## Adding Dependencies

### Production Dependencies
```bash
pnpm add <package>
```

### Development Dependencies
```bash
pnpm add -D <package>
```

### Updating Dependencies
```bash
pnpm update
```

## License Compliance

All dependencies must be compatible with AGPL-3.0:
- **Allowed**: MIT, Apache-2.0, BSD-3-Clause, LGPL, MPL
- **Review Required**: GPL (compatible but may require legal review)
- **Prohibited**: Proprietary licenses without explicit permission

## Security

Dependencies are scanned for vulnerabilities:
```bash
pnpm audit
```

## SBOM Generation

For compliance, generate Software Bill of Materials:
```bash
# Using syft (if available)
syft packages . -o spdx-json > sbom.spdx.json
```
