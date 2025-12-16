# Documentation Split Plan for af-nonopen vs develop

## Files for af-nonopen ONLY (Internal)

These files should NEVER go to develop:

- `WORKFLOW_GUIDE.md` - Team workflow for managing branches
- `BRANCH_STRUCTURE.md` - Internal branch strategy
- `TEAM_DEPLOYMENT_GUIDE.md` - Internal deployment guide
- `GEMINI.md` - AI agent integration
- `AI_CONTRIBUTOR_POLICY.md` - AI development policy
- `.gitleaks.toml` - Security scanning config
- `.agent/` - AI agent configs
- `.kiro/` - IDE specs
- `scripts/toggle-gitignore.sh` - Branch management
- `containers/` - Docker infrastructure
- `database/` - Database schemas
- `services/strands/` - Python backend
- `src/adapters/` - Backend adapters
- `src/app/api/` - API routes
- `src/services/` - Mock services
- `src/test-utils/` - Test infrastructure
- `.storybook/` - Storybook config

## Files for develop (Customer-Facing) - Need Cleanup

These need to be cleaned of backend/internal references:

### Root Documentation
- `README.md` - Should focus on frontend-only setup
- `CONTRIBUTING.md` - Should guide frontend contributions only
- `SECURITY.md` - Should cover frontend security only
- `LICENSING.md` - Should explain AGPL-3.0-or-later

### Public Documentation (docs/public/)
- `QUICKSTART.md` - Frontend quickstart only
- `API_INTEGRATION.md` - How customer connects their backend
- `DEPLOYMENT.md` - Frontend deployment only
- `UI_DEVELOPMENT_GUIDE.md` -Already cleaned ✅

### Config Files
- `package.json` - Frontend dependencies only ✅ (already correct)
- `tsconfig.json` - Already correct ✅
- `next.config.ts` - Already correct ✅

## Files NOT Needed on develop

- `DEPLOYMENT_SUMMARY.md` - Internal deployment summary
- `DEPENDENCY-MANAGEMENT.md` - Internal dependency management
- `CHANGELOG.md` - Customer doesn't need internal changelog
- `CLA.md`, `DCO.md` - Internal contribution agreements
- `VERSIONING.md` - Internal versioning strategy
- `CODE_OF_CONDUCT.md` - Can stay, general community doc

## Action Plan

### For af-nonopen (current branch)
Keep all files as-is. Add:
1. WORKFLOW_GUIDE.md ✅ (already done)
2. BRANCH_STRUCTURE.md ✅ (already done)  
3. Keep internal references intact

### For develop (future cherry-pick)
Create minimal customer-facing documentation:
1. README.md - Frontend-only version
2. CONTRIBUTING.md - Frontend contribution guide
3. SECURITY.md - Frontend security
4. UI_DEVELOPMENT_GUIDE.md ✅ (already cleaned)
5. docs/public/QUICKSTART.md - Frontend quickstart
6. docs/public/API_INTEGRATION.md - Backend integration guide
7. docs/public/DEPLOYMENT.md - Frontend deployment

### Files to Exclude from develop Entirely
Everything else stays on af-nonopen only.
