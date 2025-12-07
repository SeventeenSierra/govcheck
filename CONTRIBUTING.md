# Contributing Guidelines

Thank you for your interest in contributing to this project!

## Developer Certificate of Origin (DCO)

All contributions must be signed-off per the [DCO](https://developercertificate.org/):

```bash
git commit -s -m "feat(scope): description"
```

This attestation confirms you have the right to submit the contribution under this project's license.

## Commit Standards

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

Signed-off-by: Your Name <email@example.com>
AI-Agent: <model-if-applicable>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

## Development Setup

1. Enter the Nix development shell:
   ```bash
   nix develop
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run development server:
   ```bash
   pnpm dev
   ```

## Quality Checks

Before submitting a PR:

```bash
pnpm lint      # Check for lint errors
pnpm format    # Format code
pnpm typecheck # Type check
pnpm e2e       # Run E2E tests
```

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you agree to uphold this code.

## Questions?

Open a GitHub Discussion or reach out to the maintainers.
