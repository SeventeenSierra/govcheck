#!/bin/bash

# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Data management script for Proposal Prepper
# Handles backup, restore, and data persistence operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="${COMPOSE_PROJECT_NAME:-proposal-prepper}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

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
Usage: $0 <command> [options]

Data management commands for Proposal Prepper Docker deployment.

COMMANDS:
    backup              Create backup of all persistent data
    restore <backup>    Restore from backup file
    list-backups        List available backups
    test-persistence    Test data persistence across container restarts
    cleanup             Clean up old backups
    volumes             Show volume information
    export              Export volumes to tar files
    import <file>       Import volumes from tar files

OPTIONS:
    -p, --project NAME  Docker Compose project name [default: $PROJECT_NAME]
    -d, --dir PATH      Backup directory [default: $BACKUP_DIR]
    -h, --help          Show this help message

EXAMPLES:
    $0 backup                           # Create full backup
    $0 restore backup_20241212_143022   # Restore from specific backup
    $0 test-persistence                 # Test data persistence
    $0 cleanup                          # Remove old backups
    $0 volumes                          # Show volume status

BACKUP STRUCTURE:
    backups/
    ├── backup_YYYYMMDD_HHMMSS/
    │   ├── postgres_data.tar.gz
    │   ├── minio_data.tar.gz
    │   ├── redis_data.tar.gz
    │   └── metadata.json

EOF
}

# Function to check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if volumes exist
check_volumes() {
    local volumes=("${PROJECT_NAME}_postgres_data" "${PROJECT_NAME}_minio_data" "${PROJECT_NAME}_redis_data")
    
    for volume in "${volumes[@]}"; do
        if ! docker volume inspect "$volume" &> /dev/null; then
            print_warning "Volume $volume does not exist"
            return 1
        fi
    done
    
    return 0
}

# Function to create backup
create_backup() {
    print_status "Creating backup of persistent data..."
    
    # Create backup directory
    local backup_path="$BACKUP_DIR/backup_$TIMESTAMP"
    mkdir -p "$backup_path"
    
    # Check if volumes exist
    if ! check_volumes; then
        print_error "Some volumes are missing. Please ensure the application has been started at least once."
        exit 1
    fi
    
    # Backup PostgreSQL data
    print_status "Backing up PostgreSQL data..."
    docker run --rm \
        -v "${PROJECT_NAME}_postgres_data:/data:ro" \
        -v "$(pwd)/$backup_path:/backup" \
        alpine:latest \
        tar czf /backup/postgres_data.tar.gz -C /data .
    
    # Backup MinIO data
    print_status "Backing up MinIO data..."
    docker run --rm \
        -v "${PROJECT_NAME}_minio_data:/data:ro" \
        -v "$(pwd)/$backup_path:/backup" \
        alpine:latest \
        tar czf /backup/minio_data.tar.gz -C /data .
    
    # Backup Redis data
    print_status "Backing up Redis data..."
    docker run --rm \
        -v "${PROJECT_NAME}_redis_data:/data:ro" \
        -v "$(pwd)/$backup_path:/backup" \
        alpine:latest \
        tar czf /backup/redis_data.tar.gz -C /data .
    
    # Create metadata file
    cat > "$backup_path/metadata.json" << EOF
{
    "timestamp": "$TIMESTAMP",
    "project_name": "$PROJECT_NAME",
    "backup_version": "1.0",
    "volumes": [
        "${PROJECT_NAME}_postgres_data",
        "${PROJECT_NAME}_minio_data", 
        "${PROJECT_NAME}_redis_data"
    ],
    "created_by": "$(whoami)",
    "docker_version": "$(docker --version)"
}
EOF
    
    print_success "Backup created: $backup_path"
    print_status "Backup size: $(du -sh "$backup_path" | cut -f1)"
}

