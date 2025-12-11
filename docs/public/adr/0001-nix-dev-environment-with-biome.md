<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# ADR-0001: Nix Dev Environment with Biome

## Status

**Accepted** — December 4, 2025

## Context

Setting up a consistent development environment across team members and CI/CD pipelines is challenging. Different Node.js versions, package manager versions, and tool installations lead to "works on my machine" problems.

Additionally, we needed to choose a linting and formatting strategy for our TypeScript/React monorepo. The traditional ESLint + Prettier combination has served projects well but comes with:

- Complex configuration across multiple config files
- Slower performance on large codebases
- Plugin compatibility issues with ESLint 9.x flat configs
- Two separate tools to maintain and configure

We evaluated:
1. **ESLint + Prettier** — Industry standard but complex configuration
2. **Biome** — Fast, unified linter/formatter in Rust
3. **Oxlint** — Fast linter, but no formatting support

## Decision

We will use:

1. **Nix Flakes** for reproducible development environments
   - Provides exact versions of Node.js, pnpm, and tools
   - Single `nix develop` command to enter the environment
   - Works on macOS and Linux

2. **Biome 2.x** for linting and formatting
   - Single tool for both linting and formatting
   - 10-100x faster than ESLint + Prettier
   - Native TypeScript support
   - Built-in recommended rules

3. **Turborepo** for monorepo orchestration
   - Handles cross-package dependencies
   - Caches build artifacts
   - Parallelizes tasks

### Configuration Files

```
flake.nix          # Nix dev environment definition
biome.json         # Biome linter/formatter config
turbo.json         # Turborepo task definitions
pnpm-workspace.yaml # Workspace package locations
```

### Key Scripts

```json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format . --write",
    "typecheck": "turbo run typecheck"
  }
}
```

## Consequences

### Positive

- **Reproducibility**: Every developer gets identical tool versions via Nix
- **Speed**: Biome is significantly faster than ESLint + Prettier
- **Simplicity**: One config file instead of multiple ESLint/Prettier configs
- **Consistency**: Same environment locally and in CI
- **Onboarding**: New developers run `nix develop` and they're ready

### Negative

- **Nix learning curve**: Developers unfamiliar with Nix need initial guidance
- **Biome ecosystem**: Fewer plugins than ESLint (though this is improving)
- **Migration effort**: Existing ESLint configs needed to be translated

### Neutral

- Biome's rule set differs slightly from ESLint; some adjustments to code style expected
- VCS integration requires `.gitignore` for Biome to respect ignored paths

## Implementation Notes

### Critical Configuration Details

1. **Biome 2.x schema**: Must use `$schema` matching installed version
   ```json
   "$schema": "https://biomejs.dev/schemas/2.3.6/schema.json"
   ```

2. **VCS integration**: Requires explicit `clientKind`
   ```json
   "vcs": {
     "enabled": true,
     "clientKind": "git",
     "useIgnoreFile": true
   }
   ```

3. **Tailwind CSS support**: Enable for CSS files using `@theme`, `@apply`
   ```json
   "css": {
     "parser": {
       "tailwindDirectives": true
     }
   }
   ```

4. **Flake inputs**: Direct nixpkgs reference, not transitive
   ```nix
   inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
   ```

## References

- [Biome Documentation](https://biomejs.dev/)
- [Nix Flakes](https://nixos.wiki/wiki/Flakes)
- [Turborepo Documentation](https://turbo.build/repo/docs)
