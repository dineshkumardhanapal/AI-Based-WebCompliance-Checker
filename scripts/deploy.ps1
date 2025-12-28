# ===========================================
# Web Compliance Checker - Deployment Script (Windows)
# ===========================================

param(
    [Parameter(Position=0)]
    [ValidateSet("build", "deploy", "stop", "restart", "logs", "health", "cleanup", "update", "status")]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

# Configuration
$ComposeFile = "docker-compose.yml"
$ProjectName = "web-compliance-checker"

# Functions
function Write-Header {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host "  Web Compliance Checker - Deployment" -ForegroundColor Blue
    Write-Host "==============================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed"
        exit 1
    }
    
    # Check Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed"
        exit 1
    }
    
    # Check .env file
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from template..."
        Copy-Item "env.example" ".env"
        Write-Warning "Please edit .env file with your configuration"
        exit 1
    }
    
    # Check SSL certificates
    if (-not (Test-Path "nginx/ssl/fullchain.pem") -or -not (Test-Path "nginx/ssl/privkey.pem")) {
        Write-Warning "SSL certificates not found in nginx/ssl/"
        Write-Warning "Please add your SSL certificates or generate self-signed ones"
    }
    
    Write-Success "Prerequisites check passed"
}

# Build images
function Build-Images {
    Write-Step "Building Docker images..."
    docker-compose -f $ComposeFile build --no-cache
    Write-Success "Images built successfully"
}

# Deploy application
function Deploy-Application {
    Write-Step "Deploying application..."
    docker-compose -f $ComposeFile up -d
    Write-Success "Application deployed"
}

# Stop application
function Stop-Application {
    Write-Step "Stopping application..."
    docker-compose -f $ComposeFile down
    Write-Success "Application stopped"
}

# Restart application
function Restart-Application {
    Write-Step "Restarting application..."
    docker-compose -f $ComposeFile restart
    Write-Success "Application restarted"
}

# View logs
function Show-Logs {
    docker-compose -f $ComposeFile logs -f
}

# Health check
function Test-Health {
    Write-Step "Running health check..."
    
    Start-Sleep -Seconds 10
    
    try {
        $backendHealth = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 10
        if ($backendHealth.StatusCode -eq 200) {
            Write-Success "Backend is healthy"
        }
    } catch {
        Write-Error "Backend health check failed"
        return
    }
    
    try {
        $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
        if ($frontendHealth.StatusCode -eq 200) {
            Write-Success "Frontend is healthy"
        }
    } catch {
        Write-Error "Frontend health check failed"
        return
    }
    
    Write-Success "All services are healthy"
}

# Cleanup
function Invoke-Cleanup {
    Write-Step "Cleaning up..."
    docker-compose -f $ComposeFile down -v --remove-orphans
    docker system prune -f
    Write-Success "Cleanup completed"
}

# Update application
function Update-Application {
    Write-Step "Updating application..."
    git pull origin main
    Build-Images
    docker-compose -f $ComposeFile up -d --remove-orphans
    Test-Health
    Write-Success "Update completed"
}

# Show status
function Show-Status {
    Write-Step "Application status:"
    docker-compose -f $ComposeFile ps
}

# Show help
function Show-Help {
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 <command>" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  build    - Build Docker images"
    Write-Host "  deploy   - Deploy the application"
    Write-Host "  stop     - Stop all services"
    Write-Host "  restart  - Restart all services"
    Write-Host "  logs     - View container logs"
    Write-Host "  health   - Run health checks"
    Write-Host "  cleanup  - Remove containers and prune system"
    Write-Host "  update   - Pull latest code and redeploy"
    Write-Host "  status   - Show service status"
    Write-Host ""
}

# Main script
Write-Header

switch ($Command) {
    "build" {
        Test-Prerequisites
        Build-Images
    }
    "deploy" {
        Test-Prerequisites
        Deploy-Application
        Test-Health
    }
    "stop" {
        Stop-Application
    }
    "restart" {
        Restart-Application
        Test-Health
    }
    "logs" {
        Show-Logs
    }
    "health" {
        Test-Health
    }
    "cleanup" {
        Invoke-Cleanup
    }
    "update" {
        Update-Application
    }
    "status" {
        Show-Status
    }
    default {
        Show-Help
    }
}

