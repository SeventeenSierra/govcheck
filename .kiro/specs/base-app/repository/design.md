# Design Document

## Overview

The repository restructure transforms the current standalone Next.js application into a Federated Mesh microservices architecture. This restructuring enables the dual-service architecture supporting both FAR/DFARS compliance (Phase 1) and NSF PAPPG compliance (Phase 2) while maintaining independent development, deployment, and scaling capabilities.

The restructure moves from a simple `src/` directory structure to a comprehensive workspace organization with `apps/`, `services/`, and `packages/` directories. This enables the Contract Checker application to orchestrate multiple specialized AI services while maintaining clear service boundaries and shared component libraries.

## Architecture

### Current Structure (Before Restructure)
```
obi-one/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
├── next.config.ts
└── other config files
```

### Target Structure (After Restructure)
```
obi-one/
├── apps/
│   └── web/                    # Next.js Web App (Port 3000) - FAR Compliance
│       ├── src/
│       │   ├── app/            # Next.js App Router
│       │   │   ├── api/        # API routes
│       │   │   │   ├── analyze/    # Main compliance analysis endpoint
│       │   │   │   ├── upload/     # Document upload endpoints
│       │   │   │   └── agents/     # Agent interaction endpoints
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx        # Main FAR compliance interface
│       │   ├── components/         # React Components
│       │   │   ├── upload/         # Document upload components
│       │   │   ├── analysis/       # Analysis display components
│       │   │   ├── agents/         # Agent interface components
│       │   │   └── shared/         # Reusable UI components
│       │   ├── services/           # Service layer
│       │   │   ├── DocumentService.ts
│       │   │   ├── AnalysisService.ts
│       │   │   └── AgentService.ts
│       │   └── lib/
│       │       ├── types.ts        # TypeScript types
│       │       ├── utils.ts        # Utility functions
│       │       └── constants.ts    # Application constants
│       ├── .storybook/
│       ├── e2e/
│       ├── next.config.ts
│       └── package.json
│
├── services/
│   └── strands-agent/          # Python/FastAPI Service (Port 8080)
│       ├── app/
│       │   ├── main.py         # FastAPI application
│       │   ├── models.py       # Pydantic models
│       │   ├── config.py       # Configuration management
│       │   └── routes/
│       │       ├── health.py       # Health check endpoints
│       │       ├── analyze.py      # Analysis endpoints
│       │       └── agents.py       # Agent coordination
│       ├── sops/               # Standard Operating Procedures
│       │   ├── far_agent.sop.md         # FAR Agent instructions
│       │   ├── executive_order_agent.sop.md
│       │   └── technical_agent.sop.md   # Technical agent instructions
│       ├── tests/              # Python tests
│       ├── Dockerfile
│       └── requirements.txt
│
├── packages/                   # Shared packages (future-ready)
│   ├── ui/                     # @obi-one/ui - Shared components
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── utils/          # UI utilities
│   │   └── package.json
│   └── lib/                    # @obi-one/lib - Shared utilities
│       ├── src/
│       │   ├── types/          # Shared TypeScript types
│       │   ├── utils/          # Utility functions
│       │   └── constants/      # Shared constants
│       └── package.json
│
├── data/
│   └── seed/                   # Seed data
│       └── far/                # Federal procurement proposals
│           ├── README.md       # Dataset documentation
│           ├── proposal-1/     # Sample proposal set
│           └── proposal-2/     # Sample proposal set
│
├── docker-compose.yml          # Local development orchestration
├── railway.toml               # Railway.app deployment config
└── pnpm-workspace.yaml        # Workspace configuration
```

### Future NSF Extension Structure (Phase 2)
When NSF support is added, the structure will extend to:
```
├── apps/
│   ├── web/                    # FAR Compliance (existing)
│   └── nsf-web/               # NSF Grant Compliance (future)
├── services/
│   ├── strands-agent/         # FAR compliance (existing)
│   └── genkit-service/        # NSF compliance (future)
├── data/seed/
│   ├── far/                   # Federal proposals (existing)
│   └── nsf/                   # NSF proposals (future)
```

## Components and Interfaces

### Workspace Configuration

#### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

