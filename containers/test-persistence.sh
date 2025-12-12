#!/bin/bash

# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Comprehensive data persistence testing script
# Tests that all data persists correctly across container restarts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-proposal-prepper}"
TEST_TIMEOUT=120
POSTGRES_READY_TIMEOUT=60
REDIS_READY_TIMEOUT=30
MINIO_READY_TIMEOUT=30

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

# Function to wait for service to be ready
wait_for_service() {
    local service="$1"
    local timeout="$2"
    local count=0
    
    print_status "Waiting for $service to be ready (timeout: ${timeout}s)..."
    
    while [[ $count -lt $timeout ]]; do
        if docker-compose -p "$PROJECT_NAME" exec -T "$service" echo "ready" &>/dev/null; then
            print_success "$service is ready"
            return 0
        fi
        sleep 2
        ((count += 2))
    done
    
    print_error "$service failed to become ready within ${timeout}s"
    return 1
}

# Function to wait for PostgreSQL specifically
wait_for_postgres() {
    local timeout="$1"
    local count=0
    
    print_status "Waiting for PostgreSQL to be ready (timeout: ${timeout}s)..."
    
    while [[ $count -lt $timeout ]]; do
        if docker-compose -p "$PROJECT_NAME" exec -T postgres pg_isready -U postgres -d proposal_prepper &>/dev/null; then
            print_success "PostgreSQL is ready"
            return 0
        fi
        sleep 2
        ((count += 2))
    done
    
    print_error "PostgreSQL failed to become ready within ${timeout}s"
    return 1
}

# Function to test PostgreSQL persistence
test_postgres_persistence() {
    local test_id="$1"
    
    print_status "Testing PostgreSQL data persistence..."
    
    # Create test table and insert data
    docker-compose -p "$PROJECT_NAME" exec -T postgres psql -U postgres -d proposal_prepper -c "
        CREATE TABLE IF NOT EXISTS persistence_test (
            id VARCHAR(50) PRIMARY KEY,
            test_data TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        INSERT INTO persistence_test (id, test_data) VALUES ('$test_id', 'PostgreSQL persistence test data');
    " || {
        print_error "Failed to create PostgreSQL test data"
        return 1
    }
    
    print_success "PostgreSQL test data created"
    return 0
}

# Function to verify PostgreSQL persistence
verify_postgres_persistence() {
    local test_id="$1"
    
    print_status "Verifying PostgreSQL data persistence..."
    
    local result=$(docker-compose -p "$PROJECT_NAME" exec -T postgres psql -U postgres -d proposal_prepper -t -c "
        SELECT test_data FROM persistence_test WHERE id = '$test_id';
    " 2>/dev/null | tr -d ' \n' || echo "")
    
    if [[ "$result" == "PostgreSQLpersistencetestdata" ]]; then
        print_success "PostgreSQL data persisted correctly"
        return 0
    else
        print_error "PostgreSQL data persistence failed (got: '$result')"
        return 1
    fi
}

# Function to test Redis persistence
test_redis_persistence() {
    local test_id="$1"
    
    print_status "Testing Redis data persistence..."
    
    # Set test data in Redis
    docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli SET "test:$test_id" "Redis persistence test data" || {
        print_error "Failed to create Redis test data"
        return 1
    }
    
    # Set additional test data with expiration
    docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli SETEX "test:${test_id}:temp" 3600 "Temporary Redis data" || {
        print_error "Failed to create Redis temporary test data"
        return 1
    }
    
    print_success "Redis test data created"
    return 0
}

# Function to verify Redis persistence
verify_redis_persistence() {
    local test_id="$1"
    
    print_status "Verifying Redis data persistence..."
    
    local result=$(docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli GET "test:$test_id" 2>/dev/null || echo "")
    
    if [[ "$result" == "Redis persistence test data" ]]; then
        print_success "Redis data persisted correctly"
        
        # Check temporary data
        local temp_result=$(docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli GET "test:${test_id}:temp" 2>/dev/null || echo "")
        if [[ "$temp_result" == "Temporary Redis data" ]]; then
            print_success "Redis temporary data also persisted correctly"
        else
            print_warning "Redis temporary data not found (this may be expected if TTL expired)"
        fi
        
        return 0
    else
        print_error "Redis data persistence failed (got: '$result')"
        return 1
    fi
}

# Function to test MinIO persistence
test_minio_persistence() {
    local test_id="$1"
    
    print_status "Testing MinIO data persistence..."
    
    # Create a test file in MinIO
    local test_content="MinIO persistence test data - $test_id"
    
    # Wait for MinIO to be ready
    local count=0
    while [[ $count -lt $MINIO_READY_TIMEOUT ]]; do
        if docker-compose -p "$PROJECT_NAME" exec -T minio mc --version &>/dev/null; then
            break
        fi
        sleep 2
        ((count += 2))
    done
    
    # Create test bucket and file
    docker-compose -p "$PROJECT_NAME" exec -T minio sh -c "
        mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null || true
        mc mb local/test-bucket 2>/dev/null || true
        echo '$test_content' | mc pipe local/test-bucket/test-file-$test_id.txt
    " || {
        print_error "Failed to create MinIO test data"
        return 1
    }
    
    print_success "MinIO test data created"
    return 0
}

