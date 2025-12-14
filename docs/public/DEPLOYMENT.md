# Deployment Guide - Proposal Prepper (Contract Checker)

> **Quick Start for Team Members**: This guide will help you deploy and run the complete Proposal Prepper application with or without AWS AI capabilities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deploy (5 Minutes)](#quick-deploy-5-minutes)
3. [Full Deployment with AWS AI](#full-deployment-with-aws-ai)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Stopping the Application](#stopping-the-application)

---

## Prerequisites

### Required
- **Docker Desktop** (or Docker Engine + Docker Compose)
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Minimum 8GB RAM allocated to Docker
  - 20GB free disk space

### Optional (for AI Analysis)
- **AWS Account** with Bedrock access
  - Access keys with Bedrock permissions
  - Region: `us-east-1` (recommended)

---

## Quick Deploy (5 Minutes)

This deployment runs the complete application with **mock AI analysis** - perfect for frontend development and testing without AWS credentials.

### Step 1: Clone and Navigate

```bash
# Clone the repository (if not already done)
git clone https://github.com/yourusername/proposal-prepper.git
cd proposal-prepper
```

### Step 2: Start the Application

```bash
cd containers
./start.sh -d
```

**What this does:**
- Builds all Docker containers (first time only, ~3-5 minutes)
- Starts 5 services: Web UI, Strands API, PostgreSQL, Redis, MinIO
- Seeds database with 30 sample proposal documents
- Runs in background (detached mode)

### Step 3: Wait for Services to Start

```bash
# Check service health (wait until all show "healthy")
docker-compose -p proposal-prepper ps
```

Expected output after 60-90 seconds:
```
NAME                          STATUS             PORTS
proposal-prepper-web-1        Up (healthy)      0.0.0.0:3000->3000/tcp
proposal-prepper-strands-1    Up (healthy)      0.0.0.0:8080->8080/tcp
proposal-prepper-postgres-1   Up (healthy)      0.0.0.0:5432->5432/tcp
proposal-prepper-redis-1      Up (healthy)      0.0.0.0:6379->6379/tcp
proposal-prepper-minio-1      Up (healthy)      0.0.0.0:9000-9001->9000-9001/tcp
```

### Step 4: Access the Application

Open your browser to:

- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **API Health**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (admin/minioadmin)

🎉 **You're done!** The application is running with mock AI analysis.

---

## Full Deployment with AWS AI

For **real AI-powered compliance analysis** using AWS Bedrock (Claude 3.7 Sonnet / Nova Pro):

### Step 1: Create Environment File

```bash
cd containers
cp .env.template .env
```

### Step 2: Configure AWS Credentials

Edit `.env` and add your AWS credentials:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_actual_access_key_here
AWS_SECRET_ACCESS_KEY=your_actual_secret_key_here
AWS_REGION=us-east-1

# AI Model Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

### Step 3: Verify Bedrock Access

Test your AWS credentials have Bedrock access:

```bash
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?contains(modelId, `claude`)].modelId' --output table
```

### Step 4: Start with AWS AI Enabled

```bash
./start.sh -d
```

The Strands service will automatically use AWS Bedrock instead of mock analysis.

### Step 5: Verify AI Integration

```bash
# Check Strands logs for AWS connection
docker-compose -p proposal-prepper logs strands | grep -i "bedrock\|aws"
```

Expected output:
```
strands-1  | INFO:app.startup:AWS Bedrock client initialized successfully
strands-1  | INFO:app.startup:Model: anthropic.claude-3-sonnet-20240229-v1:0
strands-1  | INFO:app.startup:Region: us-east-1
```

---

## Verification

### Health Check All Services

```bash
# Web Service
curl http://localhost:3000/api/health
# Expected: {"status": "healthy", ...}

# Strands Service  
curl http://localhost:8080/api/health
# Expected: {"status": "healthy", "checks": {"database": "healthy", ...}}

# Database
docker-compose -p proposal-prepper exec postgres pg_isready -U postgres
# Expected: postgres:5432 - accepting connections

# Redis
docker-compose -p proposal-prepper exec redis redis-cli ping
# Expected: PONG
```

### Test Document Upload and Analysis

```bash
# Check seeded documents are loaded
curl http://localhost:8080/api/seed/documents | jq '.documents | length'
# Expected: 30

# Upload a test document via the Web UI
# 1. Go to http://localhost:3000
# 2. Click "New Compliance Check"
# 3. Upload a PDF proposal document
# 4. Watch the analysis progress
```

### View Service Logs

```bash
# All services
docker-compose -p proposal-prepper logs -f

# Specific service
docker-compose -p proposal-prepper logs -f web
docker-compose -p proposal-prepper logs -f strands
```

---

## Troubleshooting

### Problem: Services Won't Start

**Symptom**: Containers exit immediately or fail health checks

**Solution**:
```bash
# Check logs for errors
docker-compose -p proposal-prepper logs

# Clean restart
./start.sh -c -d

# Check Docker resources
docker system df
docker stats
```

### Problem: Port Already in Use

**Symptom**: `Error: bind: address already in use`

**Solution**:
```bash
# Find process using port 3000, 8080, etc.
lsof -i :3000
lsof -i :8080

# Kill the process or change port in docker-compose.yml
```

### Problem: AWS Bedrock Access Denied

**Symptom**: `AccessDeniedException` in Strands logs

**Solution**:
1. Verify IAM user has Bedrock permissions:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "bedrock:InvokeModel",
       "bedrock:ListFoundationModels"
     ],
     "Resource": "*"
   }
   ```

2. Check region is `us-east-1` (where Bedrock is available)

3. Verify credentials are correct:
   ```bash
   aws sts get-caller-identity
   ```

### Problem: Database Not Seeding

**Symptom**: No documents appear in the UI

**Solution**:
```bash
# Check seed status
curl http://localhost:8080/api/seed/status

