# Infrastructure: Proposal Prepper (Contract Checker)

## Federated Mesh Architecture

### Service Architecture
The application uses a **microservice architecture** with the **Federated Mesh pattern** for vendor-neutral AI orchestration:

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Railway.app / Docker Compose Mesh                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐         ┌────────────────────────────┐   │
│  │   Web App (Next.js)  │────────▶│  Proposal Parser Service   │   │
│  │   Port: 3000         │  HTTP   │  (Python/FastAPI)          │   │
│  │                      │         │  Port: 8080                │   │
│  │  - Upload UI         │         │                            │   │
│  │  - Orchestration     │         │  - AWS Bedrock (Strands)   │   │
│  │  - Compliance Score  │         │  - Claude 3.5 Sonnet       │   │
│  │  - Report Viewer     │         │  - NSF PAPPG 23-1 SOP      │   │
│  └──────────────────────┘         └────────────────────────────┘   │
│           │                                                          │
│           └───────────────────────▶│  Genkit Service            │   │
│                            HTTP    │  (Node.js/Google Genkit)   │   │
│                                    │  Port: 8081                │   │
│                                    │                            │   │
│                                    │  - Document Ingestion      │   │
│                                    │  - Gemini 1.5 Pro          │   │
│                                    └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack by Service

#### Next.js Web App (Port 3000)
- **Next.js 16**: Latest App Router with enhanced server components
- **React 19**: Concurrent features and improved server component support
- **TypeScript 5.8+**: Strict mode with `noUncheckedIndexedAccess`
- **Tailwind CSS v4**: Next-generation CSS engine with native cascade layers
- **Storybook 10**: Component documentation with React 19 support

#### Proposal Parser Service (Port 8080)
- **Python 3.11+**: Modern Python with type hints
- **FastAPI**: High-performance async web framework
- **AWS Bedrock SDK**: Integration with Claude models via boto3
- **Claude 3.5 Sonnet**: Powerful model for complex compliance analysis
- **Pydantic**: Data validation and settings management

#### Genkit Service (Port 8081)
- **Node.js 20+**: JavaScript runtime
- **Google Genkit**: AI framework for flows and prompts
- **Gemini 1.5 Pro**: Fast parsing with large context window (1M tokens)
- **TypeScript**: Type-safe development

#### Semantic Kernel Service (Port 8082) - Future
- **C#/.NET 8** or **Python**: Multi-agent orchestration framework
- **Autogen Integration**: Advanced routing and agent coordination

### Shared Package Dependencies
- **@aatb/ui**: Shared UI component library
- **@aatb/lib**: Core utilities and helper functions
- **Radix UI**: Accessible component primitives
- **Lucide React**: Consistent iconography

### AI Integration Architecture
- **Provider Abstraction**: Supports both Genkit (in-process) and Strands (HTTP) providers
- **Genkit Integration**: Google's AI framework for flow definitions and prompt management
- **Future Strands Support**: Python FastAPI service with multi-agent workflows
- **Traffic Cop Pattern**: Next.js API routes route between AI providers

### Development Tools

#### Component Development
- **Storybook 10**: Component library with 34 UI component stories
- **Chromatic Integration**: Visual testing and component documentation
- **Component-driven development**: Isolated component building

#### Testing Infrastructure
- **Playwright**: End-to-end testing framework with responsive tests
- **Vitest**: Unit testing with workspace configuration
- **Test Coverage**: Comprehensive testing strategy across packages

#### Code Quality & Security
- **Biome**: Unified linting and formatting (replaced ESLint + Prettier ecosystem)
- **TypeScript**: Static type checking with strict configuration
- **pnpm audit**: Automated security scanning with severity-based CI policies
- **Package Health Metrics**: Evaluation criteria for new dependencies

### Build & Deployment

#### Build System
- **Next.js Build**: Optimized production builds with `output: 'standalone'`
- **Vite**: Build system for shared packages with external peer dependencies
- **Bundle Optimization**: Code splitting, tree shaking, and peer dependency externalization

#### Development Server
- **Hot Module Replacement**: Fast development iteration
- **TypeScript Compilation**: Real-time type checking across workspace
- **CSS Processing**: Live Tailwind compilation with CSS custom properties

