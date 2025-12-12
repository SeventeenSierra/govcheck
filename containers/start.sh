#!/bin/bash

# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Docker Compose startup script for Proposal Prepper
# This script provides a convenient way to start the application with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="proposal-prepper"
DETACHED=false
BUILD=false
PULL=false
CLEAN=false
CONTAINER_RUNTIME=""
COMPOSE_CMD=""

# Function to print colored output
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

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Start the Proposal Prepper application using Docker Compose.

OPTIONS:
    -e, --env ENVIRONMENT    Set environment (development|production) [default: development]
    -d, --detach            Run containers in detached mode
    -b, --build             Force rebuild of containers
    -p, --pull              Pull latest images before starting
    -c, --clean             Clean up containers and volumes before starting
    -h, --help              Show this help message

EXAMPLES:
    $0                      Start in development mode (foreground)
    $0 -d                   Start in development mode (background)
    $0 -e production -d     Start in production mode (background)
    $0 -b -d                Rebuild and start in background
    $0 -c -b -d             Clean, rebuild, and start in background

ENVIRONMENT FILES:
    The script will look for environment configuration in this order:
    1. containers/.env (if exists)
    2. containers/.env.template (as fallback)

SERVICES:
    - web (Next.js frontend on port 3000)
    - strands (Python API on port 8080)
    - postgres (Database on port 5432)
    - redis (Cache on port 6379)
    - minio (Object storage on ports 9000/9001)

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--detach)
            DETACHED=true
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -p|--pull)
            PULL=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be 'development' or 'production'"
    exit 1
fi

# Set compose files based on environment
if [[ "$ENVIRONMENT" == "development" ]]; then
    COMPOSE_FILE="docker-compose.yml:docker-compose.dev.yml"
elif [[ "$ENVIRONMENT" == "production" ]]; then
    COMPOSE_FILE="docker-compose.yml:docker-compose.prod.yml"
fi

# Detect container runtime
detect_container_runtime() {
    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
        CONTAINER_RUNTIME="docker"
        COMPOSE_CMD="docker-compose"
        print_status "Using Docker as container runtime"
    elif command -v podman >/dev/null 2>&1; then
        CONTAINER_RUNTIME="podman"
        if command -v podman-compose >/dev/null 2>&1; then
            COMPOSE_CMD="podman-compose"
        else
            COMPOSE_CMD="docker-compose"
            print_warning "podman-compose not found, using docker-compose (may need podman-docker package)"
        fi
        print_status "Using Podman as container runtime"
    else
        print_error "No container runtime found. Please install Docker or Podman."
        print_error "For Docker: Install Docker Desktop"
        print_error "For Podman: Run 'podman machine init && podman machine start'"
        exit 1
    fi
}

print_status "Starting Proposal Prepper in $ENVIRONMENT mode..."

# Change to containers directory
cd "$(dirname "$0")"

# Detect and configure container runtime
detect_container_runtime

# Check for environment file
if [[ -f ".env" ]]; then
    print_status "Using environment configuration from .env"
elif [[ -f ".env.template" ]]; then
    print_warning "No .env file found, using .env.template"
    print_warning "Consider copying .env.template to .env and customizing it"
    cp .env.template .env
else
    print_error "No environment configuration found"
    print_error "Please create .env file or ensure .env.template exists"
    exit 1
fi

# Check data persistence setup
print_status "Checking data persistence configuration..."
if [[ -f "data-manager.sh" ]]; then
    print_success "Data management tools available"
    print_status "Use './data-manager.sh backup' to create backups"
    print_status "Use './data-manager.sh test-persistence' to test data persistence"
else
    print_warning "Data management tools not found"
fi

# Clean up if requested
if [[ "$CLEAN" == true ]]; then
    print_status "Cleaning up existing containers and volumes..."
    $COMPOSE_CMD -f docker-compose.yml -f docker-compose.dev.yml -p "$PROJECT_NAME" down -v --remove-orphans || true
    if [[ "$CONTAINER_RUNTIME" == "docker" ]]; then
        docker system prune -f || true
    elif [[ "$CONTAINER_RUNTIME" == "podman" ]]; then
        podman system prune -f || true
    fi
    print_success "Cleanup completed"
fi

# Pull images if requested
if [[ "$PULL" == true ]]; then
    print_status "Pulling latest images..."
    $COMPOSE_CMD -f docker-compose.yml -p "$PROJECT_NAME" pull
    print_success "Images pulled"
fi

# Build containers if requested
if [[ "$BUILD" == true ]]; then
    print_status "Building containers..."
    IFS=':' read -ra COMPOSE_FILES <<< "$COMPOSE_FILE"
    COMPOSE_ARGS=""
    for file in "${COMPOSE_FILES[@]}"; do
        COMPOSE_ARGS="$COMPOSE_ARGS -f $file"
    done
    $COMPOSE_CMD $COMPOSE_ARGS -p "$PROJECT_NAME" build
    print_success "Containers built"
fi

# Prepare compose command with all files
FINAL_COMPOSE_CMD="$COMPOSE_CMD"
IFS=':' read -ra COMPOSE_FILES <<< "$COMPOSE_FILE"
for file in "${COMPOSE_FILES[@]}"; do
    FINAL_COMPOSE_CMD="$FINAL_COMPOSE_CMD -f $file"
done
FINAL_COMPOSE_CMD="$FINAL_COMPOSE_CMD -p $PROJECT_NAME"

# Start services
print_status "Starting services..."
if [[ "$DETACHED" == true ]]; then
    $FINAL_COMPOSE_CMD up -d
    print_success "Services started in detached mode"
    print_status "Application will be available at:"
    print_status "  - Web UI: http://localhost:3000"
    print_status "  - Strands API: http://localhost:8080"
    print_status "  - MinIO Console: http://localhost:9001"
    print_status ""
    print_status "To view logs: $COMPOSE_CMD -p $PROJECT_NAME logs -f"
    print_status "To stop: $COMPOSE_CMD -p $PROJECT_NAME down"
else
    print_status "Starting in foreground mode (Ctrl+C to stop)..."
    $FINAL_COMPOSE_CMD up
fi

print_success "Startup script completed"