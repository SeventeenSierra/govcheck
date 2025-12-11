<!-- SPDX-License-Identifier: LicenseRef-AllRightsReserved -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Setting Up a Nix Dev Environment with Biome for a TypeScript Monorepo

*A step-by-step guide to reproducible development environments*

**Published:** December 4, 2025  
**Reading time:** 10 minutes  
**Audience:** Developers setting up a new TypeScript monorepo or migrating from ESLint

---

## The Problem

You've just cloned a repository. You run `npm install` and... errors. Wrong Node version. You switch Node versions, try again, and now your global ESLint conflicts with the project's version. Sound familiar?

This guide shows you how to set up a **reproducible development environment** using Nix and Biome that eliminates these problems forever.

## What We're Building

By the end of this guide, you'll have:

- ✅ A Nix flake that provides exact tool versions
- ✅ Biome for lightning-fast linting and formatting
- ✅ Turborepo for monorepo task orchestration
- ✅ A working `lint`, `format`, and `typecheck` pipeline

## Prerequisites

- **Nix** with flakes enabled ([installation guide](https://nixos.org/download.html))
- **Git** for version control
- Basic familiarity with TypeScript and npm/pnpm

## Step 1: Create the Nix Flake

The flake defines your development environment. Create `flake.nix` in your repo root:

```nix
{
  description = "My TypeScript Monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
            biome

            # E2E testing (optional)
            playwright

            # Keep a stable tsc version handy
            nodePackages.typescript
          ];

          shellHook = ''
            echo "🚀 Dev Environment Ready"
            echo "Node: $(node --version)"
            echo "pnpm: $(pnpm --version)"
          '';
        };
      }
    );
}
```

### ⚠️ Common Pitfall: Transitive Dependencies

Don't reference nixpkgs through another flake input like this:

```nix
# ❌ WRONG - will fail if workstation doesn't exist
inputs.workstation.url = "path:./workstation";
inputs.nixpkgs.follows = "workstation/nixpkgs";
```

Always use a direct reference:

```nix
# ✅ CORRECT
inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
```

## Step 2: Enter the Dev Environment

```bash
# Update the lock file (first time or after changing flake.nix)
nix flake update

# Enter the development shell
nix develop
```

You should see:
```
🚀 Dev Environment Ready
Node: v22.21.1
pnpm: 9.15.0
```

Verify Biome is available:
```bash
which biome && biome --version
# /nix/store/.../bin/biome
# Version: 2.3.6
```

## Step 3: Configure Biome

Create `biome.json` in your repo root:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.6/schema.json",
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "suspicious": {
        "noEmptyBlock": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "enabled": true
    }
  },
  "json": {
    "formatter": {
      "enabled": true
    }
  },
  "css": {
    "parser": {
      "cssModules": true,
      "allowWrongLineComments": true,
      "tailwindDirectives": true
    }
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  }
}
```

### ⚠️ Common Pitfalls

1. **Schema version mismatch**: The `$schema` URL must match your Biome version. Run `biome migrate --write` if you see version warnings.

2. **VCS requires clientKind**: If you enable VCS integration, you *must* specify the client:
   ```json
   "vcs": {
     "enabled": true,
     "clientKind": "git",  // ← Required!
     "useIgnoreFile": true
   }
   ```

3. **Missing .gitignore**: If `useIgnoreFile` is true but no `.gitignore` exists, Biome will error.

4. **Tailwind CSS syntax**: For Tailwind 4.0's `@theme` and `@apply` directives, enable:
   ```json
   "css": {
     "parser": {
       "tailwindDirectives": true
     }
   }
   ```

## Step 4: Create .gitignore

Biome uses your `.gitignore` to skip files. Create one if it doesn't exist:

```gitignore
# Staging/Reference files (if applicable)
inbox/

# Dependencies
node_modules/

# Build outputs
dist/
.next/
out/
storybook-static/

# Turbo
.turbo/

# Cache
.cache/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/

# OS
.DS_Store

# Test results
test-results/
playwright-report/
coverage/
```

## Step 5: Add npm Scripts

Update your `package.json`:

```json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format . --write",
    "typecheck": "turbo run typecheck",
    "build": "turbo build",
    "dev": "turbo dev"
  }
}
```

## Step 6: Verify Everything Works

```bash
# Enter the Nix shell (if not already in it)
nix develop

# Install dependencies
pnpm install

# Run the checks
pnpm run lint      # Should pass with no errors
pnpm run format    # Formats files in place
pnpm run typecheck # Type checks all packages
```

## Troubleshooting

### "biome: command not found"

You're not in the Nix shell. Run `nix develop` first.

### "Could not resolve recommended: module not found"

You're using Biome 2.x with a 1.x config. The `"extends": ["recommended"]` syntax changed. In 2.x, use:

```json
"linter": {
  "rules": {
    "recommended": true
  }
}
```

Or run `biome migrate --write` to auto-fix.

### Thousands of lint errors from build outputs

Add build directories to `.gitignore`. With `useIgnoreFile: true`, Biome will skip them.

### TypeScript errors about missing modules

Check that your `tsconfig.json` has:
- A closing brace (syntax errors break everything)
- Proper `moduleResolution` (use `"bundler"` for modern setups)
- `"lib": ["ES2022", "DOM", "DOM.Iterable"]` for iterators

## Next Steps

- Set up CI to run these checks on every PR
- Add pre-commit hooks with Husky
- Configure VS Code to use Biome for formatting

## Resources

- [Biome Documentation](https://biomejs.dev/)
- [Nix Flakes Tutorial](https://nixos.wiki/wiki/Flakes)
- [Turborepo Documentation](https://turbo.build/repo/docs)

---

*Questions or issues? Check our [Knowledge Base](../knowledge-base/nix-biome-troubleshooting.md) for more troubleshooting tips.*
