# Knowledge Base

This knowledge base contains lessons learned, troubleshooting guides, and solutions to common problems encountered while working with the 17s monorepo.

## Articles

| Article | Description |
|---------|-------------|
| [Nix & Biome Troubleshooting](./nix-biome-troubleshooting.md) | Common issues and solutions for the dev environment |

## Contributing

When you encounter and solve a problem:

1. Check if it's already documented
2. If not, add a new section to the relevant article or create a new article
3. Include:
   - **Symptom**: What you saw (error message, behavior)
   - **Cause**: Why it happened
   - **Solution**: How to fix it
   - **Prevention**: How to avoid it in the future

## Quick Reference

### Essential Commands

```bash
# Enter dev environment
nix develop

# Update Nix inputs
nix flake update

# Migrate Biome config after version change
biome migrate --write

# Full quality check
pnpm run lint && pnpm run format && pnpm run typecheck
```

### File Locations

| Config File | Purpose |
|-------------|---------|
| `flake.nix` | Nix development environment |
| `biome.json` | Linter and formatter settings |
| `turbo.json` | Monorepo task definitions |
| `pnpm-workspace.yaml` | Workspace package locations |
| `.gitignore` | Files ignored by Git and Biome |
