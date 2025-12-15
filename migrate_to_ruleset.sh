#!/bin/bash
set -e

REPO="SeventeenSierra/govcheck"
RULESET_NAME="Core Branch Protocol"

echo "Creating GitHub Ruleset: $RULESET_NAME..."

# JSON payload for the Ruleset
# Targets: main, develop, af-nonopen
# Rules: No deletion, No force push, PR Required (1 approval)

cat <<EOF > ruleset_config.json
{
  "name": "$RULESET_NAME",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": [
        "refs/heads/main",
        "refs/heads/develop",
        "refs/heads/af-nonopen"
      ],
      "exclude": []
    }
  },
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ],
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "required_signatures"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    }
  ]
}
EOF

# Create the ruleset
gh api -X POST "repos/$REPO/rulesets" --input ruleset_config.json

echo "Ruleset created successfully!"
echo "------------------------------------------------"
echo "Removing Classic Protections..."

BRANCHES=("main" "develop" "af-nonopen")

for branch in "${BRANCHES[@]}"; do
  echo "Removing protection from: $branch"
  # Ignore error if protection doesn't exist (|| true)
  gh api -X DELETE "repos/$REPO/branches/$branch/protection" || echo "No classic protection found for $branch, skipping."
done

echo "------------------------------------------------"
echo "Migration complete!"
rm ruleset_config.json
