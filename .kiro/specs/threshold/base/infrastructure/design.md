<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# Threshold Infrastructure Design Document

## Overview

The Infrastructure component provides containerized local development infrastructure for the Proposal Prepper application, enabling developers to run the complete system locally with all necessary services. The design focuses on Docker containerization, service orchestration, and essential infrastructure services for development and testing environments.

## Architecture

### Infrastructure Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DevMachine[Developer Machine]
        DockerEngine[Docker Engine]
        Compose[Docker Compose]
    end
    
    subgraph "Application Services"
        WebContainer[Web Service Container<br/>Next.js - Port 3000]
        StrandsContainer[Strands Service Container<br/>Python - Port 8080]
    end
    
    subgraph "Data Services"
        PostgresContainer[PostgreSQL Container<br/>Port 5432]
        RedisContainer[Redis Container<br/>Port 6379]
        MinIOContainer[MinIO Container<br/>Port 9000/9001]
    end
    
    subgraph "Development Tools"
        MailHog[MailHog Container<br/>Port 1025/8025]
        Adminer[Adminer Container<br/>Port 8080]
    end
    
    subgraph "Networking"
        AppNetwork[Application Network]
        Volumes[Docker Volumes]
        Secrets[Docker Secrets]
    end
    
    subgraph "Monitoring & Logging"
        LogAggregation[Log Aggregation]
        HealthChecks[Health Checks]
        Metrics[Basic Metrics]
    end
    
    DevMachine --> DockerEngine
    DockerEngine --> Compose
    
    Compose --> WebContainer
    Compose --> StrandsContainer
    Compose --> PostgresContainer
    Compose --> RedisContainer
    Compose --> MinIOContainer
    Compose --> MailHog
    Compose --> Adminer
    
    WebContainer --> AppNetwork
    StrandsContainer --> AppNetwork
    PostgresContainer --> AppNetwork
    RedisContainer --> AppNetwork
    MinIOContainer --> AppNetwork
    
    AppNetwork --> Volumes
    Volumes --> Secrets
    
    WebContainer --> LogAggregation
    StrandsContainer --> LogAggregation
    PostgresContainer --> HealthChecks
    RedisContainer --> HealthChecks
    MinIOContainer --> Metrics
    
    classDef development fill:#e1f5fe
    classDef application fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef tools fill:#fff3e0
    classDef networking fill:#f0f4f8
    classDef monitoring fill:#fce4ec
    
    class DevMachine,DockerEngine,Compose development
    class WebContainer,StrandsContainer application
    class PostgresContainer,RedisContainer,MinIOContainer data
    class MailHog,Adminer tools
    class AppNetwork,Volumes,Secrets networking
    class LogAggregation,HealthChecks,Metrics monitoring
```

## Container Services

### Docker Compose Configuration

#### Main Compose File
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: containers/web.Dockerfile
      target: development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/proposal_prepper_dev
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - STRANDS_SERVICE_URL=http://strands:8080
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
      strands:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  strands:
    build:
      context: .
      dockerfile: containers/strands.Dockerfile
      target: development
    ports:
      - "8080:8080"
    environment:
      - PYTHON_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/proposal_prepper_dev
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - AWS_BEDROCK_REGION=us-east-1
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    volumes:
      - ./services/strands:/app
      - strands-cache:/app/.cache
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=proposal_prepper_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./database/seed-dev.sql:/docker-entrypoint-initdb.d/02-seed.sql
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d proposal_prepper_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redis123
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 30s

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
      start_period: 30s

  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - app-network
    restart: unless-stopped

  adminer:
    image: adminer:latest
    ports:
      - "8081:8080"
    environment:
      - ADMINER_DEFAULT_SERVER=postgres
    networks:
      - app-network
    restart: unless-stopped
    depends_on:
      - postgres

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  minio-data:
    driver: local
  strands-cache:
    driver: local
```

#### Development Override
```yaml
# docker-compose.override.yml
version: '3.8'

services:
  web:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
    volumes:
      - .:/app:cached
      - /app/node_modules
    command: npm run dev

  strands:
    environment:
      - DEBUG=true
      - LOG_LEVEL=debug
    volumes:
      - ./services/strands:/app:cached
    command: python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

  postgres:
    environment:
      - POSTGRES_LOG_STATEMENT=all
      - POSTGRES_LOG_MIN_DURATION_STATEMENT=0
    ports:
      - "5432:5432"
```

### Container Definitions

