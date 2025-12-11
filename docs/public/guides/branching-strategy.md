<!-- SPDX-License-Identifier: LicenseRef-AllRightsReserved -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Branching Strategy & Environments

Aligned with [DoD DevSecOps Reference Design](https://dodcio.defense.gov/Portals/0/Documents/DoD%20Enterprise%20DevSecOps%20Reference%20Design%20v1.0_Public%20Release.pdf).

## Branch → Environment Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  feature/*  ──────►  Dev Sandbox  (ephemeral, per-feature)                  │
│      │                                                                       │
│      ▼                                                                       │
│  develop    ──────►  Development  (integration testing)                     │
│      │                    │                                                  │
│      │                    └──►  Demo  (customer demos, stable develop)      │
│      ▼                                                                       │
│  release/*  ──────►  Pre-Production  (UAT, hardening)                       │
│      │                                                                       │
│      ▼                                                                       │
│  main       ──────►  Production  (crown jewel)                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Branch Security Levels

| Branch | Security Level | Merge Requirements |
|--------|----------------|-------------------|
| `feature/*` | Permissive | None (push freely) |
| `develop` | Standard | CI pass, 1 review |
| `release/*` | Strict | CI + security scans, 2 reviews, SBOM |
| `main` | Maximum | All above + signed commits, manual approval |

## Environment Details

### Dev Sandbox
- **Trigger**: Push to `feature/*`
- **Lifecycle**: Ephemeral (destroyed after merge)
- **Purpose**: Individual feature development
- **Secrets**: Mock/test secrets only

### Development
- **Branch**: `develop` (main development branch)
- **Lifecycle**: Persistent
- **Purpose**: Integration, team testing, feature merging
- **Secrets**: Development secrets (non-sensitive)

### Demo
- **Branch**: `develop` (tagged releases)
- **Lifecycle**: Persistent
- **Purpose**: Customer demos, sales
- **Secrets**: Demo-specific (isolated)

### Pre-Production
- **Branch**: `release/*`
- **Lifecycle**: Per-release
- **Purpose**: UAT, security hardening, final testing
- **Secrets**: Production-like (rotated)

### Production
- **Branch**: `main`
- **Lifecycle**: Persistent
- **Purpose**: Live customer traffic
- **Secrets**: Production (strict access)

## Workflow

### Feature Development
```bash
# Create feature branch
git checkout develop
git checkout -b feature/my-feature

# Work on feature...
git commit -s -m "feat: add new feature"

# Push (triggers dev sandbox deployment)
git push origin feature/my-feature

# Create PR to develop
gh pr create --base develop
```

### Release Process
```bash
# Create release branch from develop
git checkout develop
git checkout -b release/1.2.0

# Final testing, bug fixes only
git commit -s -m "fix: patch issue"

# Merge to main when ready
gh pr create --base main

# After merge, tag and deploy
git tag -s v1.2.0 -m "Release 1.2.0"
```

## AI Agent Guidelines

Autonomous agents (Kiro, Antigravity, Cline, etc.) should:

1. **Set environment**: `export HUSKY=0`
2. **Target feature branches**: Never push directly to `develop`/`main`
3. **Never sign commits**: AI cannot use `git commit -s` - only humans sign off
4. **Provide commit commands**: Give humans the full `git commit -s -m '...'` command to run
5. **Create PRs**: Let CI validate changes

See [.agent/config.yaml](/.agent/config.yaml) for configuration.
