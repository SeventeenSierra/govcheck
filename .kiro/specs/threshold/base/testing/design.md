<!--
SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC
-->

# Threshold Testing Design Document

## Overview

The Testing component provides comprehensive testing capabilities for the Proposal Prepper application, ensuring code quality, user workflow validation, and security compliance. The design implements a multi-layered testing strategy including unit tests, integration tests, end-to-end tests, and security testing to maintain high reliability and catch issues early in the development cycle.

## Architecture

### Testing Architecture

```mermaid
graph TB
    subgraph "Test Execution Layer"
        TestRunner[Test Runner]
        CI[CI/CD Pipeline]
        LocalDev[Local Development]
        Coverage[Coverage Analysis]
    end
    
    subgraph "Unit Testing"
        UnitTests[Unit Tests]
        ComponentTests[Component Tests]
        ServiceTests[Service Tests]
        UtilTests[Utility Tests]
    end
    
    subgraph "Integration Testing"
        APITests[API Integration Tests]
        DatabaseTests[Database Tests]
        ServiceIntegration[Service Integration]
        ExternalServices[External Service Tests]
    end
    
    subgraph "End-to-End Testing"
        E2ETests[E2E Workflow Tests]
        UITests[UI Interaction Tests]
        UserJourneys[User Journey Tests]
        CrossBrowser[Cross-Browser Tests]
    end
    
    subgraph "Security Testing"
        SAST[Static Analysis]
        DependencyScanning[Dependency Scanning]
        AuthTests[Authentication Tests]
        VulnTests[Vulnerability Tests]
    end
    
    subgraph "Performance Testing"
        LoadTests[Load Tests]
        StressTests[Stress Tests]
        PerformanceMonitoring[Performance Monitoring]
        BenchmarkTests[Benchmark Tests]
    end
    
    subgraph "Test Infrastructure"
        TestData[Test Data Management]
        Fixtures[Test Fixtures]
        Mocks[Mocks & Stubs]
        TestEnv[Test Environments]
    end
    
    TestRunner --> UnitTests
    TestRunner --> APITests
    TestRunner --> E2ETests
    TestRunner --> SAST
    TestRunner --> LoadTests
    
    CI --> TestRunner
    LocalDev --> TestRunner
    Coverage --> TestRunner
    
    UnitTests --> ComponentTests
    UnitTests --> ServiceTests
    UnitTests --> UtilTests
    
    APITests --> DatabaseTests
    APITests --> ServiceIntegration
    APITests --> ExternalServices
    
    E2ETests --> UITests
    E2ETests --> UserJourneys
    E2ETests --> CrossBrowser
    
    SAST --> DependencyScanning
    SAST --> AuthTests
    SAST --> VulnTests
    
    LoadTests --> StressTests
    LoadTests --> PerformanceMonitoring
    LoadTests --> BenchmarkTests
    
    TestData --> Fixtures
    Fixtures --> Mocks
    Mocks --> TestEnv
    
    classDef execution fill:#e1f5fe
    classDef unit fill:#f3e5f5
    classDef integration fill:#e8f5e8
    classDef e2e fill:#fff3e0
    classDef security fill:#f0f4f8
    classDef performance fill:#fce4ec
    classDef infrastructure fill:#e0f2f1
    
    class TestRunner,CI,LocalDev,Coverage execution
    class UnitTests,ComponentTests,ServiceTests,UtilTests unit
    class APITests,DatabaseTests,ServiceIntegration,ExternalServices integration
    class E2ETests,UITests,UserJourneys,CrossBrowser e2e
    class SAST,DependencyScanning,AuthTests,VulnTests security
    class LoadTests,StressTests,PerformanceMonitoring,BenchmarkTests performance
    class TestData,Fixtures,Mocks,TestEnv infrastructure
```

## Testing Components

### Unit Testing Framework

#### Test Configuration
```typescript
interface TestConfig {
  framework: 'vitest';
  testMatch: string[];
  coverage: CoverageConfig;
  setupFiles: string[];
  environment: 'jsdom' | 'node';
  timeout: number;
}

interface CoverageConfig {
  provider: 'v8' | 'istanbul';
  reporter: string[];
  threshold: {
    global: {
      branches: number;
      functions: number;
      lines: number;
      statements: number;
    };
  };
  exclude: string[];
}

const testConfig: TestConfig = {
  framework: 'vitest',
  testMatch: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    threshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70
      }
    },
    exclude: ['**/*.d.ts', '**/node_modules/**', '**/dist/**']
  },
  setupFiles: ['./vitest.setup.ts'],
  environment: 'jsdom',
  timeout: 10000
};
```

