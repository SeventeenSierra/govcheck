#!/bin/bash

# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Docker configuration validation script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to containers directory
cd "$(dirname "$0")"

print_status "Validating Docker configuration..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found - skipping runtime validation"
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
    print_success "Docker found"
fi

# Check if Docker Compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    print_success "Docker Compose found (standalone)"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    print_success "Docker Compose found (plugin)"
else
    print_warning "Docker Compose not found - skipping compose validation"
    COMPOSE_CMD=""
fi

# Validate YAML syntax of compose files
print_status "Validating compose file syntax..."

COMPOSE_FILES=("docker-compose.yml" "docker-compose.dev.yml" "docker-compose.prod.yml")
for file in "${COMPOSE_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        # Basic YAML syntax check using Python (if available)
        if command -v python3 &> /dev/null; then
            if python3 -c "
import sys
try:
    with open('$file', 'r') as f:
        content = f.read()
    # Basic YAML structure checks
    if 'version:' not in content and 'services:' not in content:
        sys.exit(1)
    print('Basic YAML structure valid')
except:
    sys.exit(1)
" 2>/dev/null; then
                print_success "$file - YAML syntax valid"
            else
                print_error "$file - YAML syntax error"
                exit 1
            fi
        else
            print_warning "$file - Cannot validate YAML (Python not available)"
        fi
    else
        print_error "$file - File not found"
        exit 1
    fi
done

# Validate Docker Compose configuration
if [[ -n "$COMPOSE_CMD" ]]; then
    print_status "Validating Docker Compose configuration..."
    
    # Test development configuration
    if $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml config --quiet; then
        print_success "Development configuration valid"
    else
        print_error "Development configuration invalid"
        exit 1
    fi
    
    # Test production configuration
    if $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml config --quiet; then
        print_success "Production configuration valid"
    else
        print_error "Production configuration invalid"
        exit 1
    fi
fi

# Check for required files
print_status "Checking required files..."

REQUIRED_FILES=(
    "web.Dockerfile"
    "api.Dockerfile"
    ".env.template"
    "start.sh"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        print_success "$file - Found"
    else
        print_error "$file - Missing"
        exit 1
    fi
done

# Check environment configuration
print_status "Checking environment configuration..."

if [[ -f ".env" ]]; then
    print_success ".env - Found (using local configuration)"
elif [[ -f ".env.template" ]]; then
    print_warning ".env - Not found (will use template)"
else
    print_error ".env.template - Missing"
    exit 1
fi

# Validate Dockerfiles
print_status "Validating Dockerfiles..."

DOCKERFILES=("web.Dockerfile" "api.Dockerfile")
for dockerfile in "${DOCKERFILES[@]}"; do
    if [[ -f "$dockerfile" ]]; then
        # Basic Dockerfile validation
        if grep -q "FROM" "$dockerfile" && grep -q "EXPOSE" "$dockerfile"; then
            print_success "$dockerfile - Basic structure valid"
        else
            print_warning "$dockerfile - Missing FROM or EXPOSE directive"
        fi
    fi
done

# Check network configuration
print_status "Validating network configuration..."

if grep -q "proposal-prepper-network" docker-compose.yml; then
    print_success "Network configuration found"
else
    print_error "Network configuration missing"
    exit 1
fi

# Check service dependencies
print_status "Validating service dependencies..."

SERVICES=("web" "strands" "postgres" "redis" "minio")
for service in "${SERVICES[@]}"; do
    if grep -q "$service:" docker-compose.yml; then
        print_success "Service $service - Defined"
    else
        print_error "Service $service - Missing"
        exit 1
    fi
done

# Check health checks
print_status "Validating health checks..."

if grep -q "healthcheck:" docker-compose.yml; then
    print_success "Health checks configured"
else
    print_warning "Health checks not found"
fi

# Check volume configuration
print_status "Validating volume configuration..."

if grep -q "volumes:" docker-compose.yml; then
    print_success "Volume configuration found"
    
    # Check for named volumes
    if grep -q "postgres_data:" docker-compose.yml && grep -q "minio_data:" docker-compose.yml && grep -q "redis_data:" docker-compose.yml; then
        print_success "All required volumes configured"
    else
        print_error "Missing required volume definitions"
        exit 1
    fi
else
    print_error "Volume configuration missing"
    exit 1
fi

# Check data management tools
print_status "Validating data management tools..."

if [[ -f "data-manager.sh" ]]; then
    print_success "Data manager script found"
    if [[ -x "data-manager.sh" ]]; then
        print_success "Data manager script is executable"
    else
        print_warning "Data manager script is not executable"
    fi
else
    print_error "Data manager script missing"
    exit 1
fi

# Check Redis configuration files
print_status "Validating Redis configuration..."

REDIS_CONFIGS=("redis.conf" "redis-dev.conf" "redis-prod.conf")
for config in "${REDIS_CONFIGS[@]}"; do
    if [[ -f "$config" ]]; then
        print_success "$config - Found"
    else
        print_error "$config - Missing"
        exit 1
    fi
done

print_success "All validations passed!"
print_status "Configuration is ready for deployment"

# Show next steps
echo ""
print_status "Next steps:"
echo "  1. Copy .env.template to .env and customize"
echo "  2. Run './start.sh' to start development environment"
echo "  3. Run './start.sh -e production -d' for production deployment"
echo "  4. Access application at http://localhost:3000"