#### Web Service Container
```dockerfile
# containers/web.Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN corepack enable pnpm && pnpm build

# Development image
FROM base AS development
WORKDIR /app

RUN apk add --no-cache curl

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml* ./

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "dev"]

# Production image
FROM base AS production
WORKDIR /app

RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Strands Service Container
```dockerfile
# containers/strands.Dockerfile
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Development stage
FROM base AS development

WORKDIR /app

# Install Python dependencies
COPY services/strands/requirements.txt .
COPY services/strands/requirements-dev.txt .
RUN pip install -r requirements-dev.txt

# Copy source code
COPY services/strands/ .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]

# Production stage
FROM base AS production

WORKDIR /app

# Install Python dependencies
COPY services/strands/requirements.txt .
RUN pip install -r requirements.txt

# Copy source code
COPY services/strands/ .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Service Configuration

### Environment Configuration
```typescript
interface EnvironmentConfig {
  development: DevEnvironment;
  testing: TestEnvironment;
  production: ProdEnvironment;
}

interface DevEnvironment {
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  storage: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
  services: {
    web: { port: number; host: string };
    strands: { port: number; host: string };
  };
  security: {
    jwtSecret: string;
    encryptionKey: string;
  };
  external: {
    aws: {
      region: string;
      accessKeyId?: string;
      secretAccessKey?: string;
    };
  };
}

const developmentConfig: DevEnvironment = {
  database: {
    host: 'postgres',
    port: 5432,
    database: 'proposal_prepper_dev',
    username: 'postgres',
    password: 'postgres',
    ssl: false
  },
  redis: {
    host: 'redis',
    port: 6379,
    password: 'redis123'
  },
  storage: {
    endpoint: 'minio:9000',
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    bucket: 'proposals'
  },
  services: {
    web: { port: 3000, host: '0.0.0.0' },
    strands: { port: 8080, host: '0.0.0.0' }
  },
  security: {
    jwtSecret: 'dev-jwt-secret-key',
    encryptionKey: 'dev-encryption-key-32-chars-long'
  },
  external: {
    aws: {
      region: 'us-east-1'
      // AWS credentials from environment variables
    }
  }
};
```

### Service Discovery
```typescript
interface ServiceRegistry {
  registerService(service: ServiceInfo): Promise<void>;
  discoverService(serviceName: string): Promise<ServiceInfo>;
  getHealthyServices(): Promise<ServiceInfo[]>;
  watchService(serviceName: string, callback: (service: ServiceInfo) => void): void;
}

interface ServiceInfo {
  name: string;
  host: string;
  port: number;
  protocol: 'http' | 'https';
  health: HealthStatus;
  metadata: Record<string, any>;
}

enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

class DockerServiceRegistry implements ServiceRegistry {
  private services: Map<string, ServiceInfo> = new Map();
  
  async registerService(service: ServiceInfo): Promise<void> {
    this.services.set(service.name, service);
  }
  
  async discoverService(serviceName: string): Promise<ServiceInfo> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
  
  async getHealthyServices(): Promise<ServiceInfo[]> {
    return Array.from(this.services.values())
      .filter(service => service.health === HealthStatus.HEALTHY);
  }
  
  watchService(serviceName: string, callback: (service: ServiceInfo) => void): void {
    // Implementation for watching service changes
    setInterval(async () => {
      try {
        const service = await this.discoverService(serviceName);
        callback(service);
      } catch (error) {
        // Service not available
      }
    }, 30000);
  }
}
```

## Networking and Security

### Network Configuration
```yaml
# Network security configuration
networks:
  app-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: proposal-prepper-br
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
    labels:
      - "com.proposal-prepper.network=application"
      - "com.proposal-prepper.environment=development"

  # Isolated network for sensitive services
  secure-network:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/16
```

### Security Configuration
```typescript
interface ContainerSecurity {
  userNamespace: boolean;
  readOnlyRootFilesystem: boolean;
  noNewPrivileges: boolean;
  capabilities: {
    drop: string[];
    add: string[];
  };
  seccomp: string;
  apparmor: string;
}

const securityConfig: ContainerSecurity = {
  userNamespace: true,
  readOnlyRootFilesystem: false, // Development needs write access
  noNewPrivileges: true,
  capabilities: {
    drop: ['ALL'],
    add: ['CHOWN', 'SETGID', 'SETUID']
  },
  seccomp: 'default',
  apparmor: 'docker-default'
};

// Security-hardened service configuration
const secureServiceConfig = {
  security_opt: [
    'no-new-privileges:true',
    'apparmor:docker-default'
  ],
  cap_drop: ['ALL'],
  cap_add: ['CHOWN', 'SETGID', 'SETUID'],
  read_only: false, // Set to true for production
  tmpfs: ['/tmp', '/var/tmp'],
  user: '1001:1001'
};
```

