---
description: Design-first development workflow with three stages for Proposal Prepper microservices
---

# Design-First Workflow

## Stage 1: Design & Specification
**Before ANY code**, create design artifacts for the microservice architecture:

```
.agent/sessions/<N>/
├── proposal.md     # Context, motivation, goals
├── design.md       # Architecture, interfaces
└── task.md         # Implementation plan
```

### design.md MUST include:
- Architecture diagram (Federated Mesh patterns)
- Service interfaces and communication patterns
- Interface/function signatures
- Correctness properties
- Error handling strategy
- Which microservices are affected (web, strands, genkit)
- API contracts between services

### task.md format:
```markdown
## Section 1: Core Types (← COMMIT BOUNDARY)
**Scope**: strands
- [ ]* 1.1 Write tests for compliance validation types
- [ ] 1.2 Implement NSF PAPPG validation types

## Section 2: Service Integration (← COMMIT BOUNDARY)
**Scope**: orchestration
- [ ]* 2.1 Write tests for service communication
- [ ] 2.2 Implement Federated Mesh patterns
```
**Legend**: 
- `[ ]*` = test task (MUST complete before implementation)
- **Scope** = commitlint scope for this section's commits

---

## Stage 2: Implementation
For **EACH section**:
1. AI completes all tasks in section
2. AI presents blocking checklist
3. ⛔ AI **STOPS and WAITS**
4. Human reviews and checks ALL items
5. Human commits with `-s`
6. Repeat for next section

---

## Stage 3: Archive
After all sections complete:
- Session artifacts already in `.agent/sessions/<N>/`
- Update documentation if needed
