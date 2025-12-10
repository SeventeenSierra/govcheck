# Development Environment SOP

**Standard Operating Procedure for Maintainers**

*Last Updated: December 4, 2024*

---

## Purpose

This document provides standard procedures for maintaining and troubleshooting the development environment for the 17s monorepo.

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Updating Dependencies](#updating-dependencies)
3. [Upgrading Biome](#upgrading-biome)
4. [Updating Nix Flake](#updating-nix-flake)
5. [Adding New Packages to Monorepo](#adding-new-packages-to-monorepo)
6. [CI/CD Considerations](#cicd-considerations)
7. [Incident Response](#incident-response)

---

## Daily Operations

### Entering the Development Environment

```bash
cd /path/to/17s-mono
nix develop
```

**Expected output:**
```
🚀 17s Dev Environment
Node: v22.21.1
pnpm: 9.15.0
```

### Running Quality Checks

Before committing, always run:

```bash
pnpm run lint       # Check for lint errors
pnpm run format     # Auto-format code
pnpm run typecheck  # Type check all packages
```

### Installing Dependencies

```bash
pnpm install
```

For a specific package:
```bash
pnpm add <package> --filter @repo/ui
```

---

## Updating Dependencies

### Prerequisites Checklist

- [ ] All tests passing on main branch
- [ ] Clean working directory
- [ ] Inside Nix shell (`nix develop`)

### Procedure

1. **Create a branch:**
   ```bash
   git checkout -b chore/update-dependencies
   ```

2. **Update all dependencies:**
   ```bash
   pnpm update --recursive
   ```

3. **Run full test suite:**
   ```bash
   pnpm run lint
   pnpm run typecheck
   pnpm run build
   pnpm run e2e
   ```

4. **Review changes:**
   ```bash
   git diff pnpm-lock.yaml
   ```

5. **Commit and push:**
   ```bash
   git add -A
   git commit -m "chore: update dependencies"
   git push origin chore/update-dependencies
   ```

### Rollback Procedure

If issues arise after updating:

```bash
git checkout main -- pnpm-lock.yaml
pnpm install
```

---

## Upgrading Biome

### When to Upgrade

- Security patches
- New rule additions needed
- Performance improvements

### Procedure

1. **Check current version:**
   ```bash
   biome --version
   ```

2. **Update Nix flake to pull latest nixpkgs:**
   ```bash
   nix flake update
   ```

3. **Re-enter shell:**
   ```bash
   exit
   nix develop
   ```

4. **Verify new version:**
   ```bash
   biome --version
   ```

5. **Run migration (if major version change):**
   ```bash
   biome migrate --write
   ```

6. **Update schema in biome.json:**
   ```json
   "$schema": "https://biomejs.dev/schemas/X.Y.Z/schema.json"
   ```

7. **Run lint to verify:**
   ```bash
   pnpm run lint
   ```

### ⚠️ Watch For

- **Deprecated rules**: Check release notes for removed/renamed rules
- **Schema changes**: Run `biome migrate --write` to auto-fix
- **New default rules**: May introduce new errors in existing code

---

## Updating Nix Flake

### Regular Updates

```bash
nix flake update
```

This updates all inputs (nixpkgs, flake-utils) to latest versions.

### Pinning a Specific Version

To pin nixpkgs to a specific commit:

```nix
inputs.nixpkgs.url = "github:NixOS/nixpkgs/abc123def456";
```

Then run:
```bash
nix flake lock --update-input nixpkgs
```

### Verifying Changes

After updating:

```bash
# Exit and re-enter
exit
nix develop

# Verify tool versions
node --version
pnpm --version
biome --version
```

---

## Adding New Packages to Monorepo

### Procedure

1. **Create package directory:**
   ```bash
   mkdir -p packages/new-package
   cd packages/new-package
   ```

2. **Initialize package.json:**
   ```json
   {
     "name": "@repo/new-package",
     "version": "0.0.0",
     "private": true,
     "scripts": {
       "lint": "biome lint .",
       "typecheck": "tsc --noEmit"
     }
   }
   ```

3. **Add to Turbo pipeline** (if it has build/typecheck tasks):
   
   Edit `turbo.json` to include the package in relevant pipelines.

4. **Install dependencies from root:**
   ```bash
   cd ../..
   pnpm install
   ```

5. **Verify checks work:**
   ```bash
   pnpm run lint
   pnpm run typecheck
   ```

---

## CI/CD Considerations

### Required Environment in CI

CI runners need Nix installed. Example GitHub Actions setup:

```yaml
- name: Install Nix
  uses: cachix/install-nix-action@v24
  with:
    nix_path: nixpkgs=channel:nixos-unstable

- name: Run checks
  run: |
    nix develop --command bash -c "pnpm install && pnpm run lint && pnpm run typecheck"
```

### Caching

Cache these directories for faster CI:

- `~/.cache/nix` — Nix store cache
- `node_modules` — pnpm dependencies
- `.turbo` — Turborepo cache

---

## Incident Response

### Lint Failing After Dependency Update

1. Check if Biome version changed:
   ```bash
   biome --version
   ```

2. Run migration:
   ```bash
   biome migrate --write
   ```

3. If rules have changed, review and fix violations or update config.

### "biome: command not found"

1. Ensure you're in Nix shell:
   ```bash
   nix develop
   ```

2. If Nix shell fails, check flake:
   ```bash
   nix flake check
   ```

3. Rebuild if inputs are stale:
   ```bash
   nix flake update
   nix develop
   ```

### TypeScript Errors After Package Addition

1. Check `tsconfig.json` syntax (valid JSON?)
2. Verify `moduleResolution` is set correctly
3. Run `pnpm install` to ensure types are installed

---

## Contacts

- **Primary Maintainer**: [Add name]
- **Escalation Path**: [Add details]

---

*For more troubleshooting, see the [Knowledge Base](../knowledge-base/nix-biome-troubleshooting.md).*
