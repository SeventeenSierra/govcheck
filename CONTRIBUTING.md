# Contributing to Proposal Prepper

Thank you for your interest in contributing to the Proposal Prepper (Contract Checker) project! This document explains our contribution process for this NSF PAPPG compliance validation system.

## Quick Start

1. Fork the repository
2. Create a feature branch from develop: `git checkout -b feat/my-feature develop`
3. Make changes with conventional commits
4. Sign off your commits: `git commit -s`
5. Push and create a Pull Request to `develop` branch

## Developer Certificate of Origin (DCO)

All commits must be signed off to certify you have the right to submit the code:

```bash
git commit -s -m "feat: add new feature"
```

This adds `Signed-off-by: Your Name <email>` to your commit. See [DCO.md](./DCO.md) for details.

## Contributor License Agreement (CLA)

**First-time contributors** must sign our CLA via [CLA Assistant](https://cla-assistant.io/) when submitting a PR.

### Federal Government Employees

If you're a U.S. Federal Government employee contributing within scope of employment:

- ✅ **No CLA required** (your work is public domain under 17 U.S.C. § 105)
- ✅ DCO sign-off is still required
- ✅ Add `US-Government-Work: true` to commit messages

```bash
git commit -s -m "feat: add compliance feature

US-Government-Work: true"
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
Signed-off-by: Name <email>
```

### Types & Scopes

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

**Microservice Scopes:**
- `web` - Next.js web app
- `strands` - Python compliance service
- `genkit` - Node.js AI orchestration
- `ui`, `lib` - Shared packages
- `compliance` - NSF PAPPG validation logic
- `orchestration` - Federated mesh patterns

### Examples

```bash
git commit -s -m "feat(strands): add NSF PAPPG Section 2.B validation"
git commit -s -m "fix(web): handle proposal upload timeout"
git commit -s -m "feat(genkit): implement document processing workflow"
git commit -s -m "docs(compliance): update validation rules documentation"
```

## Development Workflow

### Prerequisites

- [Nix](https://nixos.org/) with flakes enabled
- Git with GPG signing configured

### Setup

```bash
# Enter dev environment
nix develop

# Install dependencies
pnpm install

# Run checks
pnpm run lint
pnpm run typecheck
pnpm run test
```

### Branch Strategy

We use **Gitflow** for development:

- `main` - Production-ready releases only
- `develop` - Integration branch for features
- `feature/*` - Feature development (branch from `develop`)
- `release/*` - Release preparation (branch from `develop`)
- `hotfix/*` - Critical fixes (branch from `main`)

**Workflow:**
1. Create feature branches from `develop`
2. Submit PRs to `develop` for integration
3. Release branches merge to both `main` and `develop`
4. Hotfixes merge to both `main` and `develop`

#### CI/CD Compliance
All PRs must pass the CI checks, which are powered by **GitHub Actions**:
- Linting (Biome)
- Typechecking (TypeScript)
- Tests (Vitest)
- Build Verification
- Secret Scanning (Gitleaks, Trivy, Semgrep)

The CI pipeline uses **Workload Identity Federation** to authenticate with Google Artifact Registry for private packages.

## Pull Requests Process

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Tests**: Add/update tests for changes
4. **Docs**: Update documentation if needed
5. **Sign-off**: Ensure all commits are signed

## Code Style

- TypeScript files: Biome formatting
- Python files: Ruff + Black
- All files need SPDX headers:

```typescript
// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
```

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@seventeensierra.com.

## Questions?

- 📧 Email: dev@seventeensierra.com
- 💬 Discussions: GitHub Discussions
- 🚨 Code of Conduct: conduct@seventeensierra.com
