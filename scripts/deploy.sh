#!/bin/bash
# ===========================================
# Web Compliance Checker - Deployment Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="web-compliance-checker"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "  Web Compliance Checker - Deployment"
    echo "=============================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cp env.example .env
        print_warning "Please edit .env file with your configuration"
        exit 1
    fi
    
    if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
        print_warning "SSL certificates not found in nginx/ssl/"
        print_warning "Generating self-signed certificates for testing..."
        mkdir -p nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/privkey.pem \
            -out nginx/ssl/fullchain.pem \
            -subj "/CN=localhost" 2>/dev/null
        print_warning "For production, use proper SSL certificates!"
    fi
    
    print_success "Prerequisites check passed"
}

# Build images
build_images() {
    print_step "Building Docker images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_success "Images built successfully"
}

# Deploy application
deploy() {
    print_step "Deploying application..."
    docker-compose -f $COMPOSE_FILE up -d
    print_success "Application deployed"
}

# Stop application
stop() {
    print_step "Stopping application..."
    docker-compose -f $COMPOSE_FILE down
    print_success "Application stopped"
}

# Restart application
restart() {
    print_step "Restarting application..."
    docker-compose -f $COMPOSE_FILE restart
    print_success "Application restarted"
}

# View logs
logs() {
    docker-compose -f $COMPOSE_FILE logs -f "$@"
}

# Health check
health_check() {
    print_step "Running health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend
    if curl -sf http://localhost:3001/health > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -sf http://localhost:3000 > /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    print_success "All services are healthy"
}

# Cleanup
cleanup() {
    print_step "Cleaning up..."
    docker-compose -f $COMPOSE_FILE down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Update application
update() {
    print_step "Updating application..."
    git pull origin main
    build_images
    docker-compose -f $COMPOSE_FILE up -d --remove-orphans
    health_check
    print_success "Update completed"
}

# Show status
status() {
    print_step "Application status:"
    docker-compose -f $COMPOSE_FILE ps
}

# Backup
backup() {
    print_step "Creating backup..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup configuration
    cp .env "$BACKUP_DIR/"
    cp -r nginx/ssl "$BACKUP_DIR/"
    
    # Backup Redis data if exists
    if docker-compose -f $COMPOSE_FILE ps redis | grep -q "Up"; then
        docker-compose -f $COMPOSE_FILE exec -T redis redis-cli BGSAVE
        docker cp $(docker-compose -f $COMPOSE_FILE ps -q redis):/data/dump.rdb "$BACKUP_DIR/"
    fi
    
    print_success "Backup created at $BACKUP_DIR"
}

# Main script
print_header

case "$1" in
    build)
        check_prerequisites
        build_images
        ;;
    deploy)
        check_prerequisites
        deploy
        health_check
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        health_check
        ;;
    logs)
        shift
        logs "$@"
        ;;
    health)
        health_check
        ;;
    cleanup)
        cleanup
        ;;
    update)
        update
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    *)
        echo "Usage: $0 {build|deploy|stop|restart|logs|health|cleanup|update|status|backup}"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker images"
        echo "  deploy   - Deploy the application"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View container logs (optional: service name)"
        echo "  health   - Run health checks"
        echo "  cleanup  - Remove containers and prune system"
        echo "  update   - Pull latest code and redeploy"
        echo "  status   - Show service status"
        echo "  backup   - Create configuration backup"
        exit 1
        ;;
esac

