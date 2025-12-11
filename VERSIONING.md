<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Versioning Policy

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

## Version Format

```
MAJOR.MINOR.PATCH
```

| Component | When to Increment |
|-----------|------------------|
| **MAJOR** | Breaking changes to public APIs |
| **MINOR** | New features, backwards compatible |
| **PATCH** | Bug fixes, backwards compatible |

## What Constitutes a Breaking Change?

### Breaking (MAJOR bump)

- Removing or renaming public API endpoints
- Changing response structure in incompatible ways
- Removing exported functions/components
- Changing function signatures in incompatible ways
- Dropping support for a runtime/platform

### Non-Breaking (MINOR bump)

- Adding new API endpoints
- Adding optional parameters
- Adding new exported functions/components
- Deprecating (not removing) features

### Patch (PATCH bump)

- Bug fixes
- Performance improvements
- Documentation updates
- Internal refactoring (no API changes)

## Pre-Release Versions

During initial development (0.x.x):

- `0.MINOR.PATCH` format
- MINOR bumps may include breaking changes
- Stability not guaranteed until 1.0.0

## Release Process

Releases are automated via [release-please](https://github.com/googleapis/release-please):

1. Conventional commits trigger release PR creation
2. Merging release PR creates GitHub release
3. Changelogs generated automatically

## Package Versioning in Microservice Architecture

| Component | Versioning |
|-----------|------------|
| `apps/web` | Independent versions |
| `services/strands-agent` | Independent versions |
| `services/genkit-service` | Independent versions |
| `packages/*` | Independent versions |
| Root project | Follows web app version |

## Deprecation Policy

Deprecated features:

1. Marked with `@deprecated` in code
2. Documented in CHANGELOG
3. Removed in next MAJOR version
4. Minimum 1 minor release warning period
