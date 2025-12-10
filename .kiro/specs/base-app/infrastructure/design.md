# Design Document

## Overview

The infrastructure setup establishes a Federated Mesh microservices architecture for FAR/DFARS federal procurement compliance. The infrastructure uses containerized services with AWS-based AI integration, automated regulatory currency management, and orchestration through a Next.js web application.

The system orchestrates multiple specialized AI agents (FAR Agent, Executive Order Agent, Technical Agent) through AWS Bedrock services while providing transparent, government-grade security and audit capabilities with automated regulatory currency tracking.

## Architecture

### High-Level Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Railway.app / AWS GovCloud Deployment              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐         ┌────────────────────────────┐   │
│  │   Web App (Next.js)  │────────▶│  Strands Agent Service     │   │
│  │   Port: 3000         │  HTTP   │  (Python/FastAPI)          │   │
│  │                      │         │  Port: 8080                │   │
│  │  - FAR Compliance UI │         │                            │   │
│  │  - Agent Orchestration│         │  - AWS Bedrock Integration │   │
│  │  - Dual Analysis     │         │  - Claude 3.7 & Nova Pro   │   │
│  │  - Risk Scoring      │         │  - FAR Agent               │   │
│  │  - Provenance Display│         │  - Executive Order Agent   │   │
│  │  - Document Upload   │         │  - Technical Agent         │   │
│  │  - Results Display   │         │  - Regulatory Currency     │   │
│  └──────────────────────┘         └────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    AWS Infrastructure                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │   │
│  │  │ S3 Buckets      │  │ OpenSearch      │  │ Lambda       │ │   │
│  │  │ - FAR Documents │  │ Vector Database │  │ Functions    │ │   │
│  │  │ - DFARS Supp    │  │ - Similarity    │  │ - Regulatory │ │   │
│  │  │ - Executive     │  │   Search        │  │   Crawling   │ │   │
│  │  │   Orders        │  │ - Embeddings    │  │ - Updates    │ │   │
│  │  └─────────────────┘  └─────────────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Service Communication Flow

```
User → Document Upload → Next.js Web App
                              ↓
                    FAR Compliance Analysis
                              ↓
                    Multi-Agent Orchestration
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   FAR Agent            Executive Order        Technical Agent
   (Claude 3.7)           Agent                (Nova Pro)
                        (Claude 3.7)
        │                     │                     │
        ▼                     ▼                     ▼
   Tactical Analysis    Presidential Policy    Strategic Analysis
   - FAR/DFARS Rules    - Executive Orders    - Technical Specs
   - Procurement        - Federal Mandates    - Requirements
   - Contract Terms                           - Architecture
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    Dual Analysis Results
                    - Convergent Validation
                    - Risk Classification
                    - Confidence Scoring
                    - Remediation Timeline
```

## Components and Interfaces

### Container Platform

#### Web App Container (apps/web/Dockerfile)
```dockerfile
# Multi-stage build for Next.js
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

#### Strands Agent Container (services/strands-agent/Dockerfile)
```dockerfile
FROM python:3.11-slim

WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY sops/ ./sops/

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

#### Genkit Service Container (services/genkit-service/Dockerfile)
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 8081

CMD ["node", "src/index.js"]
```

### Development Environment

#### Docker Compose Configuration
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
      - BEDROCK_MODEL_ID_CLAUDE=anthropic.claude-3-5-sonnet-20241022-v2:0
      - BEDROCK_MODEL_ID_NOVA=amazon.nova-pro-v1:0
      - S3_BUCKET_FAR_DOCS=${S3_BUCKET_FAR_DOCS}
      - S3_BUCKET_EXECUTIVE_ORDERS=${S3_BUCKET_EXECUTIVE_ORDERS}
      - OPENSEARCH_ENDPOINT=${OPENSEARCH_ENDPOINT}
    volumes:
      - ./services/strands-agent/app:/code/app
      - ./services/strands-agent/sops:/code/sops
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

### Production Deployment

#### Railway Configuration (railway.toml)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"

[[services]]
name = "web"
source = "apps/web"

[[services]]
name = "strands-agent"
source = "services/strands-agent"

[[services]]
name = "genkit-service"
source = "services/genkit-service"
```

### AWS Infrastructure Integration

#### S3 Bucket Configuration
```typescript
interface RegulatoryDataBuckets {
  farDocuments: {
    bucketName: string // "obi-one-far-docs"
    region: string     // "us-east-1"
    versioning: boolean // true
  }
  executiveOrders: {
    bucketName: string // "obi-one-executive-orders"
    region: string     // "us-east-1"
    versioning: boolean // true
  }
  nsfPappg: {
    bucketName: string // "obi-one-nsf-pappg"
    region: string     // "us-east-1"
    versioning: boolean // true
  }
}
```

#### Lambda Functions for Regulatory Updates
```python
# AWS Lambda function for FAR/DFARS updates
import boto3
import requests
from datetime import datetime

def lambda_handler(event, context):
    """
    Crawl SAM.gov and Federal Register for FAR/DFARS updates
    Store in S3 with version control and timestamps
    """
    s3 = boto3.client('s3')
    
    # Crawl regulatory sources
    far_updates = crawl_sam_gov()
    dfars_updates = crawl_federal_register()
    
    # Store with timestamps
    timestamp = datetime.utcnow().isoformat()
    
    for update in far_updates:
        s3.put_object(
            Bucket='obi-one-far-docs',
            Key=f'far/{timestamp}/{update["id"]}.json',
            Body=json.dumps(update),
            Metadata={'as-of-date': timestamp}
        )
    
    return {'statusCode': 200, 'updates_processed': len(far_updates)}
```

