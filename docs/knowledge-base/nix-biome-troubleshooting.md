# Nix & Biome Troubleshooting Guide

*A collection of issues we've encountered and how to solve them.*

---

## Table of Contents

1. [Nix / Flake Issues](#nix--flake-issues)
2. [Biome Issues](#biome-issues)
3. [TypeScript Issues](#typescript-issues)
4. [Monorepo / Turbo Issues](#monorepo--turbo-issues)

---

## Nix / Flake Issues

### ❌ "biome: command not found" (or any tool)

**Symptom:**
```
zsh: biome: command not found
```

**Cause:** You're not inside the Nix development shell.

**Solution:**
```bash
nix develop
```

**Prevention:** Always run `nix develop` after opening a new terminal.

---

### ❌ Flake references a missing path

**Symptom:**
```
error: path '/path/to/repo/workstation' does not exist
```

**Cause:** The `flake.nix` references another flake via a relative path that doesn't exist:
```nix
inputs.workstation.url = "path:./workstation";
inputs.nixpkgs.follows = "workstation/nixpkgs";
```

**Solution:** Remove the transitive dependency and reference nixpkgs directly:
```nix
inputs = {
  nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  flake-utils.url = "github:numtide/flake-utils";
};
```

Then run:
```bash
nix flake update
nix develop
```

**Prevention:** Always use direct references to inputs unless you're intentionally sharing a flake.

---

### ❌ "SQLite database is busy"

**Symptom:**
```
error (ignored): SQLite database '/Users/.../.cache/nix/eval-cache-v6/....sqlite' is busy
```

**Cause:** Multiple Nix processes accessing the cache simultaneously.

**Solution:** This is usually a warning, not a blocker. If commands hang:
1. Close other terminals running Nix commands
2. Wait a moment and retry
3. If persistent: `rm -rf ~/.cache/nix/eval-cache-v6/`

---

### ❌ Flake inputs are stale

**Symptom:** Tool versions are outdated even though nixpkgs has newer versions.

**Solution:**
```bash
nix flake update
exit
nix develop
```

---

## Biome Issues

### ❌ "Could not resolve recommended: module not found"

**Symptom:**
```
Failed to resolve the configuration from recommended
Caused by: Could not resolve recommended: module not found
```

**Cause:** You're using Biome 2.x with a Biome 1.x configuration. The `extends` syntax changed.

**Old (1.x):**
```json
{
  "extends": ["recommended"]
}
```

**New (2.x):**
```json
{
  "linter": {
    "rules": {
      "recommended": true
    }
  }
}
```

**Solution:**
```bash
biome migrate --write
```

---

### ❌ Schema version mismatch

**Symptom:**
```
The configuration schema version does not match the CLI version 2.3.6
Expected: 2.3.6
Found: 2.0.0
```

**Solution:**
```bash
biome migrate --write
```

Or manually update the `$schema` URL:
```json
"$schema": "https://biomejs.dev/schemas/2.3.6/schema.json"
```

---

### ❌ "You enabled the VCS integration, but you didn't specify a client"

**Symptom:**
```
You enabled the VCS integration, but you didn't specify a client.
Biome will disable the VCS integration until the issue is fixed.
```

**Cause:** VCS is enabled but missing `clientKind`.

**Solution:** Add the required field:
```json
"vcs": {
  "enabled": true,
  "clientKind": "git",
  "useIgnoreFile": true
}
```

---

### ❌ "Biome couldn't find an ignore file"

**Symptom:**
```
Biome couldn't find an ignore file in the following folder: /path/to/repo
```

**Cause:** `useIgnoreFile: true` is set but no `.gitignore` exists.

**Solution:** Create a `.gitignore`:
```bash
touch .gitignore
```

Add at minimum:
```gitignore
node_modules/
dist/
.next/
```

---

### ❌ "Tailwind-specific syntax is disabled"

**Symptom:**
```
parse ━━━━━━━━━
✖ Tailwind-specific syntax is disabled.
@theme {
```

**Cause:** CSS file uses Tailwind 4.0's `@theme`, `@apply`, or `@utility` directives but parser doesn't understand them.

**Solution:** Enable Tailwind directives in `biome.json`:
```json
"css": {
  "parser": {
    "tailwindDirectives": true
  }
}
```

---

### ❌ Thousands of errors from build outputs

**Symptom:** Linting shows errors in `node_modules/`, `dist/`, `.next/`, or other generated code.

**Cause:** These directories aren't being ignored.

**Solution:**

1. Add them to `.gitignore`:
   ```gitignore
   node_modules/
   dist/
   .next/
   storybook-static/
   ```

2. Ensure VCS integration is enabled:
   ```json
   "vcs": {
     "enabled": true,
     "clientKind": "git",
     "useIgnoreFile": true
   }
   ```

---

### ❌ Nursery rules not recognized

**Symptom:**
```
Property useConsistentArrayType is not allowed.
```

**Cause:** Biome 2.x moved, renamed, or removed many nursery rules. They're no longer under `nursery`.

**Solution:** Remove the unrecognized rules or check the [Biome changelog](https://biomejs.dev/blog/) for new rule names.

---

## TypeScript Issues

### ❌ "'}' expected" in tsconfig.json

**Symptom:**
```
tsconfig.json(24,7): error TS1005: '}' expected.
```

**Cause:** JSON syntax error—usually a trailing comma or missing closing brace.

**Solution:** Validate the JSON syntax. Check for:
- Trailing commas after last items (not allowed in JSON)
- Missing closing braces `}`

---

### ❌ "Cannot find module 'react'"

**Symptom:**
```
error TS2307: Cannot find module 'react' or its corresponding type declarations.
```

**Cause:** Dependencies not installed, or `tsconfig.json` has wrong settings.

**Solution:**
```bash
pnpm install
```

If that doesn't help, check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true
  }
}
```

---

### ❌ "'--jsx' is not set"

**Symptom:**
```
error TS6142: Module './button' was resolved to '.../button.tsx', but '--jsx' is not set.
```

**Cause:** TypeScript found JSX but JSX support isn't configured.

**Solution:** Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

---

## Monorepo / Turbo Issues

### ❌ Typecheck fails for one package

**Symptom:**
```
@repo/ui:typecheck: ERROR: command finished with error
```

**Cause:** That specific package has TypeScript errors or config issues.

**Solution:**
1. Navigate to that package
2. Run typecheck directly to see full error:
   ```bash
   cd packages/ui
   pnpm run typecheck
   ```
3. Fix the errors shown

---

### ❌ "Cannot find module" for internal packages

**Symptom:**
```
Cannot find module '@repo/ui' or its corresponding type declarations.
```

**Cause:** The internal package isn't properly linked.

**Solution:**
1. Ensure the package is in `pnpm-workspace.yaml`
2. Run `pnpm install` from root
3. Check the consuming package has the dependency:
   ```json
   "dependencies": {
     "@repo/ui": "workspace:*"
   }
   ```

---

## Still Stuck?

1. **Search existing issues** in the repo's issue tracker
2. **Check the Biome Discord** for similar problems
3. **Run with verbose output**:
   ```bash
   biome lint . --verbose
   ```
4. **Create a minimal reproduction** and open an issue

---

*Found a solution to a new problem? Please add it to this document!*
