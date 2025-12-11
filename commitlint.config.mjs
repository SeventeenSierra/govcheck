// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

// Commitlint configuration for Proposal Prepper (Contract Checker)
// Supports conventional commits with AI agent trailers

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Conventional commit type validation
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, etc.)
        "refactor", // Code refactoring
        "test", // Adding or updating tests
        "chore", // Maintenance tasks
        "ci", // CI/CD changes
        "perf", // Performance improvements
        "build", // Build system changes
        "revert", // Revert previous commit
      ],
    ],

    // Scope validation for microservice architecture
    "scope-enum": [
      2,
      "always",
      [
        // Services
        "web", // Next.js web app
        "strands", // Python strands-agent service
        "genkit", // Node.js genkit service

        // Packages
        "ui", // @aatb/ui package
        "lib", // @aatb/lib package

        // Infrastructure
        "docker", // Docker and compose files
        "railway", // Railway deployment
        "ci", // GitHub Actions
        "deps", // Dependencies

        // Project areas
        "compliance", // NSF PAPPG compliance logic
        "orchestration", // Federated mesh orchestration
        "api", // API routes and endpoints
        "components", // UI components
        "docs", // Documentation
        "config", // Configuration files
        "security", // Security and secrets
        "tests", // Testing

        // Data
        "seed", // Seed data and fixtures
        "schemas", // Data schemas and validation
      ],
    ],

    // Message format requirements
    "subject-case": [2, "never", ["pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 100],

    // Header format
    "header-max-length": [2, "always", 100],

    // AI agent trailer validation
    "ai-agent-trailer": [2, "always"],
  },

  // Custom parser to handle AI agent trailers
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\(([^)]*)\))?: (.*)$/,
      headerCorrespondence: ["type", "scope", "subject"],
      noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
      revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
      revertCorrespondence: ["header", "hash"],
    },
  },

  // Plugin for AI agent trailer validation
  plugins: [
    {
      rules: {
        "ai-agent-trailer": (parsed) => {
          const { raw } = parsed;
          const hasAIAgent = /AI-Agent:\s*\w+/.test(raw);
          const hasHumanInvolvement =
            /Human-Involvement:\s*(full|reviewed|approved|automated)/.test(raw);

          // Skip validation for merge commits and automated commits
          if (parsed.merge || parsed.revert) {
            return [true];
          }

          if (!hasAIAgent) {
            return [false, "Missing required AI-Agent trailer"];
          }

          if (!hasHumanInvolvement) {
            return [false, "Missing required Human-Involvement trailer"];
          }

          return [true];
        },
      },
    },
  ],
};
