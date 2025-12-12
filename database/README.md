# Database Seeding System

This directory contains the database initialization and seeding system for the Proposal Prepper application.

## Overview

The seeding system automatically populates the database with metadata for 30 real PDF proposal documents from the `src/seed-data/` directory. This enables testing and demonstration of the complete analysis workflow with real documents.

## Files

### Database Scripts

- **`init.sql`** - Basic database initialization with core tables and extensions
- **`migrate-schema.sql`** - Schema migration for compatibility between web and Strands services
- **`seed-documents.sql`** - Document metadata seeding for all 30 PDF files

### Execution Order

The Docker Compose configuration executes these scripts in order during PostgreSQL initialization:

1. `01-init-db.sql` - Basic setup
2. `02-migrate-schema.sql` - Schema compatibility
3. `03-seed-documents.sql` - Document seeding

## Seeded Documents

The system seeds metadata for 30 real proposal documents:

- **2 Baecher Joseph proposals** (2023, 2024)
- **1 Barker Michelle proposal** (2020) - Wellcome Trust
- **1 Bertolet Brittnil proposal** (2021)
- **1 Brown Ctitus proposal** (2014)
- **1 Burnette Elizabeth proposal** (2020)
- **1 Dasari Mauna proposal** (2021) - NSF Postdoctoral Fellowship
- **1 Dumitrescu Adna proposal** (2020)
- **3 Durvasula Arun proposals** (2018)
- **1 Frazer Ryane proposal** (2019)
- **1 Gregory Samantha proposal** (2018)
- **1 Howard Cody proposal** (2018)
- **1 Huber Felix proposal** (2017)
- **1 Jensen Jan proposal** (2015) - Danish National Science Foundation
- **1 Komarov Ilya proposal** (2020)
- **1 Miller Henrye proposal** (2020)
- **1 Nell Lucas proposal** (2022)
- **1 Polino Alexander proposal** (2017)
- **1 Rick Jessica proposal** (2021)
- **1 Ross-Ibarra Jeff proposal** (2015)
- **1 Scott Catherine proposal** (2015)
- **1 Sinclair Alyssa proposal** (2019)
- **1 Tollerud Erik proposal** (2019)
- **1 Whitehead Andrew proposal** (2021)
- **1 Zhu Rebecca proposal** (2018)
- **3 Zorowitz Sam proposals** (2018)

## Database Schema

### Core Tables

#### `documents` / `document_metadata`
- Stores document metadata and file information
- Compatible with both web service and Strands service
- Includes PDF metadata, file sizes, and S3 keys

#### `analysis_sessions`
- Tracks analysis session state and progress
- Used by Strands service for concurrent processing
- Links to document metadata

#### `compliance_results`
- Stores AI analysis results and compliance findings
- Links to analysis sessions
- Includes scoring and issue counts

#### `compliance_issues`
- Individual compliance issues found during analysis
- Links to compliance results
- Includes regulatory references and remediation suggestions

### Views and Functions

#### `unified_documents`
- Unified view of documents across both services
- Handles compatibility between different table structures

#### `get_document_count_by_status()`
- Returns document counts grouped by status
- Useful for monitoring seeding progress

#### `check_seeding_completeness()`
- Returns seeding completion statistics
- Shows progress toward the expected 30 documents

## API Endpoints

The Strands service provides several endpoints for managing seeding:

### Status and Information
- `GET /api/seed/status` - Get seeding status and progress
- `GET /api/seed/documents` - List all seeded documents
- `GET /api/seed/verify` - Verify file availability

### Management
- `POST /api/seed/reseed` - Force database reseeding

### Web Service Integration
- `GET /api/seed?action=status` - Web service proxy to seeding status
- `GET /api/seed?action=documents` - Web service proxy to document list
- `GET /api/seed?action=verify` - Web service proxy to file verification
- `POST /api/seed` - Web service proxy to trigger reseeding

## Usage

### Automatic Seeding

Seeding happens automatically when the Docker containers start:

```bash
docker-compose up
```

The PostgreSQL container will execute the initialization scripts and seed the database with all 30 documents.

### Manual Seeding

You can trigger manual reseeding through the API:

```bash
# Check seeding status
curl http://localhost:8080/api/seed/status

# Trigger reseeding
curl -X POST http://localhost:8080/api/seed/reseed

# Verify files
curl http://localhost:8080/api/seed/verify
```

### Monitoring

Check seeding progress and status:

```sql
-- Check seeding completeness
SELECT * FROM check_seeding_completeness();

-- Count documents by status
SELECT * FROM get_document_count_by_status();

-- View all seeded documents
SELECT * FROM unified_documents WHERE upload_status = 'seeded';
```

## File Structure

The seeding system expects PDF files to be available at:

```
src/seed-data/
├── baecher_joseph_2023_d1f8a239-27c0-4a38-a333-ea4e82533d1b_PROPOSAL_1.pdf
├── baecher_joseph_2024_c6f0ae22-48ba-4044-a44c-d860f9b8d17f_PROPOSAL_1.pdf
├── barker_michelle_2020_1b5d2213-4c72-4da8-a7b8-bece5b27d280_PROPOSAL_1.pdf
└── ... (27 more PDF files)
```

The Strands service mounts this directory as a read-only volume to access the files during analysis.

## Troubleshooting

### Seeding Not Complete

If seeding shows incomplete status:

1. Check container logs: `docker-compose logs postgres`
2. Verify file availability: `curl http://localhost:8080/api/seed/verify`
3. Trigger manual reseeding: `curl -X POST http://localhost:8080/api/seed/reseed`

### Missing Files

If files are missing from the seed-data directory:

1. Ensure all 30 PDF files are present in `src/seed-data/`
2. Check file permissions (should be readable)
3. Verify Docker volume mounting in `docker-compose.yml`

### Database Connection Issues

If seeding fails due to database issues:

1. Check PostgreSQL container health: `docker-compose ps`
2. Verify database connectivity: `docker-compose logs strands`
3. Check environment variables in `docker-compose.yml`

## Development

### Adding New Documents

To add new documents to the seeding system:

1. Add PDF files to `src/seed-data/`
2. Update `seed-documents.sql` with new metadata entries
3. Update `seed_manager.py` with new document definitions
4. Update the expected count in database functions

### Schema Changes

When modifying the database schema:

1. Update `migrate-schema.sql` with new tables/columns
2. Update SQLAlchemy models in `services/strands/db_models.py`
3. Test with a fresh database: `docker-compose down -v && docker-compose up`

## Security Considerations

- Seed data contains real proposal documents - ensure appropriate access controls
- Database initialization scripts run with elevated privileges
- S3 keys and file paths are stored in database - protect against injection
- API endpoints for seeding management should be secured in production