<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# Deployment Component Design Document

## Overview

The Deployment component establishes hybrid deployment patterns supporting both local development with Strands agents and cloud production deployment. It provides containerized infrastructure, environment configuration, and deployment automation for the FAR compliance validation system while maintaining security and performance requirements.

## Architecture

### Deployment Architecture

```mermaid
graph TB
    subgraph "Local Development Environment"
        LDocker[Docker Compose]
        LWeb[Next.js:3000]
        LStrands[Strands:8080]
        LMinIO[MinIO:9000]
        LPostgres[PostgreSQL:5432]
        LRedis[Redis:6379]
        LQueue[Message Queue]
    end
    
    subgraph "Cloud Production Environment"
        CNext[Next.js Local]
        CAWS[AWS Services]
        CS3[S3 Storage]
        CBedrock[Bedrock AI]
        CSearch[OpenSearch]
        CLambda[Lambda Functions]
    end
    
    subgraph "CI/CD Pipeline"
        GHA[GitHub Actions]
        Build[Build & Test]
        Security[Security Scan]
        Deploy[Deploy Artifacts]
    end
    
    LDocker --> LWeb
    LDocker --> LStrands
    LDocker --> LMinIO
    LDocker --> LPostgres
    LDocker --> LRedis
    
    CNext --> CAWS
    CAWS --> CS3
    CAWS --> CBedrock
    CAWS --> CSearch
    CAWS --> CLambda
    
    GHA --> Build
    Build --> Security
    Security --> Deploy
```

## Components and Interfaces

### Local Development Environment

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/proposal_prepper
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

  strands:
    build:
      context: .
      dockerfile: Dockerfile.strands
    ports:
      - "8080:8080"
    environment:
      - PYTHON_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/proposal_prepper
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - AWS_BEDROCK_REGION=us-east-1
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./strands:/app
    command: python -m strands.main

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=proposal_prepper
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  minio_data:
  redis_data:
```

#### Environment Configuration
```typescript
interface DeploymentConfig {
  environment: 'development' | 'production' | 'test';
  database: DatabaseConfig;
  storage: StorageConfig;
  ai: AIConfig;
  security: SecurityConfig;
}

interface DatabaseConfig {
  url: string;
  poolSize: number;
  ssl: boolean;
  migrations: {
    directory: string;
    autoRun: boolean;
  };
}

interface StorageConfig {
  type: 'minio' | 's3';
  endpoint?: string;
  bucket: string;
  region?: string;
  credentials: {
    accessKey: string;
    secretKey: string;
  };
}

interface AIConfig {
  provider: 'bedrock';
  region: string;
  modelId: string;
  credentials: AWSCredentials;
  rateLimiting: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}
```

### Cloud Production Deployment

#### AWS Infrastructure as Code
```typescript
// CDK Stack for AWS resources
export class ProposalPrepperStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3 Bucket for document storage
    const documentBucket = new Bucket(this, 'DocumentBucket', {
      bucketName: 'proposal-prepper-documents',
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      lifecycleRules: [{
        id: 'DeleteOldVersions',
        expiration: Duration.days(90),
        noncurrentVersionExpiration: Duration.days(30)
      }]
    });

    // OpenSearch domain for search and analytics
    const searchDomain = new Domain(this, 'SearchDomain', {
      version: EngineVersion.OPENSEARCH_2_3,
      capacity: {
        dataNodes: 2,
        dataNodeInstanceType: 't3.small.search'
      },
      ebs: {
        volumeSize: 20,
        volumeType: EbsDeviceVolumeType.GP3
      },
      encryption: {
        encryptionAtRest: { enabled: true }
      }
    });

    // Lambda functions for processing
    const processingFunction = new Function(this, 'ProcessingFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset('lambda'),
      timeout: Duration.minutes(15),
      memorySize: 1024,
      environment: {
        BUCKET_NAME: documentBucket.bucketName,
        SEARCH_DOMAIN: searchDomain.domainEndpoint
      }
    });
  }
}
```

## Data Models

### Deployment Configuration Models

```typescript
interface DeploymentEnvironment {
  name: string;
  type: 'local' | 'cloud';
  status: 'active' | 'inactive' | 'deploying' | 'failed';
  services: ServiceStatus[];
  configuration: EnvironmentConfig;
  lastDeployed: Date;
  version: string;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  port?: number;
  healthCheck: {
    url: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    responseTime?: number;
  };
  resources: {
    cpu: number;
    memory: number;
    disk?: number;
  };
}

interface DeploymentJob {
  id: string;
  environment: string;
  type: 'deploy' | 'rollback' | 'scale';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  logs: string[];
  artifacts: string[];
}
```

## Correctness Properties

### Acceptance Criteria Testing Prework

1.1 Hybrid deployment architecture (local frontend, cloud backend)
  Thoughts: This is about deployment configuration working correctly in both environments. We can test that services start and communicate properly.
  Testable: yes - property

1.2 Local frontend deployment (Next.js web application)
  Thoughts: This is about the frontend starting correctly and being accessible. We can test startup and basic functionality.
  Testable: yes - property

1.3 Cloud backend deployment (AWS services integration)
  Thoughts: This is about cloud services being properly configured and accessible. We can test service connectivity and configuration.
  Testable: yes - property

1.4 Local development environment (Strands agents local development)
  Thoughts: This is about the complete local development stack working correctly. We can test that all services start and integrate properly.
  Testable: yes - property

### Correctness Properties

**Property 1: Deployment environment reliability**
*For any* deployment configuration, all services should start successfully and pass health checks in their respective environments
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

**Property 2: Service integration consistency**
*For any* service communication, the system should maintain connectivity and proper error handling across local and cloud deployments
**Validates: Requirements 1.1, 1.4**

**Property 3: Configuration management accuracy**
*For any* environment configuration, the system should apply settings correctly and maintain consistency across deployments
**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

## Error Handling

### Deployment Error Categories

1. **Infrastructure Errors**
   - Service startup failures
   - Network connectivity issues
   - Resource allocation problems
   - Configuration errors

2. **Environment Errors**
   - Missing environment variables
   - Invalid configuration values
   - Service dependency failures
   - Version compatibility issues

3. **Deployment Errors**
   - Build failures
   - Artifact deployment issues
   - Health check failures
   - Rollback requirements

## Testing Strategy

### Property-Based Testing
- Test deployment configurations across different environments
- Validate service startup and health checks
- Test configuration management and environment variables
- Minimum 100 iterations per property test

### Integration Testing
- Test complete deployment workflows
- Validate service-to-service communication
- Test environment switching and configuration
- Validate backup and recovery procedures

## Security Implementation

### Deployment Security
- **Secret Management**: Environment-specific secret handling
- **Network Security**: Proper firewall and network configuration
- **Access Controls**: Role-based deployment permissions
- **Audit Logging**: Complete deployment activity tracking

### Environment Isolation
- **Development**: Isolated local environment with test data
- **Production**: Secure cloud environment with production controls
- **Configuration**: Environment-specific security settings
- **Monitoring**: Security event tracking and alerting

## Performance Considerations

### Resource Optimization
- **Local Development**: Optimized for laptop resource constraints
- **Cloud Production**: Auto-scaling based on demand
- **Caching**: Environment-appropriate caching strategies
- **Monitoring**: Performance metrics and optimization

### Scalability Planning
- **Horizontal Scaling**: Service-specific scaling strategies
- **Load Balancing**: Traffic distribution and failover
- **Resource Management**: Efficient resource allocation
- **Cost Optimization**: Usage-based resource scaling