### Secret Management
```yaml
# Docker secrets configuration
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  encryption_key:
    file: ./secrets/encryption_key.txt
  aws_credentials:
    file: ./secrets/aws_credentials.json

services:
  web:
    secrets:
      - jwt_secret
      - encryption_key
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - ENCRYPTION_KEY_FILE=/run/secrets/encryption_key

  strands:
    secrets:
      - aws_credentials
      - encryption_key
    environment:
      - AWS_CREDENTIALS_FILE=/run/secrets/aws_credentials
      - ENCRYPTION_KEY_FILE=/run/secrets/encryption_key
```

## Data Persistence

### Volume Management
```typescript
interface VolumeConfig {
  name: string;
  driver: string;
  driverOpts?: Record<string, string>;
  labels?: Record<string, string>;
  external?: boolean;
}

const volumeConfigs: VolumeConfig[] = [
  {
    name: 'postgres-data',
    driver: 'local',
    labels: {
      'com.proposal-prepper.service': 'postgres',
      'com.proposal-prepper.type': 'database'
    }
  },
  {
    name: 'redis-data',
    driver: 'local',
    labels: {
      'com.proposal-prepper.service': 'redis',
      'com.proposal-prepper.type': 'cache'
    }
  },
  {
    name: 'minio-data',
    driver: 'local',
    labels: {
      'com.proposal-prepper.service': 'minio',
      'com.proposal-prepper.type': 'storage'
    }
  }
];
```

### Backup Strategy
```typescript
interface BackupConfig {
  schedule: string;
  retention: number;
  compression: boolean;
  encryption: boolean;
  destinations: BackupDestination[];
}

interface BackupDestination {
  type: 'local' | 's3' | 'gcs';
  path: string;
  credentials?: Record<string, string>;
}

const backupConfig: BackupConfig = {
  schedule: '0 2 * * *', // Daily at 2 AM
  retention: 7, // Keep 7 days
  compression: true,
  encryption: true,
  destinations: [
    {
      type: 'local',
      path: './backups'
    }
  ]
};

// Backup script for development
const backupScript = `
#!/bin/bash
set -e

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker exec proposal-prepper-postgres-1 pg_dump -U postgres proposal_prepper_dev > "$BACKUP_DIR/postgres.sql"

# Backup MinIO data
docker exec proposal-prepper-minio-1 tar czf - /data > "$BACKUP_DIR/minio.tar.gz"

# Backup Redis data
docker exec proposal-prepper-redis-1 redis-cli --rdb /tmp/dump.rdb
docker cp proposal-prepper-redis-1:/tmp/dump.rdb "$BACKUP_DIR/redis.rdb"

echo "Backup completed: $BACKUP_DIR"
`;
```

## Monitoring and Logging

### Health Monitoring
```typescript
interface HealthCheck {
  test: string[];
  interval: string;
  timeout: string;
  retries: number;
  startPeriod: string;
}

interface ServiceHealth {
  serviceName: string;
  status: HealthStatus;
  lastCheck: Date;
  checks: HealthCheckResult[];
}

interface HealthCheckResult {
  timestamp: Date;
  status: HealthStatus;
  responseTime: number;
  error?: string;
}

class HealthMonitor {
  private healthChecks: Map<string, ServiceHealth> = new Map();
  
  async checkServiceHealth(serviceName: string): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`http://${serviceName}/health`, {
        timeout: 5000
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        timestamp: new Date(),
        status: response.ok ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        timestamp: new Date(),
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  async monitorServices(serviceNames: string[]): Promise<void> {
    for (const serviceName of serviceNames) {
      const result = await this.checkServiceHealth(serviceName);
      
      const serviceHealth = this.healthChecks.get(serviceName) || {
        serviceName,
        status: HealthStatus.UNKNOWN,
        lastCheck: new Date(),
        checks: []
      };
      
      serviceHealth.status = result.status;
      serviceHealth.lastCheck = result.timestamp;
      serviceHealth.checks.push(result);
      
      // Keep only last 100 checks
      if (serviceHealth.checks.length > 100) {
        serviceHealth.checks = serviceHealth.checks.slice(-100);
      }
      
      this.healthChecks.set(serviceName, serviceHealth);
    }
  }
}
```

### Log Aggregation
```yaml
# Logging configuration
version: '3.8'

x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    labels: "com.proposal-prepper.service,com.proposal-prepper.environment"