#### Container Support
- **Standalone Output**: Smaller Docker images with fast cold starts
- **Multi-stage Builds**: Optimized container builds
- **Environment Configuration**: Proper secret management (no .env sync via Copybara)

### Performance Optimization

#### Frontend Performance
- **Code Splitting**: Automatic route-based splitting
- **Image Security**: No external image hosts (placehold.co, unsplash removed)
- **Font Optimization**: Next.js Font optimization with Inter font family

#### Accessibility
- **WCAG 2.1 AA Compliance**: Web accessibility standards
- **Semantic HTML**: Proper HTML structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Form UX**: Fixed FormLabel styling (labels stay neutral, only FormMessage shows errors)

### Monitoring & Security

#### Security Patterns
- **Supply Chain Security**: Package health evaluation and license compliance
- **Dependency Auditing**: Automated `pnpm audit` with HIGH/MEDIUM/LOW severity by branch
- **License Compliance**: MIT, ISC, Apache-2.0, BSD only policy
- **Third-party Documentation**: `LICENSE-THIRD-PARTY.md` in published packages

#### Performance Monitoring
- **Core Web Vitals**: Performance tracking and optimization
- **Error Tracking**: Runtime error monitoring
- **Build Performance**: Bundle size reporting and optimization

## Configuration Files

### Core Configuration
- `next.config.ts`: Next.js with standalone output, no external images
- `tsconfig.json`: Extends `@17sierra/config` with ES2022 target
- `tailwind.config.ts`: CSS custom properties theming with app-specific overrides
- `biome.json`: Unified linting/formatting with scoped overrides for shadcn components

### Development Configuration
- `playwright.config.ts`: E2E testing with app, navigation, and responsive tests
- `vitest.config.ts`: Unit testing configuration
- `vitest.workspace.yaml`: Monorepo test workspace configuration
- `.storybook/`: Component documentation and visual testing

### Build Configuration
- `postcss.config.mjs`: PostCSS processing for Tailwind CSS 4
- `package.json`: pnpm 10.24.0 with workspace dependencies
- `vite.config.ts`: Package build configuration with peer dependency externalization

### AI Configuration
- `src/ai/provider.ts`: AI provider configuration using `@17sierra/ai-flows`
- `src/ai/dev.ts`: Optional Genkit development server

## Architecture Decisions

### Tooling Standardization (Session 04)
- **Decision**: Standardize on Biome everywhere, remove ESLint + Prettier
- **Rationale**: Single tool for lint + format, fewer dependencies, consistent experience
- **Impact**: Removed 5+ ESLint packages, unified configuration

### Dependency Strategy (Session 03)
- **UI Components**: `peerDependencies` with `optional: true` for Radix packages
- **Shared Utilities**: Bundle `clsx` and `tailwind-merge` directly in `@17sierra/lib`
- **Package Health**: Evaluate every dependency against health metrics

### AI Provider Abstraction (Session 07)
- **Decision**: Thin abstraction layer supporting multiple AI providers
- **Current**: Genkit (in-process) for development
- **Future**: Strands (HTTP) for production multi-agent workflows
- **Pattern**: Traffic Cop routing in Next.js API routes

### Security & Compliance
- **Package Auditing**: Automated `pnpm audit` with branch-based severity levels
- **License Policy**: Restrict to MIT, ISC, Apache-2.0, BSD licenses only
- **Image Security**: Remove external image hosts, use local assets only
- **Secret Detection**: Gitleaks integration for credential scanning
- **AI Autonomy Zones**: 5-level trust system (Zone 0-4) for AI modification permissions
- **Branch Protection**: Progressive security gates from dev to production
- **Vulnerability Response**: Automated Renovate with critical CVE auto-merge

### Development Environment
- **Nix Flakes**: Reproducible development environment with Node.js 20+, pnpm 10
- **Biome 2.3.8**: Unified linting and formatting (modern alternative to ESLint + Prettier)
- **Husky + Commitlint**: Conventional commit enforcement with pre-commit hooks
- **pnpm**: Fast, efficient package manager with strict dependency resolution
- **Environment Variables**: Secure configuration management with .env files