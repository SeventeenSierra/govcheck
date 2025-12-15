#!/bin/bash
set -e

# 1. Text Replacement: "Proposal Prepper" -> "GovCheck"
echo "Replacing 'Proposal Prepper' with 'GovCheck'..."
grep -r -l "Proposal Prepper" . --exclude-dir=.git --exclude-dir=.gemini --exclude=rename_project.sh | while read -r file; do
  perl -pi -e 's/Proposal Prepper/GovCheck/g' "$file"
done

# 2. Text Replacement: "proposal-prepper" -> "govcheck"
echo "Replacing 'proposal-prepper' with 'govcheck'..."
grep -r -l "proposal-prepper" . --exclude-dir=.git --exclude-dir=.gemini --exclude=rename_project.sh | while read -r file; do
  perl -pi -e 's/proposal-prepper/govcheck/g' "$file"
done

# 3. Rename specific workspace file
if [ -f "proposal-prepper-homelab.code-workspace" ]; then
    echo "Renaming workspace file..."
    mv proposal-prepper-homelab.code-workspace govcheck-homelab.code-workspace
fi

echo "Rename complete."
