<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

📧 **security@seventeensierra.com**

Please include:

1. **Description** of the vulnerability
2. **Steps to reproduce** (proof of concept if possible)
3. **Impact assessment** (what could an attacker do?)
4. **Affected versions** (if known)
5. **Suggested fix** (if you have one)

## Response Timeline

| Stage | Timeframe |
|-------|-----------|
| Initial response | Within 48 hours |
| Triage & assessment | Within 7 days |
| Fix development | Varies by severity |
| Public disclosure | After fix is released |

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest release | ✅ |
| Previous minor | ✅ (security fixes only) |
| Older versions | ❌ |

## Security Measures

This project implements comprehensive security for Federal Compliance compliance validation:

- 🔒 Signed commits required (DCO compliance)
- 🔍 Automated security scanning (Semgrep, Gitleaks, Trivy)
- 📦 SBOM generation for supply chain transparency
- 🔄 Automated dependency updates (Renovate)
- 📋 License compliance checking
- 🛡️ AWS Bedrock secure integration for AI processing
- 🔐 Railway deployment with secrets management
- 🎯 AI zones for controlled autonomous operations
- 📋 Federal compliance documentation (NSF requirements)

## Responsible Disclosure

We follow responsible disclosure practices:

1. Report vulnerabilities privately
2. We'll work with you to understand and fix the issue
3. We'll credit you in the security advisory (unless you prefer anonymity)
4. Public disclosure happens after a fix is available

## Bug Bounty

We do not currently have a formal bug bounty program, but we deeply appreciate security researchers who help keep our users safe.

## Security-Related Configuration

See [docs/runbooks/security-incident-response.md](./docs/runbooks/security-incident-response.md) for incident response procedures.