# Function to restore from backup
restore_backup() {
    local backup_name="$1"
    
    if [[ -z "$backup_name" ]]; then
        print_error "Backup name required for restore operation"
        show_usage
        exit 1
    fi
    
    local backup_path="$BACKUP_DIR/$backup_name"
    
    if [[ ! -d "$backup_path" ]]; then
        print_error "Backup not found: $backup_path"
        exit 1
    fi
    
    print_warning "This will overwrite existing data. Continue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        exit 0
    fi
    
    print_status "Restoring from backup: $backup_name"
    
    # Stop services if running
    print_status "Stopping services..."
    docker-compose -p "$PROJECT_NAME" down || true
    
    # Restore PostgreSQL data
    print_status "Restoring PostgreSQL data..."
    docker volume rm "${PROJECT_NAME}_postgres_data" 2>/dev/null || true
    docker volume create "${PROJECT_NAME}_postgres_data"
    docker run --rm \
        -v "${PROJECT_NAME}_postgres_data:/data" \
        -v "$(pwd)/$backup_path:/backup:ro" \
        alpine:latest \
        tar xzf /backup/postgres_data.tar.gz -C /data
    
    # Restore MinIO data
    print_status "Restoring MinIO data..."
    docker volume rm "${PROJECT_NAME}_minio_data" 2>/dev/null || true
    docker volume create "${PROJECT_NAME}_minio_data"
    docker run --rm \
        -v "${PROJECT_NAME}_minio_data:/data" \
        -v "$(pwd)/$backup_path:/backup:ro" \
        alpine:latest \
        tar xzf /backup/minio_data.tar.gz -C /data
    
    # Restore Redis data
    print_status "Restoring Redis data..."
    docker volume rm "${PROJECT_NAME}_redis_data" 2>/dev/null || true
    docker volume create "${PROJECT_NAME}_redis_data"
    docker run --rm \
        -v "${PROJECT_NAME}_redis_data:/data" \
        -v "$(pwd)/$backup_path:/backup:ro" \
        alpine:latest \
        tar xzf /backup/redis_data.tar.gz -C /data
    
    print_success "Restore completed from: $backup_name"
    print_status "You can now start the services with: docker-compose up"
}