#### Unit Test Structure
```typescript
interface UnitTestSuite {
  describe: string;
  tests: UnitTest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  beforeEach?: () => Promise<void>;
  afterEach?: () => Promise<void>;
}

interface UnitTest {
  name: string;
  test: () => Promise<void>;
  skip?: boolean;
  timeout?: number;
  tags?: string[];
}

// Example unit test structure
describe('ProposalService', () => {
  let proposalService: ProposalService;
  let mockDatabase: MockDatabase;
  
  beforeEach(async () => {
    mockDatabase = new MockDatabase();
    proposalService = new ProposalService(mockDatabase);
  });
  
  afterEach(async () => {
    await mockDatabase.cleanup();
  });
  
  describe('createProposal', () => {
    it('should create proposal with valid data', async () => {
      const proposalData = createValidProposalData();
      const result = await proposalService.createProposal(proposalData);
      
      expect(result.success).toBe(true);
      expect(result.proposal.id).toBeDefined();
      expect(mockDatabase.proposals).toHaveLength(1);
    });
    
    it('should reject proposal with invalid data', async () => {
      const invalidData = createInvalidProposalData();
      
      await expect(proposalService.createProposal(invalidData))
        .rejects.toThrow('Invalid proposal data');
    });
  });
});
```

### Component Testing

#### React Component Testing
```typescript
interface ComponentTestUtils {
  render: (component: React.ReactElement, options?: RenderOptions) => RenderResult;
  fireEvent: typeof fireEvent;
  waitFor: (callback: () => void, options?: WaitForOptions) => Promise<void>;
  screen: typeof screen;
  userEvent: typeof userEvent;
}

interface ComponentTest {
  component: React.ComponentType;
  props: Record<string, any>;
  expectedBehavior: string;
  interactions?: UserInteraction[];
  assertions: Assertion[];
}

// Example component test
describe('UploadComponent', () => {
  it('should display upload progress during file upload', async () => {
    const mockOnUpload = vi.fn();
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    render(<UploadComponent onUpload={mockOnUpload} />);
    
    const fileInput = screen.getByLabelText(/upload file/i);
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    
    // Simulate file selection
    await userEvent.upload(fileInput, mockFile);
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    
    // Simulate upload
    await userEvent.click(uploadButton);
    
    // Check progress indicator appears
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    
    // Wait for upload completion
    await waitFor(() => {
      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    });
    
    expect(mockOnUpload).toHaveBeenCalledWith(mockFile);
  });
  
  it('should show error message for invalid file types', async () => {
    render(<UploadComponent onUpload={vi.fn()} />);
    
    const fileInput = screen.getByLabelText(/upload file/i);
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await userEvent.upload(fileInput, invalidFile);
    
    expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    expect(screen.getByText(/only pdf, doc, docx, and rtf files are allowed/i)).toBeInTheDocument();
  });
});
```

#### Accessibility Testing
```typescript
interface AccessibilityTest {
  component: React.ComponentType;
  axeRules?: string[];
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
}

// Example accessibility test
describe('UploadComponent Accessibility', () => {
  it('should be accessible to screen readers', async () => {
    const { container } = render(<UploadComponent onUpload={vi.fn()} />);
    
    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', async () => {
    render(<UploadComponent onUpload={vi.fn()} />);
    
    const fileInput = screen.getByLabelText(/upload file/i);
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    
    // Test tab navigation
    await userEvent.tab();
    expect(fileInput).toHaveFocus();
    
    await userEvent.tab();
    expect(uploadButton).toHaveFocus();
    
    // Test enter key activation
    await userEvent.keyboard('{Enter}');
    // Verify button activation behavior
  });
  
  it('should have proper ARIA labels', () => {
    render(<UploadComponent onUpload={vi.fn()} />);
    
    expect(screen.getByLabelText(/upload file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    
    const progressBar = screen.queryByRole('progressbar');
    if (progressBar) {
      expect(progressBar).toHaveAttribute('aria-label');
    }
  });
});
```

### Integration Testing

