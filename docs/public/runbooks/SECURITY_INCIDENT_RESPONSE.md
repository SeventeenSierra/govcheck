<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Security Incident Response Runbook

## Purpose

This runbook provides step-by-step guidance for handling security incidents.

## Severity Classification

| Severity | Definition | Response Time |
|----------|------------|---------------|
| **Critical** | Active exploitation, data breach, system compromise | < 1 hour |
| **High** | Vulnerability with exploit available, sensitive data at risk | < 4 hours |
| **Medium** | Vulnerability requiring specific conditions | < 24 hours |
| **Low** | Minor issues, hardening recommendations | < 1 week |

## Incident Response Process

### 1. Detection & Triage (0-30 min)

- [ ] Identify the nature of the incident
- [ ] Classify severity (Critical/High/Medium/Low)
- [ ] Notify incident commander
- [ ] Create private incident channel/issue

### 2. Containment (30 min - 2 hours)

**For compromised credentials:**
- [ ] Revoke affected tokens/keys
- [ ] Rotate secrets
- [ ] Check for unauthorized access

**For vulnerable code:**
- [ ] Assess exposure scope
- [ ] Determine if exploit is public
- [ ] Consider rollback if actively exploited

### 3. Investigation (2-24 hours)

- [ ] Determine root cause
- [ ] Identify affected systems/data
- [ ] Collect evidence (logs, artifacts)
- [ ] Document timeline

### 4. Remediation (Varies)

- [ ] Develop and test fix
- [ ] Review fix with security team
- [ ] Deploy fix to production
- [ ] Verify fix is effective

### 5. Communication

**Internal:**
- [ ] Brief stakeholders
- [ ] Update incident channel

**External (if required):**
- [ ] Draft security advisory
- [ ] Notify affected users
- [ ] Update SECURITY.md if needed

### 6. Post-Incident (Within 1 week)

- [ ] Conduct post-mortem
- [ ] Document lessons learned
- [ ] Update runbooks/processes
- [ ] Create tracking issues for improvements

## Contacts

| Role | Contact |
|------|---------|
| Security Lead | security@seventeensierra.com |
| On-Call Engineer | (per rotation) |

## Incident Type Specific Procedures

### Development Environment Security Issues

For incidents related to local development environment, Nix, Biome, or dependency vulnerabilities:

- [ ] Follow [Development Environment SOP](./dev-environment-sop.md) for environment-specific remediation
- [ ] Check for compromised development tools or dependencies
- [ ] Verify Nix flake integrity and package sources
- [ ] Review local environment isolation

### CI/CD Pipeline Security Issues

For incidents related to GitHub Actions, deployment pipelines, or build security:

- [ ] Follow [CI/CD Operations SOP](./cicd-operations-sop.md) for pipeline-specific remediation
- [ ] Review workflow permissions and secrets access
- [ ] Check for unauthorized workflow modifications
- [ ] Validate runner environment integrity
- [ ] Audit deployment artifacts and processes

### Secrets and Credentials Compromise

For incidents involving exposed secrets, API keys, or authentication tokens:

- [ ] Immediately revoke compromised credentials
- [ ] Follow [Secrets Management](./secrets-management.md) procedures
- [ ] Check CI/CD secrets and rotate as needed
- [ ] Review access logs for unauthorized usage
- [ ] Update secret rotation policies if needed

## Tools & Resources

### Security Scanning Tools
- **Secret scanning**: Gitleaks, GitHub Secret Scanning
- **Vulnerability scanning**: Trivy, Grype  
- **SAST**: Semgrep
- **SBOM**: Syft

### Development Environment Tools
- **Nix security**: `nix flake check`, vulnerability databases
- **Dependency scanning**: `pnpm audit`, Renovate security updates
- **Code quality**: Biome linting and security rules

### CI/CD Security Tools
- **Workflow security**: GitHub Actions security scanning
- **Artifact verification**: Cosign, SLSA attestations
- **Pipeline monitoring**: GitHub audit logs, workflow run analysis

## Related Documentation

- [Development Environment SOP](./dev-environment-sop.md) - For development environment security issues
- [CI/CD Operations SOP](./cicd-operations-sop.md) - For pipeline and deployment security issues  
- [Secrets Management](./secrets-management.md) - For credential and secrets handling
- [Security Policy](../../../SECURITY.md) - For vulnerability reporting procedures