services:
  web:
    logging: *default-logging
    labels:
      - "com.proposal-prepper.service=web"
      - "com.proposal-prepper.environment=development"

  strands:
    logging: *default-logging
    labels:
      - "com.proposal-prepper.service=strands"
      - "com.proposal-prepper.environment=development"

  # Optional: Log aggregation service
  fluentd:
    image: fluent/fluentd:v1.16-1
    ports:
      - "24224:24224"
    volumes:
      - ./logging/fluentd.conf:/fluentd/etc/fluent.conf
      - ./logs:/var/log/fluentd
    networks:
      - app-network
```

### Metrics Collection
```typescript
interface MetricsCollector {
  collectSystemMetrics(): Promise<SystemMetrics>;
  collectServiceMetrics(serviceName: string): Promise<ServiceMetrics>;
  collectApplicationMetrics(): Promise<ApplicationMetrics>;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

interface ServiceMetrics {
  serviceName: string;
  containerStats: {
    cpuUsage: number;
    memoryUsage: number;
    networkIO: { rx: number; tx: number };
    diskIO: { read: number; write: number };
  };
  healthStatus: HealthStatus;
  uptime: number;
}

interface ApplicationMetrics {
  requests: {
    total: number;
    rate: number;
    errorRate: number;
  };
  response: {
    averageTime: number;
    p95Time: number;
    p99Time: number;
  };
  database: {
    connections: number;
    queryTime: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
  };
}
```

## Development Workflow

### Setup and Management Scripts
```typescript
interface DevScripts {
  setup(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  logs(service?: string): Promise<void>;
  shell(service: string): Promise<void>;
  backup(): Promise<void>;
  restore(backupPath: string): Promise<void>;
  clean(): Promise<void>;
}

class DevEnvironmentManager implements DevScripts {
  async setup(): Promise<void> {
    console.log('Setting up development environment...');
    
    // Check Docker installation
    await this.checkDocker();
    
    // Create necessary directories
    await this.createDirectories();
    
    // Generate secrets
    await this.generateSecrets();
    
    // Pull images
    await this.pullImages();
    
    // Build custom images
    await this.buildImages();
    
    console.log('Development environment setup complete!');
  }
  
  async start(): Promise<void> {
    console.log('Starting services...');
    await this.executeCommand('docker-compose up -d');
    
    // Wait for services to be healthy
    await this.waitForServices();
    
    console.log('All services are running and healthy!');
    this.printServiceUrls();
  }
  
  async stop(): Promise<void> {
    console.log('Stopping services...');
    await this.executeCommand('docker-compose down');
  }
  
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }
  
  async logs(service?: string): Promise<void> {
    const command = service 
      ? `docker-compose logs -f ${service}`
      : 'docker-compose logs -f';
    
    await this.executeCommand(command);
  }
  
  async shell(service: string): Promise<void> {
    await this.executeCommand(`docker-compose exec ${service} /bin/bash`);
  }
  
  private async checkDocker(): Promise<void> {
    try {
      await this.executeCommand('docker --version');
      await this.executeCommand('docker-compose --version');
    } catch (error) {
      throw new Error('Docker and Docker Compose are required');
    }
  }
  
  private async waitForServices(): Promise<void> {
    const services = ['web', 'strands', 'postgres', 'redis', 'minio'];
    const maxWaitTime = 120000; // 2 minutes
    const checkInterval = 5000; // 5 seconds
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const healthyServices = await this.checkServicesHealth(services);
      
      if (healthyServices.length === services.length) {
        return;
      }
      
      console.log(`Waiting for services... (${healthyServices.length}/${services.length} healthy)`);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    throw new Error('Services failed to start within timeout period');
  }
  
