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

## Tools & Resources

- **Secret scanning**: Gitleaks, GitHub Secret Scanning
- **Vulnerability scanning**: Trivy, Grype
- **SAST**: Semgrep
- **SBOM**: Syft