#### API Integration Tests
```typescript
interface APITestSuite {
  baseURL: string;
  authentication: AuthConfig;
  tests: APITest[];
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
}

interface APITest {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  expectedStatus: number;
  expectedResponse?: any;
  validation?: (response: any) => boolean;
}

// Example API integration test
describe('Proposal API Integration', () => {
  let testServer: TestServer;
  let authToken: string;
  
  beforeAll(async () => {
    testServer = await createTestServer();
    authToken = await getTestAuthToken();
  });
  
  afterAll(async () => {
    await testServer.close();
  });
  
  describe('POST /api/proposals', () => {
    it('should create proposal with valid file', async () => {
      const formData = new FormData();
      formData.append('file', createTestPDFFile());
      formData.append('metadata', JSON.stringify({ title: 'Test Proposal' }));
      
      const response = await fetch(`${testServer.url}/api/proposals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.filename).toBeDefined();
      expect(result.data.status).toBe('uploaded');
    });
    
    it('should reject invalid file types', async () => {
      const formData = new FormData();
      formData.append('file', createTestTextFile());
      
      const response = await fetch(`${testServer.url}/api/proposals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_FILE_TYPE');
    });
  });
});
```

#### Database Integration Tests
```typescript
interface DatabaseTestSuite {
  database: TestDatabase;
  migrations: Migration[];
  seedData: SeedData[];
  tests: DatabaseTest[];
}

// Example database integration test
describe('Database Integration', () => {
  let testDb: TestDatabase;
  
  beforeEach(async () => {
    testDb = await createTestDatabase();
    await testDb.migrate();
    await testDb.seed();
  });
  
  afterEach(async () => {
    await testDb.cleanup();
  });
  
  describe('Proposal Repository', () => {
    it('should maintain referential integrity', async () => {
      const user = await testDb.users.create(createTestUser());
      const proposal = await testDb.proposals.create({
        ...createTestProposal(),
        userId: user.id
      });
      
      // Verify relationship
      const foundProposal = await testDb.proposals.findById(proposal.id);
      expect(foundProposal.userId).toBe(user.id);
      
      // Test cascade delete
      await testDb.users.delete(user.id);
      const deletedProposal = await testDb.proposals.findById(proposal.id);
      expect(deletedProposal).toBeNull();
    });
    
    it('should enforce data constraints', async () => {
      const invalidProposal = {
        ...createTestProposal(),
        fileSize: -1 // Invalid file size
      };
      
      await expect(testDb.proposals.create(invalidProposal))
        .rejects.toThrow('Check constraint violation');
    });
  });
});
```

### End-to-End Testing

#### E2E Test Framework
```typescript
interface E2ETestConfig {
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  viewport: { width: number; height: number };
  baseURL: string;
  timeout: number;
  retries: number;
}

interface E2ETestSuite {
  name: string;
  tests: E2ETest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

interface E2ETest {
  name: string;
  steps: TestStep[];
  assertions: E2EAssertion[];
  cleanup?: () => Promise<void>;
}

const e2eConfig: E2ETestConfig = {
  browser: 'chromium',
  headless: true,
  viewport: { width: 1280, height: 720 },
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  retries: 2
};
```

#### User Journey Tests
```typescript
// Example E2E test using Playwright
describe('Proposal Analysis User Journey', () => {
  let page: Page;
  
  beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');
  });
  
  test('complete proposal analysis workflow', async () => {
    // Step 1: Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');
    
    // Verify login success
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Step 2: Upload proposal
    await page.click('[data-testid="upload-button"]');
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-files/sample-proposal.pdf');
    
    // Verify file selection
    await expect(page.locator('[data-testid="selected-file"]')).toContainText('sample-proposal.pdf');
    
    await page.click('[data-testid="start-upload"]');
    
    // Step 3: Monitor upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-status"]')).toContainText('Uploading');
    
    // Wait for upload completion
    await expect(page.locator('[data-testid="upload-status"]')).toContainText('Upload Complete', { timeout: 30000 });
    
    // Step 4: Start analysis
    await page.click('[data-testid="start-analysis"]');
    
    // Verify analysis initiation
    await expect(page.locator('[data-testid="analysis-status"]')).toContainText('Analysis Started');
    
    // Step 5: Monitor analysis progress
    await expect(page.locator('[data-testid="analysis-progress"]')).toBeVisible();
    
    // Wait for analysis completion (with longer timeout)
    await expect(page.locator('[data-testid="analysis-status"]')).toContainText('Analysis Complete', { timeout: 300000 });
    
    // Step 6: View results
    await page.click('[data-testid="view-results"]');
    
    // Verify results page
    await expect(page.locator('[data-testid="results-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="compliance-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="findings-list"]')).toBeVisible();
    
    // Verify specific result elements
    await expect(page.locator('[data-testid="overall-status"]')).toContainText(/pass|fail|warning/i);
    await expect(page.locator('[data-testid="findings-count"]')).toBeVisible();
    
    // Step 7: Download results (optional)
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-results"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/results.*\.pdf$/);
  });
  
  test('error handling for invalid file upload', async () => {
    await loginAsTestUser(page);
    
    await page.click('[data-testid="upload-button"]');
    
    // Upload invalid file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-files/invalid-file.txt');
    
    await page.click('[data-testid="start-upload"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid file type');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Only PDF, DOC, DOCX, and RTF files are allowed');
    
    // Verify upload didn't proceed
    await expect(page.locator('[data-testid="upload-progress"]')).not.toBeVisible();
  });
});
```

### Security Testing

#### Static Analysis Security Testing (SAST)
```typescript
interface SASTConfiguration {
  tools: SASTTool[];
  rules: SecurityRule[];
  excludePatterns: string[];
  reportFormat: 'json' | 'sarif' | 'xml';
}

interface SASTTool {
  name: string;
  command: string;
  configFile?: string;
  enabled: boolean;
}

interface SecurityRule {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  enabled: boolean;
}

const sastConfig: SASTConfiguration = {
  tools: [
    {
      name: 'ESLint Security',
      command: 'eslint --ext .ts,.tsx --config .eslintrc.security.js',
      configFile: '.eslintrc.security.js',
      enabled: true
    },
    {
      name: 'Semgrep',
      command: 'semgrep --config=auto --json',
      enabled: true
    }
  ],
  rules: [
    {
      id: 'no-hardcoded-secrets',
      severity: 'critical',
      category: 'secrets',
      description: 'Detect hardcoded secrets and API keys',
      enabled: true
    },
    {
      id: 'sql-injection',
      severity: 'high',
      category: 'injection',
      description: 'Detect potential SQL injection vulnerabilities',
      enabled: true
    }
  ],
  excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.test.ts'],
  reportFormat: 'sarif'
};
```

#### Authentication and Authorization Tests
```typescript
describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should prevent access without valid token', async () => {
      const response = await fetch('/api/proposals', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({
        error: { code: 'AUTHENTICATION_REQUIRED' }
      });
    });
    
    it('should enforce rate limiting on login attempts', async () => {
      const loginAttempts = Array(10).fill(null).map(() => 
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
        })
      );
      
      const responses = await Promise.all(loginAttempts);
      const lastResponse = responses[responses.length - 1];
      
      expect(lastResponse.status).toBe(429); // Too Many Requests
    });
  });
  
  describe('Authorization Security', () => {
    it('should prevent users from accessing other users data', async () => {
      const user1Token = await getTestUserToken('user1@example.com');
      const user2Token = await getTestUserToken('user2@example.com');
      
      // Create proposal as user1
      const createResponse = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user1Token}` },
        body: createTestFormData()
      });
      
      const { data: proposal } = await createResponse.json();
      
      // Try to access as user2
      const accessResponse = await fetch(`/api/proposals/${proposal.id}`, {
        headers: { 'Authorization': `Bearer ${user2Token}` }
      });
      
      expect(accessResponse.status).toBe(403); // Forbidden
    });
  });
});
```

### Performance Testing

#### Load Testing
```typescript
interface LoadTestConfig {
  scenarios: LoadScenario[];
  thresholds: PerformanceThreshold[];
  duration: string;
  rampUp: string;
}

