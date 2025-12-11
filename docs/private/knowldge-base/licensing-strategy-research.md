<!-- SPDX-License-Identifier: LicenseRef-AllRightsReserved -->
<!-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC -->

# Licensing Strategy Research

> **Date**: December 2025  
> **Status**: Approved  
> **Author**: Internal research session

This document captures research and decisions around the multi-license strategy for the 17s-mono monorepo.

---

## Executive Summary

We adopt a **multi-license strategy** that balances open source principles with commercial viability:

- **PolyForm Strict**: Monorepo structure (proprietary patterns, visible for transparency)
- **AGPL-3.0 + Commercial**: Web applications (Free Software with commercial option)
- **PolyForm Perimeter**: Internal tools (use internally, don't expose externally)
- **MIT**: Design system (public good, community contribution focus)
- **Creative Commons**: Documentation and AI-generated assets

---

## License Selection Rationale

### Monorepo Root: PolyForm Strict 1.0.0

**Why not OSS for the structure itself?**

The monorepo structure, build configurations, and SDLC automation represent significant intellectual property. PolyForm Strict allows:

- ✅ Transparency (others can see our practices)
- ✅ Learning (educational use permitted)
- ❌ Commercial use without permission
- ❌ Redistribution

**SPDX**: `PolyForm-Strict-1.0.0`

### Web Applications: AGPL-3.0 OR Commercial

**Why AGPL (not Apache/MIT)?**

| Goal | Apache/MIT | AGPL |
|------|-----------|------|
| Anyone can use freely | ✅ | ✅ |
| Modifications must be shared | ❌ | ✅ |
| Enterprise customers blocked | ❌ | ✅ (feature) |
| Dual-licensing revenue | ❌ | ✅ |

The AGPL creates natural segmentation:
- **Small businesses/startups**: Use freely under AGPL
- **Enterprises with AGPL policies**: Purchase commercial license

**SPDX**: `AGPL-3.0-or-later OR LicenseRef-17s-Commercial`

### Tools/Utilities: PolyForm Perimeter 1.0.0

**Why Perimeter (not LGPL)?**

Our internal dev tools (Python scripts, CLI utilities) are valuable but not meant for external use:

- ✅ Use internally however you want
- ❌ Don't expose to outsiders as a service
- ❌ Don't redistribute commercially

**SPDX**: `PolyForm-Perimeter-1.0.0`

### Design System: MIT

**Why MIT (not AGPL)?**

The design system is our contribution to the public good:

- Maximum adoption potential
- Community contribution focus
- Standard for component libraries
- No friction for downstream projects

**SPDX**: `MIT`

---

## Innovative License Landscape Analysis

### Source-Available Licenses

| License | Creator | OSI? | Converts To | Time Delay |
|---------|---------|------|-------------|------------|
| FSL 1.1 | Sentry/MariaDB | ❌ | Apache-2.0 | 2 years |
| BSL 1.1 | MariaDB | ❌ | Configurable | 1-4 years |
| SSPL 1.0 | MongoDB | ❌ | Never | N/A |
| Elastic 2.0 | Elastic | ❌ | Never | N/A |

### PolyForm Family

| License | Commercial? | Internal? | Compete? |
|---------|------------|-----------|----------|
| Noncommercial | ❌ | ✅ | ✅ |
| Small Business | < $1M | ✅ | ✅ |
| Shield | ✅ | ✅ | ❌ |
| Perimeter | Internal | ❌ External | ❌ |
| Strict | ❌ | Personal | N/A |

---

## License Change History in Industry

Notable companies that changed from OSS to restrictive licenses:

| Company | Original | New | Year | Trigger |
|---------|----------|-----|------|---------|
| MongoDB | AGPL | SSPL | 2018 | AWS DocumentDB |
| Elastic | Apache-2.0 | SSPL/Elastic | 2021 | AWS Elasticsearch |
| HashiCorp | MPL-2.0 | BSL 1.1 | 2023 | Cloud competition |
| Redis | BSD | RSALv2/SSPL | 2024 | Cloud reselling |
| Grafana | Apache-2.0 | AGPL | 2021 | AWS Managed Grafana |

**Key Insight**: Being upfront about licensing from Day 1 avoids the "bait and switch" perception.

---

## Contribution Strategy

### Contributor License Agreement (CLA)

Required for non-federal contributors. Grants:
- Perpetual, worldwide license
- Right to sublicense and distribute
- Right to use commercially
- Patent grants

### Federal Employees

U.S. Federal Government employees contributing within scope of employment:
- **No CLA required** (cannot assign copyright they don't own)
- Work is **public domain** under 17 U.S.C. § 105
- DCO sign-off with `US-Government-Work: true` marker
- Contributions incorporated under project license

### DCO (Developer Certificate of Origin)

All contributors must sign-off commits:
```
Signed-off-by: Name <email>
```

---

## Dependency Compatibility

### What We Can Use

| License | Compatible? | Notes |
|---------|------------|-------|
| MIT | ✅ | Fully compatible |
| Apache-2.0 | ✅ | Patent grant, good |
| BSD-3-Clause | ✅ | Permissive |
| LGPL-3.0 | ✅ | Weak copyleft OK |
| GPL-3.0 | ✅ | We're AGPL anyway |

### What We Avoid

| License | Why |
|---------|-----|
| SSPL | Incompatible with AGPL |
| GPL-2.0-only | No "or later" compatibility |
| Proprietary | Can't redistribute |

### Current Stack Compatibility

| Tool | License | Status |
|------|---------|--------|
| PostHog | MIT | ✅ |
| Keycloak | Apache-2.0 | ✅ |
| PostgreSQL | PostgreSQL (BSD-like) | ✅ |
| Neon | Apache-2.0 | ✅ |

---

## Directory Structure

```
17s-mono/                         # PolyForm Strict
├── LICENSE                       # PolyForm Strict 1.0.0
├── LICENSING.md                  # This strategy doc
├── apps/                         # AGPL + Commercial
│   └── web-app/
│       ├── src/                  # AGPL code
│       └── ee/                   # Commercial-only (future)
├── packages/
│   ├── ui/                       # MIT
│   └── tools/                    # PolyForm Perimeter
├── python/                       # PolyForm Perimeter
├── vendor/                       # Original licenses preserved
└── docs/                         # CC-BY-SA-4.0
```

---

## Open Questions Resolved

### Q: Can we use UDS-Core (AGPL) patterns?

**A**: Yes. AGPL allows:
- Studying/learning ✅
- Using as dependency ✅ (our app becomes AGPL anyway)
- API interaction ✅ (not a license issue)

### Q: What about AWS/GSA collaboration?

**A**: 
- AWS interacting via API = no license issue
- GSA employees contributing = public domain, no CLA needed
- We can incorporate their public domain contributions

### Q: Can we relicense later?

**A**: Yes, if we're the sole copyright holder:
- Our code = full freedom to relicense
- Federal contributions = already public domain
- External CLA contributions = CLA grants us rights

---

## Related Documents

- [CONTRIBUTING.md](file:///Users/afla/Documents/GitHub/17s-mono/CONTRIBUTING.md) - Contribution workflow
- [CLA.md](file:///Users/afla/Documents/GitHub/17s-mono/CLA.md) - Contributor agreement text
- [SECURITY.md](file:///Users/afla/Documents/GitHub/17s-mono/SECURITY.md) - Vulnerability reporting

---

## Blog Post Ideas from This Research

1. **"Choosing a License Strategy for Your Open Source Project in 2024"**
   - Cover the OSS → source-available trend
   - PolyForm, FSL, BSL comparison

2. **"Open Core vs Open Source + Managed Service"**
   - GitLab, Sentry model vs Coolify, Plausible model
   - When each makes sense

3. **"The Great License Changes: MongoDB, HashiCorp, and the Cloud Problem"**
   - History of OSS → restrictive changes
   - Community fork responses (OpenTofu, Valkey)

4. **"Federal Contributions to Open Source: Navigating 17 USC § 105"**
   - Public domain contributions
   - CLA alternatives for .gov/.mil

5. **"Monorepo Licensing: One Repo, Many Licenses"**
   - Directory-based licensing
   - SPDX headers and compliance