  private printServiceUrls(): void {
    console.log('\n🚀 Services are running:');
    console.log('  Web Application: http://localhost:3000');
    console.log('  Strands API: http://localhost:8080');
    console.log('  MinIO Console: http://localhost:9001');
    console.log('  MailHog: http://localhost:8025');
    console.log('  Adminer: http://localhost:8081');
    console.log('  PostgreSQL: localhost:5432');
    console.log('  Redis: localhost:6379');
  }
}
```

### Makefile for Common Operations
```makefile
# Makefile
.PHONY: help setup start stop restart logs shell backup restore clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Set up development environment
	@echo "Setting up development environment..."
	@./scripts/setup-dev.sh

start: ## Start all services
	@echo "Starting services..."
	@docker-compose up -d
	@echo "Waiting for services to be healthy..."
	@./scripts/wait-for-services.sh
	@echo "✅ All services are running!"

stop: ## Stop all services
	@echo "Stopping services..."
	@docker-compose down

restart: stop start ## Restart all services

logs: ## Show logs for all services
	@docker-compose logs -f

logs-%: ## Show logs for specific service (e.g., make logs-web)
	@docker-compose logs -f $*

shell-%: ## Open shell in specific service (e.g., make shell-web)
	@docker-compose exec $* /bin/bash

backup: ## Create backup of all data
	@echo "Creating backup..."
	@./scripts/backup.sh

restore: ## Restore from backup (usage: make restore BACKUP=path/to/backup)
	@echo "Restoring from backup: $(BACKUP)"
	@./scripts/restore.sh $(BACKUP)

clean: ## Clean up containers, volumes, and images
	@echo "Cleaning up..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f

test: ## Run all tests
	@echo "Running tests..."
	@docker-compose exec web npm test
	@docker-compose exec strands python -m pytest

build: ## Build all images
	@echo "Building images..."
	@docker-compose build

pull: ## Pull latest images
	@echo "Pulling images..."
	@docker-compose pull

ps: ## Show running containers
	@docker-compose ps

top: ## Show running processes
	@docker-compose top
```

## Performance Optimization

### Resource Limits
```yaml
# Resource constraints for development
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  strands:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  postgres:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  redis:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.1'
          memory: 128M
```

### Caching Strategy
```typescript
interface CacheConfiguration {
  redis: {
    maxMemory: string;
    maxMemoryPolicy: string;
    keyspaceNotifications: string;
  };
  application: {
    sessionCache: { ttl: number; maxSize: number };
    apiCache: { ttl: number; maxSize: number };
    staticAssets: { ttl: number };
  };
}

const cacheConfig: CacheConfiguration = {
  redis: {
    maxMemory: '256mb',
    maxMemoryPolicy: 'allkeys-lru',
    keyspaceNotifications: 'Ex'
  },
  application: {
    sessionCache: { ttl: 1800, maxSize: 1000 }, // 30 minutes
    apiCache: { ttl: 300, maxSize: 500 }, // 5 minutes
    staticAssets: { ttl: 86400 } // 24 hours
  }
};
```

## Troubleshooting and Debugging

### Common Issues and Solutions
```typescript
interface TroubleshootingGuide {
  issue: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
}

const troubleshootingGuides: TroubleshootingGuide[] = [
  {
    issue: 'Services fail to start',
    symptoms: [
      'Container exits immediately',
      'Health checks fail',
      'Port binding errors'
    ],
    causes: [
      'Port already in use',
      'Insufficient resources',
      'Configuration errors',
      'Missing dependencies'
    ],
    solutions: [
      'Check port availability: netstat -tulpn | grep :3000',
      'Increase Docker resources',
      'Validate docker-compose.yml syntax',
      'Ensure all required files exist'
    ]
  },
  {
    issue: 'Database connection fails',
    symptoms: [
      'Connection timeout errors',
      'Authentication failures',
      'Database not ready'
    ],
    causes: [
      'PostgreSQL not fully started',
      'Network connectivity issues',
      'Incorrect credentials',
      'Database not initialized'
    ],
    solutions: [
      'Wait for PostgreSQL health check to pass',
      'Check network connectivity between containers',
      'Verify DATABASE_URL environment variable',
      'Check database initialization logs'
    ]
  }
];
```

### Debug Tools
```typescript
interface DebugTools {
  containerLogs(serviceName: string): Promise<string>;
  containerStats(serviceName: string): Promise<ContainerStats>;
  networkInspect(): Promise<NetworkInfo>;
  volumeInspect(volumeName: string): Promise<VolumeInfo>;
  executeInContainer(serviceName: string, command: string): Promise<string>;
}

class DockerDebugTools implements DebugTools {
  async containerLogs(serviceName: string): Promise<string> {
    return await this.executeCommand(`docker-compose logs ${serviceName}`);
  }
  
  async containerStats(serviceName: string): Promise<ContainerStats> {
    const output = await this.executeCommand(`docker stats ${serviceName} --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"`);
    return this.parseContainerStats(output);
  }
  
  async networkInspect(): Promise<NetworkInfo> {
    const output = await this.executeCommand('docker network inspect proposal-prepper_app-network');
    return JSON.parse(output)[0];
  }
  
  async executeInContainer(serviceName: string, command: string): Promise<string> {
    return await this.executeCommand(`docker-compose exec ${serviceName} ${command}`);
  }
}
```