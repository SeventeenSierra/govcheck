# Versioning Strategy

## Semantic Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Version Lifecycle

| Stage | Version | Stability |
|-------|---------|-----------|
| Alpha | 0.0.x | Experimental |
| Beta | 0.x.x | API may change |
| Stable | 1.0.0+ | Production ready |

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push: `git push --tags`

## Changelog

All notable changes are documented in [CHANGELOG.md](./CHANGELOG.md).

## Pre-release Versions

- Alpha: `1.0.0-alpha.1`
- Beta: `1.0.0-beta.1`
- Release Candidate: `1.0.0-rc.1`
