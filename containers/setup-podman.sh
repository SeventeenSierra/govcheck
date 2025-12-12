#!/bin/bash

# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Podman setup script for Proposal Prepper
# This script helps initialize Podman for container development

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

print_status "Setting up Podman for Proposal Prepper..."

# Check if Podman is available
if ! command -v podman >/dev/null 2>&1; then
    print_error "Podman is not installed or not in PATH"
    print_error "Please ensure Podman is available in your Nix environment"
    exit 1
fi

print_success "Podman found: $(podman --version)"

# Check if Podman machine exists
if podman machine list | grep -q "podman-machine-default"; then
    print_status "Podman machine already exists"
    
    # Check if it's running
    if podman machine list | grep "podman-machine-default" | grep -q "Running"; then
        print_success "Podman machine is already running"
    else
        print_status "Starting Podman machine..."
        podman machine start
        print_success "Podman machine started"
    fi
else
    print_status "Initializing Podman machine..."
    podman machine init
    print_success "Podman machine initialized"
    
    print_status "Starting Podman machine..."
    podman machine start
    print_success "Podman machine started"
fi

# Test Podman connectivity
print_status "Testing Podman connectivity..."
if podman info >/dev/null 2>&1; then
    print_success "Podman is working correctly"
else
    print_error "Podman connectivity test failed"
    print_error "Try running: podman machine restart"
    exit 1
fi

# Check for podman-compose
if command -v podman-compose >/dev/null 2>&1; then
    print_success "podman-compose found: $(podman-compose --version)"
else
    print_warning "podman-compose not found"
    print_warning "The start script will use docker-compose with Podman"
    print_warning "This should work but podman-compose is recommended"
fi

print_success "Podman setup completed!"
print_status "You can now run: ./start.sh -d"