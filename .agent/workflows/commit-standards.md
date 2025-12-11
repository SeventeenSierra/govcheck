---
description: Commit message format, trailers, and DCO requirements for Proposal Prepper microservices
---

# Commit Standards

## Format (commitlint enforced)
```
<type>(<scope>): <description>
                                    ← BLANK LINE REQUIRED
[optional body]

[trailers]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`, `revert`

## Microservice Scopes
**Services:**
- `web` - Next.js web app
- `strands` - Python strands-agent service  
- `genkit` - Node.js genkit service

**Packages:**
- `ui` - @aatb/ui package
- `lib` - @aatb/lib package

**Infrastructure:**
- `docker` - Docker and compose files
- `railway` - Railway deployment
- `ci` - GitHub Actions
- `deps` - Dependencies

**Project Areas:**
- `compliance` - NSF PAPPG compliance logic
- `orchestration` - Federated mesh orchestration
- `api` - API routes and endpoints
- `components` - UI components
- `docs` - Documentation
- `config` - Configuration files
- `security` - Security and secrets
- `tests` - Testing
- `seed` - Seed data and fixtures
- `schemas` - Data schemas and validation

## Required Trailers
```
Human-Involvement: reviewed
AI-Agent: <model>
Signed-off-by: <human>       ← Added by human via -s flag
```

**Human Involvement Levels:**
- `full` - Human wrote the code, AI may have assisted
- `reviewed` - AI wrote, human reviewed line-by-line
- `approved` - AI wrote, human approved without line-by-line review
- `automated` - Fully autonomous, no human involvement
## Examples

### Feature Addition
```
feat(strands): add NSF PAPPG compliance validation

Implements Section 2.B.2(f)(i) validation for biographical sketches
using AWS Bedrock Claude integration.

Human-Involvement: reviewed
AI-Agent: kiro
Signed-off-by: Alice <alice@seventeensierra.com>
```

### Bug Fix
```
fix(web): resolve proposal upload timeout

Increases timeout from 30s to 120s for large PDF processing.
Adds progress indicator for user feedback.

Human-Involvement: reviewed
AI-Agent: antigravity
Signed-off-by: Bob <bob@seventeensierra.com>
```

### Documentation
```
docs(api): update Federated Mesh architecture guide

Documents service communication patterns and error handling
strategies for the orchestration layer.

Human-Involvement: approved
AI-Agent: cline
Signed-off-by: Carol <carol@seventeensierra.com>
```

## AI Workflow for Commits

**AI provides the full commit command for human to copy-paste:**

```markdown
### Ready to Commit

Copy and run this command:
```bash
git commit -s -m 'feat(strands): add compliance validation

Implements NSF PAPPG validation logic.

Human-Involvement: reviewed
AI-Agent: kiro'
```
```

**Rules:**
- ✅ AI provides complete `git commit -s -m '...'` command
- ✅ AI includes all trailers in the command
- ✅ AI uses proper microservice scope from approved list
- ❌ AI does NOT execute the commit itself
- ❌ AI does NOT use run_command for `git commit`
- ⚠️ Blank line after subject is REQUIRED
- ⚠️ Line length max: 100 characters
- ⚠️ Scope must match commitlint.config.mjs validation