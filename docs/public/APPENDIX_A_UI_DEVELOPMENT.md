# Appendix A: User Interface Development

## Overview

The GovCheck web interface represents a modern, accessible, and enterprise-grade user experience for Federal Compliance compliance validation. Built with Next.js 16 and React 19, the interface prioritizes usability, performance, and compliance with federal accessibility standards (Section 508/WCAG 2.1 AA).

## Technology Stack

### Core Framework
- **Next.js 16** (App Router): Server-side rendering, route optimization, and modern React patterns
- **React 19**: Latest features including improved server components and concurrent rendering
- **TypeScript 5.9**: Type-safe development with strict compiler checks

### UI Component System
- **Shadcn/UI**: Radix UI primitives with accessible, composable components
- **@17sierra/ui**: Custom enterprise component library engineered for reusability across microservices
- **Tailwind CSS v4**: Utility-first styling with design system tokens

### State Management & Data Fetching
- **React Hook Form 7**: Performant form management with validation
- **Zod 4**: Schema validation for API contracts and form inputs
- **Native fetch API**: Simplified data fetching with Next.js integration

### Development Infrastructure
- **Biome**: Fast linting and formatting for consistent code quality
- **Vitest**: Unit testing framework with Vite integration
- **Playwright**: End-to-end testing and accessibility audits
- **Storybook 10**: Component-driven development and visual testing

## Architecture

### Service Integration
The web interface is designed to operate as part of a larger system, communicating with compliance analysis services.

```
┌─────────────────────────────────────┐
│         Web Interface               │
│         (Next.js App)               │
│                                     │
│  ┌──────────┐      ┌─────────────┐│
│  │  Pages & │◄─────┤  API Routes ││
│  │  Router  │      │  (Proxy)    ││
│  └──────────┘      └──────┬──────┘│
│       ▲                    │       │
│       │                    ▼       │
│  ┌────┴──────┐      ┌─────────────┐│
│  │ Components│      │   Services  ││
│  │  (@17sierra/ui) ││
│  └───────────┘      └─────────────┘│
└──────────────────────┬──────────────┘
                       │
                       │ HTTP REST
                       ▼
          ┌─────────────────────────┐
          │   Compliance Service    │
          │   (External API)        │
          │                         │
          └─────────────────────────┘
```

### Directory Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── analyses/        # Analysis list and detail pages
│   │   └── settings/        # User settings
│   ├── api/                 # Next.js API routes (proxy to Strands)
│   │   ├── health/          # Service health check
│   │   ├── analysis/        # Analysis management endpoints
│   │   └── upload/          # Document upload handler
│   └── layout.tsx           # Root layout with providers
│
├── components/              # Application-specific components
│   ├── analysis/           # Compliance analysis UI
│   │   ├── ComplianceCard.tsx
│   │   ├── ResultsViewer.tsx
│   │   └── StatusIndicator.tsx
│   ├── documents/          # Document management
│   │   ├── DocumentUploader.tsx
│   │   ├── DocumentList.tsx
│   │   └── PDFViewer.tsx
│   └── dashboard/          # Dashboard widgets
│       ├── StatsCards.tsx
│       ├── RecentAnalyses.tsx
│       └── ActivityChart.tsx
│
├── services/               # API client services
│   ├── strands-api-client.ts      # Typed API client
│   ├── strands-api-client.test.ts # API client tests
│   └── upload-service.ts          # File upload utilities
│
├── types/                  # TypeScript type definitions
│   ├── analysis.ts        # Analysis-related types
│   ├── document.ts        # Document types
│   └── api-responses.ts   # API response types
│
└── lib/                   # Shared utilities
    ├── utils.ts           # General utilities
    ├── api-client.ts      # Base API client
    └── validation.ts      # Form validation schemas