interface LoadScenario {
  name: string;
  executor: 'constant-vus' | 'ramping-vus';
  vus: number;
  duration: string;
  requests: LoadTestRequest[];
}

interface LoadTestRequest {
  name: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  checks: PerformanceCheck[];
}

interface PerformanceCheck {
  name: string;
  condition: string;
  threshold: number;
}

// Example load test configuration
const loadTestConfig: LoadTestConfig = {
  scenarios: [
    {
      name: 'proposal_upload_load',
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      requests: [
        {
          name: 'upload_proposal',
          method: 'POST',
          url: '/api/proposals',
          checks: [
            { name: 'response_time', condition: 'p(95) < 2000', threshold: 2000 },
            { name: 'success_rate', condition: 'rate > 0.95', threshold: 0.95 }
          ]
        }
      ]
    }
  ],
  thresholds: [
    { name: 'http_req_duration', condition: 'p(95) < 2000', threshold: 2000 },
    { name: 'http_req_failed', condition: 'rate < 0.05', threshold: 0.05 }
  ],
  duration: '10m',
  rampUp: '2m'
};
```

## Test Data Management

### Test Data Generation
```typescript
interface TestDataGenerator {
  generateUser(overrides?: Partial<User>): User;
  generateProposal(overrides?: Partial<Proposal>): Proposal;
  generateAnalysisResult(overrides?: Partial<AnalysisResult>): AnalysisResult;
  generateTestFile(type: FileType, size?: number): File;
}

