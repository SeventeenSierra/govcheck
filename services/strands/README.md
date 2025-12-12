# Strands Python Service

AI-powered compliance analysis service for the Proposal Prepper application.

## Overview

The Strands service provides document analysis capabilities using AWS Bedrock for compliance checking against FAR/DFARS regulations. It's built with FastAPI and designed to run in a containerized environment alongside the Next.js web service.

## Features

- **Health Check Endpoint**: `/api/health` for container orchestration
- **Structured Logging**: Configurable logging with JSON format for production
- **Environment Configuration**: Pydantic-based settings management
- **CORS Support**: Configured for web service integration
- **Error Handling**: Consistent error response format
- **AWS Integration**: Ready for Bedrock AI services (to be implemented)

## Quick Start

### Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Run the service:
```bash
python main.py
```

The service will start on `http://localhost:8080`

### Docker

Build and run with Docker:
```bash
docker build -t strands-service .
docker run -p 8080:8080 strands-service
```

### Health Check

Test the service is running:
```bash
curl http://localhost:8080/api/health
```

## Configuration

The service uses environment variables for configuration. See `.env.example` for all available options.

Key configuration areas:
- **Service**: Host, port, environment
- **AWS**: Region, credentials, Bedrock model
- **Database**: PostgreSQL connection
- **Redis**: Cache configuration
- **S3/MinIO**: Object storage
- **Logging**: Level and output options

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns service status and health information

### Analysis Endpoints (To be implemented)
- **POST** `/api/analysis/start` - Start document analysis
- **GET** `/api/analysis/{sessionId}` - Get analysis status
- **GET** `/api/analysis/{sessionId}/results` - Get analysis results

## Development

The service is structured for easy extension:
- `main.py` - FastAPI application and routing
- `config.py` - Environment configuration management
- `logging_config.py` - Structured logging setup
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container configuration

## Next Steps

1. Implement AWS Bedrock integration
2. Add database models and operations
3. Create analysis endpoints
4. Add document processing capabilities
5. Implement concurrent processing