# AI Agent Integration Guide

This document outlines the patterns and best practices for integrating AI agents in the Proposal Prepper (Contract Checker) project, including Kiro, Antigravity, Cline, and other approved agents for NSF PAPPG compliance validation.

---

## ⚠️ CRITICAL: Session Rules (ALWAYS APPLY)

**Read `.agent/AGENT_RULES.md` at session start.** Key rules:

1. **Self-identify**: "I am [Agent] powered by [Model]. Trailer: AI-Agent: [value]"
2. **Read context**: `.agent/session-context.md`
3. **Blocking review**: Present checklist before commits, WAIT for human approval
4. **Human signs off**: Only human runs `git commit -s`
5. **Session record**: Create `.agent/sessions/<N>/session-record.md`

---

## Core Philosophy: AI Zones and Human Involvement

- **Respect AI Zones:** Follow `.ai-zones.yaml` permissions for autonomous operations
- **Human Involvement Levels:** Use appropriate involvement (full, reviewed, approved, automated)
- **Microservice Awareness:** Understand which service (web, strands, genkit) you're working on
- **Compliance Focus:** All changes must support NSF PAPPG validation requirements

## Integration Patterns

The `jules` CLI is designed to be scriptable, allowing us to create powerful, automated workflows by composing it with other tools, including our own Gemini-powered agents.

### Pattern 1: Compliance Validation Workflow

AI agents work together to ensure NSF PAPPG compliance across the microservice architecture.

**Scenario:** A new compliance rule needs to be implemented across all services.

**Workflow:**

1.  **Kiro Identifies Requirement:** Reviews NSF PAPPG documentation and identifies new validation rule
2.  **Design-First Approach:** Creates design.md and task.md following `.agent/AGENT_RULES.md`
3.  **Service Implementation:** 
    - **Strands Service:** Implements core validation logic (Python/AWS Bedrock)
    - **Web Service:** Updates UI to display validation results
    - **Genkit Service:** Orchestrates document processing workflow
4.  **Human Review:** All changes require human review per AI zones configuration
5.  **Integration Testing:** Validates end-to-end compliance checking

### Pattern 2: Federated Mesh Communication

AI agents coordinate across microservices while respecting service boundaries.

**Scenario:** Document processing requires coordination between all three services.

**Workflow:**

1.  **Web Service:** Receives proposal upload, validates format
2.  **Orchestration Layer:** Routes document to appropriate services
3.  **Genkit Service:** Processes document structure and extracts sections
4.  **Strands Service:** Validates each section against NSF PAPPG requirements
5.  **Result Aggregation:** Web service displays comprehensive validation report

**AI Agent Responsibilities:**
- Respect service boundaries (don't modify other services directly)
- Use proper commit scopes (web, strands, genkit)
- Follow blocking review protocol for cross-service changes