class TestDataFactory implements TestDataGenerator {
  generateUser(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      organization: faker.company.name(),
      createdAt: faker.date.past(),
      ...overrides
    };
  }
  
  generateProposal(overrides: Partial<Proposal> = {}): Proposal {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      filename: `${faker.system.fileName()}.pdf`,
      originalName: `${faker.lorem.words(3)}.pdf`,
      fileSize: faker.number.int({ min: 1000, max: 50000000 }),
      mimeType: 'application/pdf',
      status: faker.helpers.arrayElement(['uploaded', 'processing', 'analyzed']),
      uploadedAt: faker.date.recent(),
      ...overrides
    };
  }
  
  generateTestFile(type: FileType, size: number = 1024): File {
    const content = new Array(size).fill('a').join('');
    const mimeTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain'
    };
    
    return new File([content], `test.${type}`, { type: mimeTypes[type] });
  }
}
```

### Test Fixtures
```typescript
interface TestFixtures {
  users: User[];
  proposals: Proposal[];
  analysisResults: AnalysisResult[];
}

const testFixtures: TestFixtures = {
  users: [
    {
      id: 'user-1',
      email: 'contractor@example.com',
      name: 'John Contractor',
      organization: 'Defense Solutions Inc',
      status: 'active',
      createdAt: new Date('2024-01-01')
    }
  ],
  proposals: [
    {
      id: 'proposal-1',
      userId: 'user-1',
      filename: 'defense-proposal-2024.pdf',
      originalName: 'Defense Contract Proposal 2024.pdf',
      fileSize: 2048576,
      mimeType: 'application/pdf',
      status: 'analyzed',
      uploadedAt: new Date('2024-01-15')
    }
  ],
  analysisResults: [
    {
      id: 'result-1',
      analysisId: 'analysis-1',
      overallStatus: 'warning',
      summary: {
        totalFindings: 5,
        passCount: 3,
        failCount: 1,
        warningCount: 1,
        processingTime: 120000
      },
      findings: [],
      recommendations: []
    }
  ]
};
```

## CI/CD Integration

### Pipeline Configuration
```yaml
# Example GitHub Actions workflow
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:unit --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm playwright install
      
      - name: Start application
        run: pnpm dev &
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: pnpm test:e2e

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run dependency scan
        run: npm audit --audit-level moderate
      
      - name: Run SAST scan
        uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VALIDATE_TYPESCRIPT_ES: true
          VALIDATE_JAVASCRIPT_ES: true
```

## Test Reporting and Metrics

### Test Metrics
```typescript
interface TestMetrics {
  coverage: CoverageMetrics;
  performance: PerformanceMetrics;
  reliability: ReliabilityMetrics;
  security: SecurityMetrics;
}

interface CoverageMetrics {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
  threshold: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PerformanceMetrics {
  testExecutionTime: number;
  averageTestTime: number;
  slowestTests: TestPerformance[];
  parallelization: number;
}

interface ReliabilityMetrics {
  passRate: number;
  flakyTests: number;
  testStability: number;
  failureRate: number;
}

interface SecurityMetrics {
  vulnerabilitiesFound: number;
  criticalIssues: number;
  securityScore: number;
  complianceStatus: 'pass' | 'fail';
}
```

### Test Reporting
```typescript
interface TestReport {
  summary: TestSummary;
  suites: TestSuiteResult[];
  coverage: CoverageReport;
  performance: PerformanceReport;
  security: SecurityReport;
  timestamp: Date;
  duration: number;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  duration: number;
}

// Generate comprehensive test report
function generateTestReport(results: TestResult[]): TestReport {
  return {
    summary: calculateTestSummary(results),
    suites: groupTestResultsBySuite(results),
    coverage: generateCoverageReport(),
    performance: generatePerformanceReport(),
    security: generateSecurityReport(),
    timestamp: new Date(),
    duration: calculateTotalDuration(results)
  };
}
```