# Function to list backups
list_backups() {
    print_status "Available backups in $BACKUP_DIR:"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        print_warning "No backup directory found"
        return
    fi
    
    local count=0
    for backup in "$BACKUP_DIR"/backup_*; do
        if [[ -d "$backup" ]]; then
            local backup_name=$(basename "$backup")
            local size=$(du -sh "$backup" 2>/dev/null | cut -f1 || echo "unknown")
            local date=$(echo "$backup_name" | sed 's/backup_\([0-9]\{8\}\)_\([0-9]\{6\}\)/\1 \2/' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\) \([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
            echo "  $backup_name ($size) - $date"
            ((count++))
        fi
    done
    
    if [[ $count -eq 0 ]]; then
        print_warning "No backups found"
    else
        print_success "Found $count backup(s)"
    fi
}

# Function to test persistence
test_persistence() {
    print_status "Testing data persistence across container restarts..."
    
    # Create test data
    local test_id="persistence_test_$(date +%s)"
    
    print_status "Starting services..."
    docker-compose -p "$PROJECT_NAME" up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Test PostgreSQL persistence
    print_status "Testing PostgreSQL persistence..."
    docker-compose -p "$PROJECT_NAME" exec -T postgres psql -U postgres -d proposal_prepper -c "
        CREATE TABLE IF NOT EXISTS persistence_test (
            id VARCHAR(50) PRIMARY KEY,
            created_at TIMESTAMP DEFAULT NOW()
        );
        INSERT INTO persistence_test (id) VALUES ('$test_id');
    " || print_warning "PostgreSQL test data creation failed"
    
    # Test Redis persistence
    print_status "Testing Redis persistence..."
    docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli SET "test:$test_id" "persistence_test_value" || print_warning "Redis test data creation failed"
    
    print_status "Stopping services..."
    docker-compose -p "$PROJECT_NAME" down
    
    print_status "Restarting services..."
    docker-compose -p "$PROJECT_NAME" up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Verify PostgreSQL data
    print_status "Verifying PostgreSQL data persistence..."
    local pg_result=$(docker-compose -p "$PROJECT_NAME" exec -T postgres psql -U postgres -d proposal_prepper -t -c "SELECT id FROM persistence_test WHERE id = '$test_id';" 2>/dev/null | tr -d ' \n' || echo "")
    
    if [[ "$pg_result" == "$test_id" ]]; then
        print_success "PostgreSQL data persisted correctly"
    else
        print_error "PostgreSQL data persistence failed"
    fi
    
    # Verify Redis data
    print_status "Verifying Redis data persistence..."
    local redis_result=$(docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli GET "test:$test_id" 2>/dev/null || echo "")
    
    if [[ "$redis_result" == "persistence_test_value" ]]; then
        print_success "Redis data persisted correctly"
    else
        print_error "Redis data persistence failed"
    fi
    
    # Cleanup test data
    print_status "Cleaning up test data..."
    docker-compose -p "$PROJECT_NAME" exec -T postgres psql -U postgres -d proposal_prepper -c "DELETE FROM persistence_test WHERE id = '$test_id';" 2>/dev/null || true
    docker-compose -p "$PROJECT_NAME" exec -T redis redis-cli DEL "test:$test_id" 2>/dev/null || true
    
    print_success "Persistence test completed"
}

# Function to show volume information
show_volumes() {
    print_status "Volume information for project: $PROJECT_NAME"
    
    local volumes=("${PROJECT_NAME}_postgres_data" "${PROJECT_NAME}_minio_data" "${PROJECT_NAME}_redis_data")
    
    for volume in "${volumes[@]}"; do
        if docker volume inspect "$volume" &> /dev/null; then
            local size=$(docker run --rm -v "$volume:/data:ro" alpine:latest du -sh /data 2>/dev/null | cut -f1 || echo "unknown")
            local mountpoint=$(docker volume inspect "$volume" --format '{{ .Mountpoint }}' 2>/dev/null || echo "unknown")
            echo "  $volume:"
            echo "    Size: $size"
            echo "    Mountpoint: $mountpoint"
        else
            echo "  $volume: NOT FOUND"
        fi
    done
}

# Function to cleanup old backups
cleanup_backups() {
    local retention_days="${BACKUP_RETENTION_DAYS:-7}"
    
    print_status "Cleaning up backups older than $retention_days days..."
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        print_warning "No backup directory found"
        return
    fi
    
    local count=0
    find "$BACKUP_DIR" -name "backup_*" -type d -mtime +$retention_days -print0 | while IFS= read -r -d '' backup; do
        print_status "Removing old backup: $(basename "$backup")"
        rm -rf "$backup"
        ((count++))
    done
    
    if [[ $count -eq 0 ]]; then
        print_status "No old backups to clean up"
    else
        print_success "Cleaned up $count old backup(s)"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project)
            PROJECT_NAME="$2"
            shift 2
            ;;
        -d|--dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        backup)
            COMMAND="backup"
            shift
            ;;
        restore)
            COMMAND="restore"
            BACKUP_NAME="$2"
            shift 2
            ;;
        list-backups)
            COMMAND="list-backups"
            shift
            ;;
        test-persistence)
            COMMAND="test-persistence"
            shift
            ;;
        cleanup)
            COMMAND="cleanup"
            shift
            ;;
        volumes)
            COMMAND="volumes"
            shift
            ;;
        *)
            print_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if command was provided
if [[ -z "${COMMAND:-}" ]]; then
    print_error "No command specified"
    show_usage
    exit 1
fi

# Change to containers directory
cd "$(dirname "$0")"

# Check Docker availability
check_docker

# Execute command
case $COMMAND in
    backup)
        create_backup
        ;;
    restore)
        restore_backup "$BACKUP_NAME"
        ;;
    list-backups)
        list_backups
        ;;
    test-persistence)
        test_persistence
        ;;
    cleanup)
        cleanup_backups
        ;;
    volumes)
        show_volumes
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        exit 1
        ;;
esac