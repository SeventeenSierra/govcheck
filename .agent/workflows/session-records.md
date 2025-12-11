---
description: How to create and maintain session records for microservice development
---

# Session Records

## Why This Matters
- **No context creep** - Fresh context each section
- **Decision archaeology** - "Why did we choose X?"
- **Onboarding** - New contributors read session history
- **AI continuity** - Handoff context for next session
- **Audit trail** - Who decided what, when
- **Knowledge reuse** - Searchable documentation
- **Service boundaries** - Track which services were modified
- **Architecture decisions** - Document Federated Mesh patterns

## Location
```
.agent/sessions/<N>-<name>/
├── session-record.md    # Required
├── implementation_plan.md  # If planning
├── walkthrough.md       # If verification
└── task.md              # Task checklist
```

## When to Create
- End of each work section
- Before human commits

## Required Content
1. **Metadata**: Date, AI model, human, commit hash
2. **Summary**: 1-2 sentences of what was done
3. **Services Affected**: Which microservices were modified (web, strands, genkit)
4. **Decisions**: Key choices made
5. **Files Changed**: List with descriptions and service context
6. **Architecture Notes**: Federated Mesh patterns used
7. **Context for Next**: Handoff notes including service boundaries

## Workflow
1. Complete section work
2. Create session record using template
3. Present blocking checklist
4. Human reviews and commits

See: `templates/session-record.md`
