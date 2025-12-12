# Framework-Independent API Architecture

This document explains how the Proposal Prepper API has been designed to be completely framework-independent, allowing you to use it with Next.js, Express, standalone servers, or any other framework.

## Architecture Overview

The API is structured in three layers:

1. **Core Business Logic** (`src/services/mock-api-server.ts`) - Framework-independent
2. **Framework Adapters** (`src/adapters/`) - Thin wrappers for specific frameworks  
3. **Configuration** (`src/config/api-config.ts`) - Environment-based configuration

## Core Components

### MockApiServer
The `MockApiServer` class contains all business logic for handling API requests. It's completely framework-independent and can be used anywhere.

```typescript
import { mockApiServer } from '@/services/mock-api-server';

// Handle document upload
const result = await mockApiServer.handleDocumentUpload(file);

// Start analysis
const analysis = await mockApiServer.handleAnalysisStart(proposalId);

// Get results
const results = await mockApiServer.handleAnalysisResults(sessionId);
```

### API Configuration
The configuration system automatically detects the environment and configures the appropriate API endpoints.

```typescript
import { apiConfiguration, ApiConfigUtils } from '@/config/api-config';

// Get current configuration
const config = apiConfiguration;

// Configure for different frameworks
ApiConfigUtils.configureForNextJs(3000);
ApiConfigUtils.configureForExpress(8080);
ApiConfigUtils.configureForStandaloneMock(8081);
```

## Framework Integration Examples

### Next.js (Current Implementation)

```typescript
// app/api/documents/upload/route.ts
import { NextJsApiHandlers } from '@/adapters/nextjs-adapter';

export const POST = NextJsApiHandlers.handleDocumentUpload;
```

### Express.js

```typescript
// server.js
import express from 'express';
import { ExpressApiHandlers } from '@/adapters/express-adapter';

const app = express();
app.use(express.json());

app.post('/api/documents/upload', ExpressApiHandlers.handleDocumentUpload);
app.post('/api/analysis/start', ExpressApiHandlers.handleAnalysisStart);
// ... other routes

app.listen(8080);
```

### Standalone Server

```typescript
// standalone-server.js
import { createStandaloneServer } from '@/adapters/standalone-server';

createStandaloneServer(8081);
```

### Fastify

```typescript
// fastify-server.js
import Fastify from 'fastify';
import { mockApiServer } from '@/services/mock-api-server';

const fastify = Fastify();

fastify.post('/api/documents/upload', async (request, reply) => {
  const file = request.body.file;
  const result = await mockApiServer.handleDocumentUpload(file);
  
  if (result.success) {
    reply.code(201).send({ success: true, data: result.data });
  } else {
    reply.code(400).send({ success: false, error: result.error });
  }
});

fastify.listen({ port: 8080 });
```

### Hono (Edge Runtime)

```typescript
// hono-server.js
import { Hono } from 'hono';
import { mockApiServer } from '@/services/mock-api-server';

const app = new Hono();

app.post('/api/documents/upload', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  const result = await mockApiServer.handleDocumentUpload(file);
  
  return c.json(result.success ? 
    { success: true, data: result.data } : 
    { success: false, error: result.error }
  );
});

export default app;
```

## Frontend Framework Usage

### React (without Next.js)

```typescript
// api-client.ts
import { StrandsApiClient } from '@/services/strands-api-client';
import { ApiConfigUtils } from '@/config/api-config';

// Configure for standalone server
ApiConfigUtils.configureForStandaloneMock(8081);

const apiClient = new StrandsApiClient('http://localhost:8081');

// Use in React components
const uploadFile = async (file: File) => {
  const result = await apiClient.uploadDocument(file);
  return result;
};
```

### Vue.js

```typescript
// composables/useApi.ts
import { StrandsApiClient } from '@/services/strands-api-client';

export function useApi() {
  const apiClient = new StrandsApiClient('http://localhost:8081');
  
  const uploadDocument = async (file: File) => {
    return await apiClient.uploadDocument(file);
  };
  
  const startAnalysis = async (proposalId: string) => {
    return await apiClient.startAnalysis(proposalId);
  };
  
  return {
    uploadDocument,
    startAnalysis
  };
}
```

### Vanilla JavaScript

```javascript
// vanilla-client.js
import { StrandsApiClient } from './services/strands-api-client.js';

const apiClient = new StrandsApiClient('http://localhost:8081');

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = e.target.file.files[0];
  
  const result = await apiClient.uploadDocument(file);
  
  if (result.success) {
    console.log('Upload successful:', result.data);
  } else {
    console.error('Upload failed:', result.error);
  }
});
```

## Deployment Scenarios

### Scenario 1: Next.js with Built-in API Routes
- Frontend: Next.js (port 3000)
- API: Next.js API routes (same port)
- Configuration: `ApiConfigUtils.configureForNextJs(3000)`

### Scenario 2: React + Express Backend
- Frontend: React dev server (port 3000)
- API: Express server (port 8080)
- Configuration: `ApiConfigUtils.configureForExpress(8080)`

### Scenario 3: Standalone Mock Server
- Frontend: Any framework (any port)
- API: Standalone Node.js server (port 8081)
- Configuration: `ApiConfigUtils.configureForStandaloneMock(8081)`

### Scenario 4: Production with Real API
- Frontend: Static build (CDN)
- API: Real Strands service (production URL)
- Configuration: `ApiConfigUtils.configureForProduction('https://api.example.com')`

## Environment Variables

Configure the API behavior using environment variables:

```bash
# API URLs
STRANDS_API_URL=http://localhost:8080
MOCK_API_URL=http://localhost:3000

# API behavior
USE_MOCK_API=true
API_TIMEOUT=30000
API_RETRIES=3
API_RETRY_DELAY=1000
```

## Testing

The framework-independent design makes testing much easier:

```typescript
// test/api.test.ts
import { mockApiServer } from '@/services/mock-api-server';

describe('API Server', () => {
  it('should handle document upload', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = await mockApiServer.handleDocumentUpload(file);
    
    expect(result.success).toBe(true);
    expect(result.data?.filename).toBe('test.pdf');
  });
});
```

## Migration Guide

### From Next.js to Express

1. Install Express dependencies:
   ```bash
   npm install express cors multer
   npm install -D @types/express @types/cors @types/multer
   ```

2. Create Express server:
   ```typescript
   import { createExpressServer } from '@/adapters/express-adapter';
   createExpressServer(8080);
   ```

3. Update frontend configuration:
   ```typescript
   ApiConfigUtils.configureForExpress(8080);
   ```

### From Next.js to Standalone

1. Start standalone server:
   ```bash
   node src/adapters/standalone-server.js
   ```

2. Update frontend configuration:
   ```typescript
   ApiConfigUtils.configureForStandaloneMock(8081);
   ```

### From Mock to Real API

1. Update environment variables:
   ```bash
   USE_MOCK_API=false
   STRANDS_API_URL=http://localhost:8080
   ```

2. Or use configuration:
   ```typescript
   ApiConfigUtils.configureForProduction('https://api.example.com');
   ```

## Benefits

✅ **Framework Independence** - Use with any frontend framework  
✅ **Deployment Flexibility** - Deploy API separately from frontend  
✅ **Testing Benefits** - Test business logic without framework overhead  
✅ **Development Experience** - Same API whether using real or mock backend  
✅ **Scalability** - Easy to switch between different backend implementations  
✅ **Maintainability** - Single source of truth for business logic