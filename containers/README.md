# Docker Container Configuration

This directory contains the Docker configuration for the Proposal Prepper application, enabling a complete containerized deployment with a single command.

## Quick Start

```bash
# Start the application in development mode
./start.sh

# Start in background (detached mode)
./start.sh -d

# Start in production mode
./start.sh -e production -d

# Clean rebuild and start
./start.sh -c -b -d
```

The application will be available at:
- **Web UI**: http://localhost:3000
- **Strands API**: http://localhost:8080/api/health
- **MinIO Console**: http://localhost:9001 (admin/minioadmin)

## Architecture

The system consists of 5 containerized services:

### Application Services
- **web** (Next.js) - Frontend application on port 3000
- **strands** (Python FastAPI) - AI compliance analysis service on port 8080

### Infrastructure Services  
- **postgres** - PostgreSQL database on port 5432
- **redis** - Redis cache on port 6379
- **minio** - S3-compatible object storage on ports 9000/9001

## Configuration Files

### Docker Compose Files
- `docker-compose.yml` - Base configuration for all environments
- `docker-compose.dev.yml` - Development overrides (hot reload, debugging)
- `docker-compose.prod.yml` - Production overrides (resource limits, optimization)

### Dockerfiles
- `web.Dockerfile` - Next.js web service container
- `api.Dockerfile` - Python Strands service container

### Environment Configuration
- `.env.template` - Template with all available configuration options
- `.env` - Your local environment configuration (copy from template)

## Environment Variables

### Core Configuration
```bash
# Environment type
ENVIRONMENT=development

# Service URLs (internal)
WEB_SERVICE_URL=http://web:3000
STRANDS_SERVICE_URL=http://strands:8080

# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/proposal_prepper

# Redis
REDIS_URL=redis://redis:6379/0

# Object Storage
S3_ENDPOINT_URL=http://minio:9000
S3_BUCKET_NAME=documents
```

### AWS Configuration (Optional)
```bash
# For real AI analysis (leave empty for mock analysis)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

## Service Dependencies

The services start in this order with health check dependencies:

1. **Infrastructure Services** (postgres, redis, minio)
2. **Strands Service** (depends on infrastructure)
3. **Web Service** (depends on all others)

Each service has health checks that ensure proper startup sequencing.

## Development Workflow

### Starting Development Environment
```bash
# Copy environment template
cp .env.template .env

# Edit configuration as needed
vim .env

# Start all services
./start.sh -d

# View logs
docker-compose -p proposal-prepper logs -f

# Stop services
docker-compose -p proposal-prepper down
```

### Hot Reload
Both web and strands services support hot reload in development:
- **Web**: Next.js hot reload with file watching
- **Strands**: Python file watching with automatic restart

### Database Operations
```bash
# Access database
docker-compose -p proposal-prepper exec postgres psql -U postgres -d proposal_prepper

# View database logs
docker-compose -p proposal-prepper logs postgres

# Reset database (removes all data)
docker-compose -p proposal-prepper down -v
```

### Debugging Services
```bash
# View service logs
docker-compose -p proposal-prepper logs web
docker-compose -p proposal-prepper logs strands

# Access service shell
docker-compose -p proposal-prepper exec web sh
docker-compose -p proposal-prepper exec strands bash

# Check service health
curl http://localhost:3000/api/health
curl http://localhost:8080/api/health
```

## Production Deployment

### Production Configuration
```bash
# Use production compose file
./start.sh -e production -d

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Production Features
- **Resource Limits**: CPU and memory limits for all services
- **Optimized Images**: Multi-stage builds for smaller images
- **Security**: Restricted logging and secure defaults
- **Performance**: Optimized Redis and database configurations
- **Monitoring**: Enhanced health checks and monitoring

### Environment Setup
1. Copy `.env.template` to `.env`
2. Set `ENVIRONMENT=production`
3. Configure AWS credentials for real AI analysis
4. Set secure passwords and secrets
5. Configure resource limits as needed

## Networking

### Internal Communication
Services communicate using Docker's internal DNS:
- `web` → `strands:8080` for API calls
- `strands` → `postgres:5432` for database
- `strands` → `redis:6379` for caching
- `strands` → `minio:9000` for object storage

### Network Configuration
- **Network**: `proposal-prepper-network` (bridge)
- **Subnet**: `172.20.0.0/16`
- **Service Aliases**: Each service has descriptive aliases for discovery

### Port Mapping
- `3000` → Web UI
- `8080` → Strands API
- `5432` → PostgreSQL (development only)
- `6379` → Redis (development only)
- `9000` → MinIO API
- `9001` → MinIO Console

