<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# Docker Development Environment Setup

This document describes the Docker-based local development environment for the Proposal Prepper application.

## Architecture

The development environment consists of the following services:

- **web** (Next.js) - Frontend application on port 3000
- **strands** (Python/FastAPI) - AI agent service on port 8080
- **postgres** - PostgreSQL database on port 5432
- **minio** - S3-compatible object storage on ports 9000/9001
- **redis** - Redis cache and message queue on port 6379

## Prerequisites

- Docker Desktop or Docker Engine + Docker Compose
- Make (optional, for convenience commands)

## Quick Start

1. **Start the development environment:**
   ```bash
   make dev
   # or
   docker-compose up --build
   ```

2. **Access the services:**
   - Web application: http://localhost:3000
   - Strands API: http://localhost:8080
   - MinIO Console: http://localhost:9001 (admin/minioadmin)
   - PostgreSQL: localhost:5432 (postgres/password)
   - Redis: localhost:6379

3. **Stop the environment:**
   ```bash
   make down
   # or
   docker-compose down
   ```

## Development Workflow

### Hot Reload

Both the Next.js web application and Python Strands service support hot reload:

- **Web**: Changes to files in `src/` will automatically reload the browser
- **Strands**: Changes to files in `services/strands/` will automatically restart the service

### Database Access

Access the PostgreSQL database:
```bash
make db-shell
# or
docker-compose exec postgres psql -U postgres -d proposal_prepper
```

### Service Logs

View logs from all services:
```bash
make logs
# or
docker-compose logs -f
```

View logs from a specific service:
```bash
docker-compose logs -f web
docker-compose logs -f strands
```

### Running Tests

Run tests in the containers:
```bash
make test
# or
docker-compose exec web npm test
docker-compose exec strands python -m pytest
```

## Service Configuration

### Environment Variables

Development environment variables are configured in:
- `.env.development` - Main environment configuration
- `docker-compose.yml` - Service-specific environment variables
- `docker-compose.override.yml` - Development-specific overrides

### Volumes

The following volumes are mounted for development:
- `.:/app` - Full source code for hot reload (web service)
- `./services/strands:/app` - Strands source code for hot reload
- `postgres_data` - Persistent PostgreSQL data
- `minio_data` - Persistent MinIO data
- `redis_data` - Persistent Redis data

### Networking

All services communicate through the `proposal-prepper-network` Docker network. Services can reach each other using their service names as hostnames.

## Troubleshooting

### Port Conflicts

If you have port conflicts, you can modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change host port from 3000 to 3001
```

### Database Connection Issues

1. Ensure PostgreSQL is healthy:
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Service Health Checks

Check the health of all services:
```bash
make health
```

### Clean Restart

If you encounter persistent issues, clean restart:
```bash
make clean
make dev
```

## Development Data

The database is initialized with sample data for development:
- Sample proposals in various states
- Sample compliance checks
- Database schema with proper indexes

## AWS Services Integration

For development with real AWS services:

1. Set AWS credentials in `.env.development`:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_BEDROCK_REGION=us-east-1
   ```

2. The Strands service will use these credentials to connect to AWS Bedrock and other services.

## Performance Optimization

For better development performance:

1. **Increase Docker resources** in Docker Desktop settings
2. **Use Docker volumes** instead of bind mounts for node_modules
3. **Enable file watching optimizations** (already configured in override file)

## Security Notes

This setup is for **development only**. Do not use these configurations in production:
- Default passwords are used for all services
- Services are exposed on all interfaces
- Debug logging is enabled
- No SSL/TLS encryption