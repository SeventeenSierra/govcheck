# Secrets Management

## Overview

This document outlines secrets management for the 17s-mono project across all environments.

## Recommended Tools

| Tool | License | Best For |
|------|---------|----------|
| **Infisical** | MIT | GitOps, rotation, team-friendly |
| SOPS + Age | Apache-2.0 | Git-native, simple |
| HashiCorp Vault | BSL | Enterprise, dynamic secrets |

## Environment-Specific Secrets

| Environment | Secret Source | Rotation |
|-------------|---------------|----------|
| Dev Sandbox | .env.local (gitignored) | N/A |
| Development | Infisical dev project | Monthly |
| Demo | Infisical demo project | Quarterly |
| Pre-Prod | Infisical staging project | Weekly |
| Production | Infisical prod project | Weekly + on-demand |

## Setup (Infisical)

### 1. Install CLI
```bash
# macOS
brew install infisical/get-cli/infisical

# Or via npm
npm install -g @infisical/cli
```

### 2. Login
```bash
infisical login
```

### 3. Initialize Project
```bash
infisical init
```

### 4. Pull Secrets
```bash
# For development
infisical run --env=dev -- pnpm run dev

# For specific environment
infisical run --env=staging -- pnpm run build
```

## Git-Native Secrets (SOPS)

For secrets that need to live in the repo (encrypted):

### Setup
```bash
# Install SOPS and Age
brew install sops age

# Generate key
age-keygen -o ~/.config/sops/age/keys.txt

# Configure SOPS
cat > .sops.yaml << EOF
creation_rules:
  - path_regex: \.enc\.yaml$
    age: >-
      age1xxxxxxxxx
EOF
```

### Usage
```bash
# Encrypt
sops -e secrets.yaml > secrets.enc.yaml

# Decrypt
sops -d secrets.enc.yaml > secrets.yaml

# Edit in place
sops secrets.enc.yaml
```

## CI/CD Secrets

### GitHub Actions
- Use GitHub Secrets for CI tokens
- Use OIDC for cloud provider auth (no long-lived keys)

### Dagger (if using)
- Inject via environment
- Use `dagger secret` for sensitive values

## Rotation Runbook

1. Generate new secret in Infisical
2. Deploy to pre-prod with new secret
3. Verify functionality
4. Deploy to production
5. Revoke old secret after grace period (24h)

## Emergency Rotation

```bash
# Rotate all secrets for an environment
infisical secrets rotate --env=prod --all

# Rotate specific secret
infisical secrets rotate --env=prod --name=DATABASE_URL
```