## Data Persistence

### Volumes
All data is stored in named Docker volumes that persist across container restarts:

- `proposal-prepper_postgres_data` - PostgreSQL database files
- `proposal-prepper_redis_data` - Redis persistence (AOF + RDB)
- `proposal-prepper_minio_data` - MinIO object storage files

### Persistence Configuration
- **PostgreSQL**: Full ACID compliance with WAL logging
- **Redis**: AOF (Append Only File) + RDB snapshots for durability
- **MinIO**: Direct file system storage with consistency guarantees

### Data Management Tools

#### Automated Backup and Restore
```bash
# Create full backup of all data
./data-manager.sh backup

# List available backups
./data-manager.sh list-backups

# Restore from backup
./data-manager.sh restore backup_20241212_143022

# Clean up old backups
./data-manager.sh cleanup
```

#### Persistence Testing
```bash
# Test data persistence across restarts
./data-manager.sh test-persistence

# Or use the dedicated test script
./test-persistence.sh
```

#### Volume Management
```bash
# Show volume information and sizes
./data-manager.sh volumes

# Export volumes to tar files
./data-manager.sh export

# Import volumes from tar files
./data-manager.sh import backup.tar
```

### Seed Data
The system automatically seeds the database with 30 real PDF proposal documents from `src/seed-data/` on first startup. This provides immediate test data for compliance analysis.

### Manual Backup Operations
```bash
# PostgreSQL backup
docker-compose -p proposal-prepper exec postgres pg_dump -U postgres proposal_prepper > backup.sql

# PostgreSQL restore
docker-compose -p proposal-prepper exec -T postgres psql -U postgres proposal_prepper < backup.sql

# Redis backup (automatic with AOF/RDB)
docker-compose -p proposal-prepper exec redis redis-cli BGSAVE

# MinIO backup
docker-compose -p proposal-prepper exec minio mc mirror /data /backup
```

### Data Recovery
In case of data corruption or loss:

1. **Stop all services**: `docker-compose -p proposal-prepper down`
2. **Restore from backup**: `./data-manager.sh restore <backup_name>`
3. **Restart services**: `./start.sh -d`
4. **Verify data integrity**: `./test-persistence.sh`

## Troubleshooting

### Common Issues

**Services won't start**
```bash
# Check logs
docker-compose -p proposal-prepper logs

# Check health status
docker-compose -p proposal-prepper ps
```

**Database connection errors**
```bash
# Verify database is healthy
docker-compose -p proposal-prepper exec postgres pg_isready -U postgres

# Check database logs
docker-compose -p proposal-prepper logs postgres
```

**File upload errors**
```bash
# Check MinIO health
curl http://localhost:9000/minio/health/live

# Access MinIO console
open http://localhost:9001
```

**AI analysis not working**
```bash
# Check Strands service health
curl http://localhost:8080/api/health

# View Strands logs
docker-compose -p proposal-prepper logs strands

# Verify AWS credentials (if using real AI)
docker-compose -p proposal-prepper exec strands env | grep AWS
```

### Performance Issues

**Slow startup**
- Increase health check `start_period` values
- Check available system resources
- Use SSD storage for better I/O performance

**High memory usage**
- Adjust resource limits in production compose file
- Monitor with `docker stats`
- Consider scaling horizontally

### Clean Reset
```bash
# Complete cleanup (removes all data)
./start.sh -c

# Or manually
docker-compose -p proposal-prepper down -v --remove-orphans
docker system prune -f
```

## Monitoring

### Health Checks
All services implement health checks:
- **Interval**: 30s (15s in development)
- **Timeout**: 10s (5s in development)  
- **Retries**: 3 (2 in development)
- **Start Period**: 60s (30-45s in development)

### Service Status
```bash
# Check all service health
docker-compose -p proposal-prepper ps

# Individual health checks
curl http://localhost:3000/api/health
curl http://localhost:8080/api/health
```

### Resource Monitoring
```bash
# Real-time resource usage
docker stats

# Service-specific stats
docker stats proposal-prepper_web_1 proposal-prepper_strands_1
```

## Security Considerations

### Development Security
- Default passwords (change for production)
- All ports exposed (restrict in production)
- Debug logging enabled

### Production Security
- Use strong, unique passwords
- Restrict port exposure
- Enable TLS/SSL termination
- Configure firewall rules
- Regular security updates

### Secrets Management
- Use Docker secrets for sensitive data
- Avoid hardcoding credentials
- Rotate passwords regularly
- Monitor access logs