# Function to verify MinIO persistence
verify_minio_persistence() {
    local test_id="$1"
    
    print_status "Verifying MinIO data persistence..."
    
    local expected_content="MinIO persistence test data - $test_id"
    local result=$(docker-compose -p "$PROJECT_NAME" exec -T minio sh -c "
        mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null
        mc cat local/test-bucket/test-file-$test_id.txt 2>/dev/null
    " || echo "")
    
    if [[ "$result" == "$expected_content" ]]; then
        print_success "MinIO data persisted correctly"
        return 0
    else
        print_error "MinIO data persistence failed (got: '$result')"
        return 1
    fi
}

# Function to cleanup test data
cleanup_test_data() {
    local test_id="$1"
    
    print_status "Cleaning up test data..."
    
    # Cleanup PostgreSQL
    docker-compose -p "$PROJECT_NAME" exec -T postgres psql -U postgres -d proposal_prepper -c "
        DELETE FROM persistence_test WHERE id = '$test_id';
    " 2>/dev/null || true
    
    # Cleanup Redis
    docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli DEL "test:$test_id" "test:${test_id}:temp" 2>/dev/null || true
    
    # Cleanup MinIO
    docker-compose -p "$PROJECT_NAME" exec -T minio sh -c "
        mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null
        mc rm local/test-bucket/test-file-$test_id.txt 2>/dev/null || true
    " || true
    
    print_success "Test data cleanup completed"
}

# Main test function
run_persistence_test() {
    local test_id="persistence_test_$(date +%s)"
    local failed_tests=0
    
    print_status "Starting comprehensive data persistence test..."
    print_status "Test ID: $test_id"
    
    # Ensure services are running
    print_status "Starting services..."
    docker-compose -p "$PROJECT_NAME" up -d
    
    # Wait for all services to be ready
    wait_for_postgres "$POSTGRES_READY_TIMEOUT" || ((failed_tests++))
    wait_for_service "redis" "$REDIS_READY_TIMEOUT" || ((failed_tests++))
    wait_for_service "minio" "$MINIO_READY_TIMEOUT" || ((failed_tests++))
    
    if [[ $failed_tests -gt 0 ]]; then
        print_error "Some services failed to start. Aborting test."
        exit 1
    fi
    
    # Create test data in all services
    test_postgres_persistence "$test_id" || ((failed_tests++))
    test_redis_persistence "$test_id" || ((failed_tests++))
    test_minio_persistence "$test_id" || ((failed_tests++))
    
    if [[ $failed_tests -gt 0 ]]; then
        print_error "Failed to create test data in some services"
        cleanup_test_data "$test_id"
        exit 1
    fi
    
    print_success "Test data created in all services"
    
    # Stop all services
    print_status "Stopping all services to test persistence..."
    docker-compose -p "$PROJECT_NAME" down
    
    # Wait a moment
    sleep 5
    
    # Restart services
    print_status "Restarting services..."
    docker-compose -p "$PROJECT_NAME" up -d
    
    # Wait for services to be ready again
    wait_for_postgres "$POSTGRES_READY_TIMEOUT" || ((failed_tests++))
    wait_for_service "redis" "$REDIS_READY_TIMEOUT" || ((failed_tests++))
    wait_for_service "minio" "$MINIO_READY_TIMEOUT" || ((failed_tests++))
    
    if [[ $failed_tests -gt 0 ]]; then
        print_error "Some services failed to restart. Test inconclusive."
        exit 1
    fi
    
    # Verify data persistence
    verify_postgres_persistence "$test_id" || ((failed_tests++))
    verify_redis_persistence "$test_id" || ((failed_tests++))
    verify_minio_persistence "$test_id" || ((failed_tests++))
    
    # Cleanup
    cleanup_test_data "$test_id"
    
    # Report results
    if [[ $failed_tests -eq 0 ]]; then
        print_success "All persistence tests passed! Data persists correctly across container restarts."
        return 0
    else
        print_error "$failed_tests persistence test(s) failed"
        return 1
    fi
}

# Change to containers directory
cd "$(dirname "$0")"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Run the test
run_persistence_test