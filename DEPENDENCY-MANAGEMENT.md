# Dependency Management

Guidelines for managing dependencies across the Seventeen Sierra monorepo.

## Adding Dependencies

Before adding any new dependency, evaluate:

1. **License Compliance** — *Recommended*: MIT, ISC, Apache-2.0, or BSD (policy TBD)
2. **Package Health** — See metrics below
3. **Security Check** — Run `pnpm audit` after adding

> **Note**: Formal license policy is pending. The permissive license recommendation 
> aligns with our packages being MIT/permissive, but hasn't been formally established.

### Package Health Metrics

| Metric | Good | Concern | High Risk |
|--------|------|---------|-----------|
| Weekly Downloads | >100k | 10k-100k | <10k |
| Last Update | <3 months | 3-12 months | >12 months |
| Maintainers | 3+ | 2 | 1 (bus factor) |
| TypeScript Support | Native | @types | None |

### Documentation Requirements

When adding a dependency to a published package (`@17sierra/*`):

1. Update `LICENSE-THIRD-PARTY.md` in that package
2. Document which components use it
3. Note concerns in "Package Health Assessment" section

## Security Automation

Security scanning runs automatically via `.github/workflows/security.yaml`:

| Check | Tool | Blocks On |
|-------|------|-----------|
| SAST | Semgrep | Warnings |
| Secrets | Gitleaks | Any detection |
| Vulnerabilities | Trivy | Branch-dependent |
| Dependency Audit | pnpm audit | Branch-dependent |
| SBOM | Anchore | main/release only |

### Severity by Branch

| Branch | Severity Level |
|--------|---------------|
| `develop` | HIGH, CRITICAL |
| `release/*` | MEDIUM+ |
| `main` | LOW+ |

## Dependency Updates

Renovate handles automated updates (see `renovate.json`):

- Radix UI packages grouped together
- Minor/patch auto-merge for devDependencies
- Major updates require manual review

## Tools

```bash
pnpm audit                        # Check vulnerabilities
pnpm knip                         # Find unused deps
npx license-checker --summary     # Check licenses
```

## Related Documents

- [SECURITY.md](./SECURITY.md) — Vulnerability reporting
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Development workflow
- [LICENSING.md](./LICENSING.md) — License structure
