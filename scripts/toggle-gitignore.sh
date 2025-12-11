#!/bin/bash
# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Toggle .gitignore for branch-specific content management

set -e

GITIGNORE_FILE=".gitignore"
BACKUP_FILE=".gitignore.backup"

show_help() {
    echo "Usage: $0 [enable|disable|status]"
    echo ""
    echo "Commands:"
    echo "  enable   - Enable exclusions (hide proprietary content)"
    echo "  disable  - Disable exclusions (track all content - for ai-ssdf-nonopen)"
    echo "  status   - Show current exclusion status"
    echo ""
    echo "This script toggles the AI-SSDF-NONOPEN specific exclusions in .gitignore"
}

check_status() {
    if grep -q "^# /apps/" "$GITIGNORE_FILE"; then
        echo "DISABLED (tracking all content - ai-ssdf-nonopen mode)"
        return 1
    elif grep -q "^/apps/" "$GITIGNORE_FILE"; then
        echo "ENABLED (excluding proprietary content - main/develop mode)"
        return 0
    else
        echo "UNKNOWN (cannot determine status)"
        return 2
    fi
}

enable_exclusions() {
    echo "Enabling exclusions (hiding proprietary content)..."
    cp "$GITIGNORE_FILE" "$BACKUP_FILE"
    
    # Create a develop-compatible gitignore with exclusions
    # Start with develop branch base and add exclusions
    cat > "$GITIGNORE_FILE" << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage
/test-results/
/playwright-report/

# next.js
/.next/
/out/

# production
/build

# storybook
/storybook-static/

# misc
.DS_Store
*.pem
/inbox/

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
dev_output.log

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Branch-specific exclusions (ai-ssdf-nonopen content)
/apps/
/services/
/packages/
/.private/
/ee/
/enterprise/
/scripts/
/python/
/tools/
/.agent/
/.kiro/
/.github/
/.husky/
/.storybook/
/.vscode/
/docs/private/
/signatures/
/proprietary/
/commercial/
/internal/
EOF
    
    echo "Exclusions enabled. Backup saved as $BACKUP_FILE"
}

disable_exclusions() {
    echo "Disabling exclusions (tracking all content)..."
    cp "$GITIGNORE_FILE" "$BACKUP_FILE"
    
    # Restore the full branch-specific strategy gitignore
    cat > "$GITIGNORE_FILE" << 'EOF'
# SPDX-License-Identifier: AGPL-3.0-or-later
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# =============================================================================
# BRANCH-SPECIFIC GITIGNORE STRATEGY
# =============================================================================
# 
# This .gitignore supports branch-specific content management:
#
# AI-SSDF-NONOPEN BRANCH:
#   - All content is tracked and committed (exclusions are commented out)
#   - Contains full licensing work, private docs, proprietary content
#
# OTHER BRANCHES (main, develop):
#   - Uncomment the "AI-SSDF-NONOPEN SPECIFIC EXCLUSIONS" section
#   - This will exclude proprietary content when merging/cherry-picking
#
# USAGE:
#   1. On ai-ssdf-nonopen: Keep exclusions commented (track everything)
#   2. When merging to other branches: Uncomment exclusions as needed
#   3. Use selective git add/commit for fine-grained control
#
# =============================================================================

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage
/test-results/
/playwright-report/

# next.js
/.next/
/out/

# production
/build

# storybook
/storybook-static/

# misc
.DS_Store
*.pem
/inbox/

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
dev_output.log

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# =============================================================================
# BRANCH-SPECIFIC CONTENT EXCLUSIONS
# =============================================================================

# -----------------------------------------------------------------------------
# AI-SSDF-NONOPEN BRANCH SPECIFIC EXCLUSIONS
# -----------------------------------------------------------------------------
# Comment out this entire section when merging ai-ssdf-nonopen content to other branches
# Uncomment when you want to exclude this content from commits

# Proprietary Applications & Services (All Rights Reserved - UNLICENSED)
# /apps/
# /services/
# /packages/

# Private AI Flows Package (mentioned in session context)
# /.private/

# Enterprise/Commercial Features (future)
# /ee/
# /enterprise/

# Internal Tools & Utilities (PolyForm Perimeter - not open source)
# /scripts/
# /python/
# /tools/

# Development & Configuration (PolyForm Perimeter - not open source)
# /.agent/
# /.kiro/
# /.github/
# /.husky/
# /.storybook/
# /.vscode/

# Private Documentation (All Rights Reserved)
# /docs/private/

# Signatures and Legal
# /signatures/

# Any future proprietary directories
# /proprietary/
# /commercial/
# /internal/

# -----------------------------------------------------------------------------
# END AI-SSDF-NONOPEN SPECIFIC EXCLUSIONS
# -----------------------------------------------------------------------------

# =============================================================================
# UNIVERSAL EXCLUSIONS (ALWAYS IGNORED)
# =============================================================================

# Vendor Code (Various licenses - preserve originals)
/vendor/

# Root Configuration Files (tracked but can be selectively excluded)
# Uncomment individual lines below to exclude specific config files:
# /commitlint.config.mjs
# /.gitleaks.toml
# /biome.json
# /next.config.ts
# /tailwind.config.ts
# /tsconfig.json
# /vitest.config.ts
# /playwright.config.ts
# /postcss.config.mjs
# /knip.json
# /renovate.json
# /pnpm-workspace.yaml
# /docker-compose.yml
# /flake.nix
# /flake.lock

# NOTE: flake.lock must be pure JSON (no SPDX headers allowed)
EOF
    
    echo "Exclusions disabled. Backup saved as $BACKUP_FILE"
}

case "${1:-}" in
    "enable")
        enable_exclusions
        ;;
    "disable")
        disable_exclusions
        ;;
    "status")
        check_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "Error: Invalid command '${1:-}'"
        echo ""
        show_help
        exit 1
        ;;
esac