# Quick Start Guide - For New Team Members

> **Ready in 5 minutes** | No AWS credentials needed for local development

## What You're Working With

**Proposal Prepper** is an AI-powered NSF PAPPG compliance checker with:
- **Web UI** (Next.js) - The frontend you'll integrate with
- **Strands API** (Python/FastAPI) - The AI compliance backend  
- **Full Docker Setup** - Everything runs in containers

---

## 🚀 Get Started in 3 Commands

```bash
# 1. Navigate to containers
cd proposal-prepper/containers

# 2. Start everything  
./start.sh -d

# 3. Wait 90 seconds, then open your browser
```

**Access Points:**
- 🌐 **Web UI**: [http://localhost:3000](http://localhost:3000)
- 🔌 **API Docs**: [http://localhost:8080/docs](http://localhost:8080/docs)
- 📦 **MinIO Console**: [http://localhost:9001](http://localhost:9001) (minioadmin/minioadmin)

---

## What's Running?

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| **web** | 3000 | Next.js frontend | http://localhost:3000/api/health |
| **strands** | 8080 | Python API backend | http://localhost:8080/api/health |
| **postgres** | 5432 | Database | `docker-compose -p proposal-prepper exec postgres pg_isready` |
| **redis** | 6379 | Cache | `docker-compose -p proposal-prepper exec redis redis-cli ping` |
| **minio** | 9000/9001 | S3 storage | http://localhost:9000/minio/health/live |

---

## Your First Test

### 1. Upload a Document

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click **"New Compliance Check"**
3. Upload any PDF from `src/seed-data/`
4. Watch the analysis run!

### 2. Test the API Directly

```bash
# Check API health
curl http://localhost:8080/api/health | jq

# List seeded documents
curl http://localhost:8080/api/seed/documents | jq '.documents | length'
# Should show: 30
```

---

## For Backend Developers

### Hook Up Your Backend to the UI

The web UI expects these endpoints on the Strands API:

```
POST   /api/analysis/start              # Start analysis
GET    /api/analysis/{id}/status        # Get progress
GET    /api/analysis/{id}/results       # Get results
DELETE /api/analysis/{id}/cancel        # Cancel analysis
```

**Full integration guide**: [`docs/public/API_INTEGRATION.md`](../docs/public/API_INTEGRATION.md)

**TypeScript types already defined**: `src/types/analysis.ts`

**Example client**: `src/services/strands-api-client.ts`

---

## For Frontend Developers

### Where the Code Lives

```
src/
├── app/                    # Next.js pages (App Router)
├── components/             # React components
│   ├── analysis/          # Compliance results UI
│   ├── documents/         # Upload & document management
│   └── dashboard/         # Dashboard widgets
├── services/              # API clients
│   └── strands-api-client.ts    # ← You'll use this
└── types/                 # TypeScript types
```

### Development Commands

```bash
pnpm dev              # Start dev server (or use Docker)
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm storybook        # Component playground
pnpm lint             # Check code quality
pnpm typecheck        # TypeScript validation
```

---

## Common Tasks

### View Logs

```bash
# All services
docker-compose -p proposal-prepper logs -f

# Specific service
docker-compose -p proposal-prepper logs -f web
docker-compose -p proposal-prepper logs -f strands
```

### Restart Services

```bash
# Restart everything
docker-compose -p proposal-prepper restart

# Restart just one service
docker-compose -p proposal-prepper restart web
```

### Stop Everything

```bash
cd containers
docker-compose -p proposal-prepper down
```

**⚠️ To delete all data (fresh start):**
```bash
./start.sh -c
```

---

## Troubleshooting

### "Services won't start"

```bash
# Check what failed
docker-compose -p proposal-prepper ps
docker-compose -p proposal-prepper logs

# Clean restart
cd containers
./start.sh -c -d
```

### "Port already in use"

```bash
# Find what's using the port
lsof -i :3000
lsof -i :8080

# Kill it or change ports in docker-compose.yml
```

### "No documents seeded"

```bash
# Check seed status
curl http://localhost:8080/api/seed/status

# Force reseed
curl -X POST http://localhost:8080/api/seed/reseed
```

---

## File Upload Flow

Here's how document analysis works:

```
1. User uploads PDF via Web UI
   ↓
2. File → MinIO (S3 storage)
   ↓
3. Web UI → POST /api/analysis/start → Strands API
   ↓
4. Strands extracts text from PDF
   ↓
5. Strands → AWS Bedrock (or mock AI)
   ↓
6. Results stored in PostgreSQL
   ↓
7. Web UI polls GET /api/analysis/{id}/status
   ↓
8. Web UI fetches GET /api/analysis/{id}/results
   ↓
9. Display compliance report
```

---

## Need AWS AI?

**Not required for development** - mock analysis works out of the box.

**To enable real AI:**

1. Get AWS credentials with Bedrock access
2. Edit `containers/.env`:
   ```bash
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   ```
3. Restart: `./start.sh -d`

---

## Full Documentation

| Document | Purpose |
|----------|---------|
| [**DEPLOYMENT.md**](../docs/public/DEPLOYMENT.md) | Complete deployment guide |
| [**API_INTEGRATION.md**](../docs/public/API_INTEGRATION.md) | Backend integration guide |
| [**containers/README.md**](../containers/README.md) | Docker configuration details |
| [**README.md**](../README.md) | Project overview |

---

## Support

**Something not working?**

1. Check service health: `curl http://localhost:8080/api/health`
2. View logs: `docker-compose -p proposal-prepper logs strands`
3. Review [DEPLOYMENT.md](../docs/public/DEPLOYMENT.md) troubleshooting section

**Questions about the API?**

- API docs (when running): [http://localhost:8080/docs](http://localhost:8080/docs)
- Integration guide: [docs/public/API_INTEGRATION.md](../docs/public/API_INTEGRATION.md)

---

## Next Steps

- ✅ Get the application running locally
- ✅ Test document upload via UI
- ✅ Review API documentation
- ✅ Explore codebase structure
- ✅ Make your first change!

**Happy coding! 🚀**