#### Root package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"pnpm --filter=web dev\" \"pnpm --filter=strands-agent dev\"",
    "build": "pnpm --filter=web build && pnpm --filter=strands-agent build",
    "test": "pnpm --recursive test",
    "test:web": "pnpm --filter=web test",
    "test:strands": "pnpm --filter=strands-agent test",
    "lint": "pnpm --recursive lint",
    "format": "pnpm --recursive format",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "clean": "pnpm --recursive clean",
    "typecheck": "pnpm --recursive typecheck"
  }
}
```

### Service Dependencies

#### Web App Dependencies (apps/web/package.json)
```json
{
  "dependencies": {
    "@aatb/ui": "workspace:*",
    "@aatb/lib": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.0.0"
  }
}
```

#### Strands Service Dependencies (services/strands-agent/requirements.txt)
```txt
fastapi==0.104.1
uvicorn==0.24.0
boto3==1.34.0
pydantic==2.5.0
python-multipart==0.0.6
opensearch-py==2.4.0
pytest==7.4.3
pytest-asyncio==0.21.1
```

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - STRANDS_AGENT_URL=http://strands-service:8080
      - NODE_ENV=development
    volumes:
      - ./apps/web:/app/apps/web
      - ./packages:/app/packages
    depends_on:
      - strands-service
    networks:
      - far-compliance

  strands-service:
    build:
      context: ./services/strands-agent
    ports:
      - "8080:8080"
    environment:
      - AWS_REGION=${AWS_REGION:-us-east-1}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - BEDROCK_MODEL_ID_CLAUDE=${BEDROCK_MODEL_ID_CLAUDE:-anthropic.claude-3-5-sonnet-20241022-v2:0}
      - BEDROCK_MODEL_ID_NOVA=${BEDROCK_MODEL_ID_NOVA:-amazon.nova-pro-v1:0}
    volumes:
      - ./services/strands-agent/app:/code/app
      - ./services/strands-agent/sops:/code/sops
      - ./services/strands-agent/tests:/code/tests
    networks:
      - far-compliance
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  far-compliance:
    driver: bridge
```

## Data Models

### Workspace Package
```typescript
interface WorkspacePackage {
  name: string
  path: string
  type: 'app' | 'service' | 'package'
  dependencies: string[]
  scripts: Record<string, string>
}
```

### Service Configuration
```typescript
interface ServiceConfig {
  name: string
  port: number
  dockerfile: string
  environmentVariables: Record<string, string>
  healthCheckPath: string
  dependencies: string[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Directory structure organization
*For any* restructured repository, the root directory should contain apps/, services/, and packages/ directories with appropriate contents
**Validates: Requirements 1.1**

Property 2: Configuration file path updates
*For any* configuration file in the restructured repository, it should not contain references to the old src/ directory structure
**Validates: Requirements 1.5**

Property 3: Workspace dependency protocol
*For any* package.json file in the workspace, cross-package dependencies should use the "workspace:" protocol
**Validates: Requirements 2.1**

Property 4: Service independence
*For any* service in the workspace, it should be able to start and run without requiring other services to be running
**Validates: Requirements 4.2**

Property 5: API contract consistency
*For any* service API, it should follow consistent patterns for endpoint structure, error handling, and response formats
**Validates: Requirements 4.4**

Property 6: Shared code organization
*For any* code shared between services, it should be located in the packages/ directory rather than imported directly from other services
**Validates: Requirements 4.5**

## Error Handling

### Migration Errors
- **File conflicts**: Detect existing files in target locations and provide resolution options
- **Dependency resolution**: Handle cases where workspace dependencies cannot be resolved
- **Configuration validation**: Validate all configuration files after migration
- **Service startup**: Ensure all services can start after restructuring

### Build System Errors
- **Missing dependencies**: Clear error messages when workspace dependencies are not found
- **Circular dependencies**: Detection and prevention of circular dependencies between packages
- **Build failures**: Service-specific build error reporting and resolution guidance

## Testing Strategy

### Unit Testing
Unit tests will verify individual migration functions and configuration validation:
- Directory creation and file movement operations
- Package.json dependency updates
- Configuration file path replacements
- Workspace dependency resolution logic

### Property-Based Testing
Property-based tests will verify universal properties across the restructured workspace using **fast-check**. Each test will run a minimum of 100 iterations.

Tests will cover:
- Directory structure consistency across different workspace configurations
- Dependency resolution correctness for various package combinations
- Configuration file path updates across different file types
- Service independence verification across different service combinations

Each property-based test will be tagged with: `**Feature: repository-restructure, Property {number}: {property_text}**`

### Integration Testing
Integration tests will verify the complete restructuring workflow:
- End-to-end migration from old to new structure
- Workspace build and dependency resolution
- Service startup and communication
- Docker compose orchestration

### End-to-End Testing
E2E tests will verify the complete development workflow:
- Clone repository and run migration
- Install dependencies with single pnpm install
- Start all services with docker-compose
- Verify service communication and API contracts
- Run tests across all packages and services