#### OpenSearch Vector Database Configuration
```typescript
interface VectorDatabaseConfig {
  endpoint: string // AWS OpenSearch endpoint
  index: {
    farRegulations: string    // "far-regulations-index"
    executiveOrders: string   // "executive-orders-index"
    nsfPappg: string         // "nsf-pappg-index"
  }
  embedding: {
    model: string // "amazon.titan-embed-text-v1"
    dimensions: number // 1536
  }
}
```

## Data Models

### Service Configuration
```typescript
interface ServiceConfig {
  name: string
  port: number
  healthCheckPath: string
  environment: Record<string, string>
  dependencies: string[]
  scaling: {
    minInstances: number
    maxInstances: number
    targetCPU: number
  }
}
```

### AI Agent Configuration
```typescript
interface AgentConfig {
  name: string
  service: 'strands' | 'genkit'
  model: string
  sopFile: string
  supportedDomains: ('far' | 'nsf')[]
  capabilities: string[]
}

const AGENT_CONFIGS: AgentConfig[] = [
  {
    name: 'FAR Agent',
    service: 'strands',
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    sopFile: 'far_agent.sop.md',
    supportedDomains: ['far'],
    capabilities: ['far_compliance', 'regulatory_interpretation']
  },
  {
    name: 'Executive Order Agent',
    service: 'strands',
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    sopFile: 'executive_order_agent.sop.md',
    supportedDomains: ['far'],
    capabilities: ['executive_order_compliance', 'presidential_directives']
  },
  {
    name: 'Technical Agent',
    service: 'strands',
    model: 'amazon.nova-pro-v1:0',
    sopFile: 'technical_agent.sop.md',
    supportedDomains: ['far', 'nsf'],
    capabilities: ['technical_specifications', 'requirements_analysis']
  },
  {
    name: 'NSF Agent',
    service: 'strands',
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    sopFile: 'nsf_agent.sop.md',
    supportedDomains: ['nsf'],
    capabilities: ['nsf_pappg_compliance', 'grant_requirements']
  }
]
```

### Regulatory Data Model
```typescript
interface RegulatoryDocument {
  id: string
  type: 'FAR' | 'DFARS' | 'EXECUTIVE_ORDER' | 'NSF_PAPPG'
  version: string
  effectiveDate: Date
  asOfDate: Date
  source: string
  content: string
  sections: RegulatorySection[]
  embeddings?: number[]
}

interface RegulatorySection {
  id: string
  title: string
  content: string
  citation: string
  criticality: 'high' | 'medium' | 'low'
  applicableServices: ('far' | 'nsf')[]
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Container build optimization
*For any* Docker container build, it should use multi-stage builds to minimize final image size and build time
**Validates: Requirements 1.2**

Property 2: Environment configuration flexibility
*For any* containerized service, it should accept environment-specific configuration through environment variables without requiring code changes
**Validates: Requirements 1.3**

Property 3: Service communication reliability
*For any* HTTP communication between services, it should implement proper error handling and retry logic with exponential backoff
**Validates: Requirements 4.2**

Property 4: AI service response consistency
*For any* AI service response, it should follow a consistent format regardless of which provider (Strands, Genkit) generated the response
**Validates: Requirements 6.3**

Property 5: AI service fallback resilience
*For any* AI service failure, the system should gracefully fall back to alternative providers or degrade functionality rather than failing completely
**Validates: Requirements 6.4**

Property 6: Regulatory data versioning
*For any* regulatory document stored in the system, it should include proper version control with timestamps and "as-of" dates
**Validates: Requirements 7.3**

Property 7: Regulatory citation transparency
*For any* compliance result displayed to users, it should include the "as-of" date for all regulatory citations to ensure transparency about data currency
**Validates: Requirements 7.4**

## Error Handling

### Container Orchestration Errors
- **Service startup failures**: Health check monitoring with automatic restart policies
- **Network communication failures**: Circuit breaker pattern with fallback mechanisms
- **Resource exhaustion**: Automatic scaling triggers and resource monitoring
- **Configuration errors**: Validation of environment variables and configuration files

### AI Service Integration Errors
- **Model unavailability**: Fallback to alternative models or providers
- **Rate limiting**: Exponential backoff and request queuing
- **Response timeout**: Configurable timeout with graceful degradation
- **Invalid responses**: Response validation and error recovery

### Regulatory Data Management Errors
- **Update failures**: Retry mechanisms for regulatory data crawling
- **Version conflicts**: Conflict resolution for concurrent regulatory updates
- **Data corruption**: Integrity checks and backup/restore procedures
- **Access failures**: Fallback to cached regulatory data

## Testing Strategy

### Unit Testing
Unit tests will verify individual infrastructure components:
- Container build processes and optimization
- Environment variable configuration handling
- Service health check implementations
- Error handling and retry logic
- Regulatory data processing functions

### Property-Based Testing
Property-based tests will verify universal properties across the infrastructure using **fast-check**. Each test will run a minimum of 100 iterations.

Tests will cover:
- Container configuration consistency across different environments
- Service communication reliability under various failure conditions
- AI service response format consistency across different providers
- Regulatory data versioning and timestamp accuracy
- Scaling behavior under different load conditions

Each property-based test will be tagged with: `**Feature: infrastructure-setup, Property {number}: {property_text}**`

### Integration Testing
Integration tests will verify service interactions:
- End-to-end service communication through the Federated Mesh
- Docker Compose orchestration with all services
- AWS infrastructure integration (S3, Lambda, OpenSearch)
- Railway deployment and scaling
- Health check and monitoring systems

### End-to-End Testing
E2E tests will verify complete infrastructure workflows:
- Deploy entire system to Railway
- Verify all services start and communicate correctly
- Test regulatory data updates and processing
- Verify AI service orchestration and fallback mechanisms
- Test scaling and monitoring under load