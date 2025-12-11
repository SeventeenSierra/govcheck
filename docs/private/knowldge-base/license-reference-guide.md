<!-- SPDX-License-Identifier: LicenseRef-AllRightsReserved -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Open Source License Landscape Reference

> **Last Updated**: December 2024  
> **Purpose**: Quick reference for license selection and comparison

---

## Quick Decision Matrix

```
What type of code?
├── "I want maximum adoption" → MIT or Apache-2.0
├── "I want changes shared back" → AGPL-3.0 or GPL-3.0
├── "I want changes to MY library shared, but apps can be closed" → LGPL-3.0
├── "I want to protect for 2 years, then OSS" → FSL 1.1
├── "I want to prevent cloud competition" → SSPL or BSL 1.1
├── "I want internal use only, but visible" → PolyForm Perimeter
└── "I want look-but-don't-touch" → PolyForm Strict
```

---

## License Comparison Tables

### Traditional OSI-Approved

| License | Type | Patent? | OSI? | Use By |
|---------|------|---------|------|--------|
| MIT | Permissive | ❌ | ✅ | React, Babel, Express |
| Apache-2.0 | Permissive | ✅ | ✅ | Kubernetes, TensorFlow |
| BSD-3-Clause | Permissive | ❌ | ✅ | FreeBSD, Django, Flask |
| GPL-3.0 | Strong Copyleft | ✅ | ✅ | Linux, Bash, GCC |
| AGPL-3.0 | Network Copyleft | ✅ | ✅ | Grafana, MongoDB (formerly) |
| LGPL-3.0 | Weak Copyleft | ✅ | ✅ | Qt, FFmpeg |
| MPL-2.0 | File Copyleft | ✅ | ✅ | Firefox, Terraform (formerly) |

### Source-Available (Non-OSI)

| License | Converts? | When? | Used By |
|---------|-----------|-------|---------|
| FSL 1.1 | Apache-2.0 | 2 years | Sentry, Dagger |
| BSL 1.1 | Configurable | 1-4 years | HashiCorp, CockroachDB |
| SSPL 1.0 | Never | N/A | MongoDB, Elastic |
| Elastic 2.0 | Never | N/A | Elasticsearch |
| RSAL v2 | Never | N/A | Redis |

### PolyForm Family

| License | Commercial | Internal | External | Compete |
|---------|-----------|----------|----------|---------|
| Noncommercial | ❌ | ✅ | N/A | ✅ |
| Small Business | < $1M | ✅ | ✅ | ✅ |
| Shield | ✅ | ✅ | ✅ | ❌ |
| Perimeter | ✅ | ✅ | ❌ | ❌ |
| Strict | ❌ | Personal | ❌ | N/A |

---

## Companies That Changed Licenses

| Company | Product | From | To | Year | Trigger | Fork? |
|---------|---------|------|-----|------|---------|-------|
| MongoDB | MongoDB | AGPL | SSPL | 2018 | AWS | - |
| Elastic | ES/Kibana | Apache | SSPL/Elastic | 2021 | AWS | OpenSearch |
| HashiCorp | Terraform | MPL | BSL | 2023 | Cloud | OpenTofu |
| Redis | Redis | BSD | RSALv2/SSPL | 2024 | Cloud | Valkey |
| Grafana | Grafana | Apache | AGPL | 2021 | AWS | - |
| CockroachDB | CockroachDB | Apache | BSL | 2019 | Cloud | - |
| Sentry | Sentry | BSD | BSL→FSL | 2019, 2023 | SaaS | - |
| Lightbend | Akka | Apache | BSL | 2022 | Cloud | - |
| MariaDB | MaxScale | GPL | BSL | 2017 | - | - |

---

## Business Model Comparison

### Open Core (GitLab, Sentry, Cal.com)
```
┌─────────────────┐
│ Free Features   │ ← OSS (MIT/AGPL)
├─────────────────┤
│ Paid Features   │ ← Proprietary (/ee/)
└─────────────────┘
Revenue: Feature differentiation
```

### OSS + Managed Service (Coolify, Plausible)
```
┌─────────────────┐
│ ALL Features    │ ← OSS (Apache/AGPL)
│ 100% same       │
└─────────────────┘
Revenue: Hosting convenience
Self-host = Cloud = Same features
```

### Delayed OSS (Sentry FSL, HashiCorp BSL)
```
Year 0-N: Source-available (restricted)
Year N+:  Full OSS (Apache/MPL)
```

---

## Monorepo License Patterns

### Pattern 1: /ee/ Directory (GitLab)
```
repo/
├── app/              ← MIT
├── lib/              ← MIT
└── ee/               ← Proprietary
    └── features/     ← License key required
```

### Pattern 2: Per-Directory Licenses
```
repo/
├── apps/             ← AGPL
├── packages/
│   ├── ui/           ← MIT
│   └── tools/        ← PolyForm Perimeter
└── LICENSE           ← Root (PolyForm Strict)
```

### Pattern 3: Vendor Directory
```
repo/
├── src/              ← Your license
└── vendor/           ← Original licenses preserved
    └── LICENSES.txt
```

---

## Security Tooling Reference

### SAST (Static Analysis)
| Tool | License | Languages |
|------|---------|-----------|
| Semgrep | LGPL-2.1 | Multi |
| CodeQL | MIT | Multi |
| SonarQube | LGPL-3.0 | Multi |
| Bandit | Apache-2.0 | Python |

### Secret Detection
| Tool | License |
|------|---------|
| Gitleaks | MIT |
| TruffleHog | AGPL-3.0 |
| detect-secrets | Apache-2.0 |

### SCA (Dependency Scanning)
| Tool | License |
|------|---------|
| Trivy | Apache-2.0 |
| Grype | Apache-2.0 |
| OSV-Scanner | Apache-2.0 |

### SBOM Generation
| Tool | License |
|------|---------|
| Syft | Apache-2.0 |
| Trivy | Apache-2.0 |
| cdxgen | Apache-2.0 |

### License Compliance
| Tool | License |
|------|---------|
| ScanCode | Apache-2.0 |
| license-checker | BSD-3 |
| pip-licenses | MIT |
| FOSSology | GPL-2.0 |

---

## SPDX Quick Reference

### File Headers
```javascript
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: 2024 Your Name
```

### Common Identifiers
- `MIT`
- `Apache-2.0`
- `GPL-3.0-or-later`
- `AGPL-3.0-or-later`
- `LGPL-3.0-only`
- `BSD-3-Clause`
- `CC-BY-4.0`
- `CC-BY-SA-4.0`
- `CC0-1.0`
- `PolyForm-Strict-1.0.0`
- `PolyForm-Perimeter-1.0.0`

### Dual License
```
SPDX-License-Identifier: AGPL-3.0-or-later OR LicenseRef-Commercial
```

---

## CLA vs DCO

| Aspect | DCO | CLA |
|--------|-----|-----|
| What | Attestation of right to contribute | License grant to project |
| Signature | `Signed-off-by:` in commit | Document signature |
| Relicense rights | Limited | Often includes |
| Federal employees | Can sign | Usually cannot |
| Complexity | Low | Higher |