```

## Key Features

### 1. Document Upload & Management

**Component**: `DocumentUploader.tsx`

- **Drag-and-drop interface**: Intuitive file selection with visual feedback
- **Format validation**: PDF-only with client-side MIME type checking
- **Size limits**: 50MB maximum per document with progress indicators
- **Multi-file support**: Queue multiple documents for batch processing
- **Upload progress**: Real-time progress bars with cancellation capability

**Technical Implementation**:
```typescript
// File validation with type safety
const validateDocument = (file: File): ValidationResult => {
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are accepted' };
  }
  if (file.size > 50 * 1024 * 1024) {
    return { valid: false, error: 'File size must be under 50MB' };
  }
  return { valid: true };
};

// Upload with progress tracking
const uploadToMinIO = async (file: File, onProgress: (percent: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // Progress tracking via XHR wrapper
  });
  
  const { s3_key, document_id } = await response.json();
  return { s3_key, document_id };
};
```

### 2. Real-Time Analysis Progress

**Component**: `AnalysisProgress.tsx`

- **Status polling**: 5-second interval polling with exponential backoff
- **Progress visualization**: Animated progress bars with percentage display
- **Stage indicators**: Visual representation of processing stages
  - Queued → Extracting → Analyzing → Completed
- **Estimated completion**: Dynamic time estimates based on queue position

**Technical Implementation**:
```typescript
const useAnalysisStatus = (sessionId: string) => {
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/analysis/${sessionId}/status`);
        const data = await response.json();
        setStatus(data);
        
        // Stop polling when complete or failed
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Status poll failed:', error);
      }
    };
    
    intervalId = setInterval(pollStatus, 5000);
    pollStatus(); // Initial poll
    
    return () => clearInterval(intervalId);
  }, [sessionId]);
  
  return status;
};
```

### 3. Compliance Results Display

**Component**: `ComplianceResults.tsx`

- **Executive summary**: High-level pass/fail status with overall score
- **Issue categorization**: Grouped by severity (Critical, Warning, Info)
- **Detailed findings**: Expandable cards with:
  - Regulation references (FAR, DFARS, Federal Compliance)
  - Document location (page, section, line)
  - Issue description and context
  - Remediation recommendations
  - AI confidence scores
- **Export capabilities**: PDF report generation, JSON download
- **Filtering & search**: Filter by severity, regulation type, keyword search

**Data Display Example**:
```typescript
type ComplianceResultsProps = {
  results: ComplianceResults;
};

export function ComplianceResults({ results }: ComplianceResultsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary</CardTitle>
          <Badge variant={results.status === 'pass' ? 'success' : 'destructive'}>
            {results.status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <StatCard 
              label="Overall Score" 
              value={`${results.summary.overall_score}/100`}
              variant={results.summary.overall_score >= 80 ? 'success' : 'warning'}
            />
            <StatCard 
              label="Critical Issues" 
              value={results.summary.critical_count}
              variant="destructive"
            />
            <StatCard 
              label="Warnings" 
              value={results.summary.warning_count}
              variant="warning"
            />
            <StatCard 
              label="Info" 
              value={results.summary.info_count}
              variant="info"
            />
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {results.issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
```

### 4. Dashboard Overview

**Page**: `/dashboard`

- **Recent analyses**: List of recent compliance checks with status
- **Analytics**: Charts showing trends over time (Recharts integration)
- **Quick actions**: One-click access to common tasks
- **System health**: Real-time health check of all services

### 5. Accessibility Features

**WCAG 2.1 AA Compliance**:
- **Keyboard navigation**: Full keyboard support for all interactions
- **Screen reader support**: ARIA labels, roles, and live regions
- **Color contrast**: 4.5:1 minimum contrast ratios throughout
- **Focus management**: Visible focus indicators and logical tab order
- **Skip links**: Skip to main content navigation
- **Semantic HTML**: Proper heading hierarchy and landmark regions

**Automated Testing**:
```typescript
// Playwright accessibility testing
test('Compliance results are accessible', async ({ page }) => {
  await page.goto('/analyses/test-session-id');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Performance Optimizations

### Code Splitting
- **Dynamic imports**: Route-based code splitting via Next.js
- **Component lazy loading**: Heavy components loaded on demand
- **Bundle analysis**: Regular monitoring with `@next/bundle-analyzer`

### Data Management
- **Optimistic UI updates**: Immediate feedback before server confirmation
- **Request deduplication**: Prevent duplicate API calls
- **Caching strategy**: Stale-while-revalidate for analysis results

### Image Optimization
- **Next.js Image**: Automatic image optimization and lazy loading
- **WebP format**: Modern image formats with fallbacks
- **Responsive images**: Appropriate sizes for different viewports

## Design System

### Color Palette
The interface uses Tailwind CSS v4 with a custom theme optimized for government applications:

```css
/* Design tokens */
@theme {
  --color-primary: #1e40af;        /* Government blue */
  --color-success: #16a34a;        /* Compliant green */
  --color-warning: #ea580c;        /* Warning orange */
  --color-critical: #dc2626;       /* Critical red */
  --color-neutral: #64748b;        /* Slate gray */
}
```

### Typography
- **Font families**: 
  - Headings: `Inter` (Google Fonts)
  - Body: `system-ui` stack for optimal performance
- **Scale**: Modular scale with clear hierarchy (h1-h6)
- **Line height**: 1.5 for body text, 1.2 for headings

### Spacing System
- **Base unit**: 4px (`0.25rem`)
- **Scale**: 0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64

## Testing Strategy

### Unit Tests (Vitest)
- Component rendering and logic
- Utility function validation
- Service layer mocking

### Integration Tests (Vitest + Testing Library)
- User interaction flows
- Form submission and validation
- API integration with mock responses

### End-to-End Tests (Playwright)
- Complete user journeys
- Multi-page workflows
- Cross-browser compatibility
- Accessibility validation

**Test Coverage Targets**:
- Unit tests: \u003e85% code coverage
- Integration tests: All critical user paths
- E2E tests: Happy path + error scenarios

## Deployment Configuration

### Environment Configuration
```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_ENV=development
```

## Security Considerations

### Content Security Policy
```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
`;
```

### Authentication (Future)
- JWT token-based authentication
- Secure HTTP-only cookies
- CSRF protection via SameSite cookies

### Data Validation
- Client-side validation with Zod schemas
- Server-side validation in API routes
- XSS protection via React automatic escaping

## Future Enhancements

### Planned Features
1. **Real-time updates**: WebSocket/SSE for live progress
2. **Batch analysis**: Process multiple documents simultaneously
3. **Custom compliance rules**: User-defined validation criteria
4. **Comparison view**: Side-by-side proposal comparison
5. **Audit trail**: Detailed change history and user actions
6. **Collaborative review**: Multi-user annotation and comments
7. **Mobile experience**: Progressive Web App (PWA) capabilities

### Technical Roadmap
- **Performance**: Server-side caching with Redis
- **Offline support**: Service workers for offline functionality
- **i18n**: Internationalization for multi-language support
- **Analytics**: User behavior tracking with privacy-first approach

## Developer Experience

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Run Storybook for component development
pnpm storybook

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint
pnpm format
```

### Component Development Workflow
1. Create component in Storybook with stories
2. Write unit tests for component logic
3. Integrate component into application
4. Add E2E tests for user flows
5. Document component usage and props

## Metrics & Monitoring

### Performance Metrics
- **First Contentful Paint (FCP)**: Target \u003c 1.5s
- **Largest Contentful Paint (LCP)**: Target \u003c 2.5s
- **Time to Interactive (TTI)**: Target \u003c 3.5s
- **Cumulative Layout Shift (CLS)**: Target \u003c 0.1

### User Experience Metrics
- **Task completion rate**: Percentage of successful analyses
- **Error rate**: Failed analyses / total analyses
- **User satisfaction**: Post-analysis feedback scores

## Conclusion

The GovCheck web interface delivers an enterprise-grade user experience that balances usability, accessibility, and performance. Built on modern web technologies and design principles, the interface provides government users with an efficient tool for ensuring Federal Compliance compliance while maintaining the highest standards of code quality and user experience.

The modular architecture and comprehensive testing strategy ensure maintainability and extensibility, positioning the application for future enhancements and scaling to support additional compliance frameworks beyond Federal Compliance.