# Force reseed
curl -X POST http://localhost:8080/api/seed/reseed

# Verify files exist
ls -lh src/seed-data/
```

### Problem: Out of Memory

**Symptom**: Containers crashing with OOM errors

**Solution**:
```bash
# Increase Docker Desktop memory allocation
# Docker Desktop → Settings → Resources → Memory: 8GB minimum

# Or reduce concurrent analyses in .env
MAX_CONCURRENT_ANALYSES=2
```

### Problem: Slow Performance

**Symptom**: Analysis takes \u003e5 minutes per document

**Solution**:
- Check system resources: `docker stats`
- Use SSD storage for Docker volumes
- Reduce concurrent workers in `.env`:
  ```bash
  MAX_CONCURRENT_ANALYSES=3
  ANALYSIS_TIMEOUT_SECONDS=180
  ```

---

## Stopping the Application

### Graceful Shutdown (Preserves Data)

```bash
cd containers
docker-compose -p proposal-prepper down
```

**Data preserved in Docker volumes:**
- Database (proposals, results)
- MinIO (uploaded PDFs)
- Redis (cache)

### Complete Reset (Deletes All Data)

```bash
cd containers
./start.sh -c
```

⚠️ **Warning**: This deletes all documents, analysis results, and uploaded files.

---

## Data Management

### Backup All Data

```bash
cd containers
./data-manager.sh backup
# Creates timestamped backup in ./backups/
```

### Restore from Backup

```bash
./data-manager.sh list-backups
./data-manager.sh restore backup_20241214_143022
```

### View Data Volumes

```bash
docker volume ls | grep proposal-prepper
```

---

## Production Deployment

For production environments:

```bash
# Use production compose file
./start.sh -e production -d

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Production Features:**
- Resource limits (CPU/memory)
- Optimized database configuration
- Reduced logging verbosity
- Security hardening
- Health check monitoring

**Production Checklist:**
- [ ] Change default passwords (PostgreSQL, MinIO)
- [ ] Configure TLS/SSL termination (nginx/Caddy)
- [ ] Set up backup automation
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Restrict port exposure (firewall rules)
- [ ] Set `ENVIRONMENT=production` in `.env`

---

## Next Steps

After deployment:

1. **Frontend Development**: Web UI runs on `localhost:3000` with hot reload
2. **Backend Integration**: See [API_INTEGRATION.md](./API_INTEGRATION.md) for API docs
3. **Testing**: Run tests with `pnpm test` (see [TESTING.md](./guides/testing-strategy.md))
4. **Customization**: Modify compliance rules, AI prompts, UI components

---

## Support

- **Issues**: See logs with `docker-compose logs -f`
- **Docs**: Full documentation in `docs/` directory
- **API Reference**: [http://localhost:8080/docs](http://localhost:8080/docs) (when running)

**Questions?** Check [containers/README.md](../containers/README.md) for detailed configuration options.
