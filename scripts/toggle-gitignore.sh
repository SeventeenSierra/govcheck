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
    
    # Uncomment the exclusion lines
    sed -i.tmp 's/^# \/apps\//\/apps\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/services\//\/services\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/packages\//\/packages\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/\.private\//\/\.private\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/ee\//\/ee\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/enterprise\//\/enterprise\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/scripts\//\/scripts\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/python\//\/python\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/tools\//\/tools\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/\.agent\//\/\.agent\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/\.kiro\//\/\.kiro\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/\.github\//\/\.github\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/\.husky\//\/\.husky\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/\.storybook\//\/\.storybook\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/\.vscode\//\/\.vscode\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/docs\/private\//\/docs\/private\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/signatures\//\/signatures\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/proprietary\//\/proprietary\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/commercial\//\/commercial\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^# \/internal\//\/internal\//' "$GITIGNORE_FILE"
    
    rm -f "$GITIGNORE_FILE.tmp"
    echo "Exclusions enabled. Backup saved as $BACKUP_FILE"
}

disable_exclusions() {
    echo "Disabling exclusions (tracking all content)..."
    cp "$GITIGNORE_FILE" "$BACKUP_FILE"
    
    # Comment out the exclusion lines
    sed -i.tmp 's/^\/apps\/$/# \/apps\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/services\/$/# \/services\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/packages\/$/# \/packages\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/\.private\/$/# \/\.private\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/ee\/$/# \/ee\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/enterprise\/$/# \/enterprise\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/scripts\/$/# \/scripts\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/python\/$/# \/python\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/tools\/$/# \/tools\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/\.agent\/$/# \/\.agent\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/\.kiro\/$/# \/\.kiro\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/\.github\/$/# \/\.github\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/\.husky\/$/# \/\.husky\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/\.storybook\/$/# \/\.storybook\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/\.vscode\/$/# \/\.vscode\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/docs\/private\/$/# \/docs\/private\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/signatures\/$/# \/signatures\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/proprietary\/$/# \/proprietary\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/commercial\/$/# \/commercial\//' "$GITIGNORE_FILE"
    sed -i.tmp 's/^\/internal\/$/# \/internal\//' "$GITIGNORE_FILE"
    
    rm -f "$GITIGNORE_FILE.tmp"
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