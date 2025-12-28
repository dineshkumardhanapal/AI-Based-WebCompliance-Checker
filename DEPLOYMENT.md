# Deployment Guide

Complete guide for deploying the Web Compliance Checker to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deploy with Docker](#quick-deploy-with-docker)
3. [Manual Deployment](#manual-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling](#scaling)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Docker | 20.10+ | Container runtime |
| Docker Compose | 2.0+ | Container orchestration |
| Git | 2.30+ | Version control |

### Optional Software

| Software | Version | Purpose |
|----------|---------|---------|
| Nginx | 1.20+ | Reverse proxy (standalone) |
| Certbot | 1.0+ | SSL certificate automation |

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB |
| Storage | 10 GB | 20 GB |

---

## Quick Deploy with Docker

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/web-compliance-checker.git
cd web-compliance-checker
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit with your configuration
nano .env
```

**Required configuration:**

```env
NODE_ENV=production
REPLICATE_API_TOKEN=your_token_here
ALLOWED_ORIGINS=https://yourdomain.com
```

### Step 3: Add SSL Certificates

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Option A: Use Let's Encrypt (recommended)
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Option B: Self-signed (testing only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/privkey.pem \
    -out nginx/ssl/fullchain.pem \
    -subj "/CN=yourdomain.com"
```

### Step 4: Deploy

```bash
# Using deploy script (Linux/Mac)
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy

# Using deploy script (Windows PowerShell)
.\scripts\deploy.ps1 deploy

# Or using Docker Compose directly
docker-compose up -d
```

### Step 5: Verify Deployment

```bash
# Check service status
docker-compose ps

# Check health endpoint
curl https://yourdomain.com/health

# View logs
docker-compose logs -f
```

---

## Manual Deployment

### Backend Deployment

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Install Playwright
playwright install chromium --with-deps

# Configure environment
cp env.example.python .env
# Edit .env with your settings

# Run with Gunicorn (production)
pip install gunicorn
gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:3001
```

### Frontend Deployment

```bash
cd frontend

# Install dependencies
npm ci --only=production

# Build for production
npm run build

# Option A: Run with Node.js
npm run start

# Option B: Deploy to static hosting
# Copy .next/static and out/ to your CDN
```

### Nginx Configuration (Standalone)

```bash
# Install Nginx
sudo apt update && sudo apt install nginx

# Copy configuration
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf

# Add SSL certificates
sudo mkdir -p /etc/nginx/ssl
sudo cp nginx/ssl/* /etc/nginx/ssl/

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

---

## Cloud Platform Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Railway (Backend)

1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
docker build -t wcc-backend ./backend
docker tag wcc-backend:latest $ECR_URI/wcc-backend:latest
docker push $ECR_URI/wcc-backend:latest

# Update ECS service
aws ecs update-service --cluster wcc-cluster --service wcc-service --force-new-deployment
```

### DigitalOcean App Platform

```yaml
# app.yaml
name: web-compliance-checker
services:
  - name: frontend
    source_dir: frontend
    build_command: npm run build
    run_command: npm run start
    http_port: 3000
  
  - name: backend
    source_dir: backend
    dockerfile_path: backend/Dockerfile
    http_port: 3001
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renewal cron job
echo "0 0 1 * * certbot renew --quiet" | sudo crontab -
```

### Certificate Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Restart services after renewal
docker-compose restart nginx
```

---

## Environment Configuration

### Production Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | - | Set to `production` |
| `PORT` | No | `3001` | Backend port |
| `REPLICATE_API_TOKEN` | No | - | AI recommendations |
| `ALLOWED_ORIGINS` | Yes | - | CORS origins |
| `RATE_LIMIT_MAX` | No | `100` | General rate limit |
| `CHECK_RATE_LIMIT_MAX` | No | `20` | Check endpoint limit |
| `LOG_LEVEL` | No | `INFO` | Logging level |

### Secrets Management

**Option A: Docker Secrets**

```yaml
# docker-compose.yml
services:
  backend:
    secrets:
      - replicate_token

secrets:
  replicate_token:
    file: ./secrets/replicate_token.txt
```

**Option B: HashiCorp Vault**

```bash
vault kv put secret/wcc REPLICATE_API_TOKEN=your_token
```

---

## Monitoring & Logging

### Log Collection

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Export logs
docker-compose logs --no-color > logs/$(date +%Y%m%d).log
```

### Health Checks

```bash
# Backend health
curl -f http://localhost:3001/health

# Full system check
./scripts/deploy.sh health
```

### Prometheus Metrics (Optional)

```python
# Add to backend
from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)
```

### Grafana Dashboard

```bash
# Add to docker-compose.yml
grafana:
  image: grafana/grafana
  ports:
    - "3002:3000"
  volumes:
    - grafana-data:/var/lib/grafana
```

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### Load Balancing

```nginx
upstream backend {
    least_conn;
    server backend-1:3001;
    server backend-2:3001;
    server backend-3:3001;
}
```

### Redis for Distributed Rate Limiting

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
```

---

## Backup & Recovery

### Create Backup

```bash
./scripts/deploy.sh backup
```

### Manual Backup

```bash
# Backup configuration
mkdir -p backups/$(date +%Y%m%d)
cp .env backups/$(date +%Y%m%d)/
cp -r nginx/ssl backups/$(date +%Y%m%d)/

# Backup Redis data
docker-compose exec redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb backups/$(date +%Y%m%d)/
```

### Restore

```bash
# Restore configuration
cp backups/YYYYMMDD/.env .
cp -r backups/YYYYMMDD/ssl nginx/

# Restart services
docker-compose down
docker-compose up -d
```

---

## Troubleshooting

### Common Issues

<details>
<summary><strong>Container won't start</strong></summary>

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild images
docker-compose build --no-cache
```
</details>

<details>
<summary><strong>SSL certificate errors</strong></summary>

```bash
# Verify certificate
openssl x509 -in nginx/ssl/fullchain.pem -text -noout

# Check expiration
openssl x509 -in nginx/ssl/fullchain.pem -dates -noout

# Test SSL
curl -vI https://yourdomain.com
```
</details>

<details>
<summary><strong>Out of memory</strong></summary>

```bash
# Check memory usage
docker stats

# Increase limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```
</details>

<details>
<summary><strong>Rate limiting too aggressive</strong></summary>

```bash
# Increase limits in .env
RATE_LIMIT_MAX=200
CHECK_RATE_LIMIT_MAX=50

# Restart backend
docker-compose restart backend
```
</details>

### Debug Mode

```bash
# Run with debug logging
LOG_LEVEL=DEBUG docker-compose up

# Access backend shell
docker-compose exec backend /bin/bash

# Run health check manually
docker-compose exec backend curl localhost:3001/health
```

### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check slow requests
docker-compose logs backend | grep -E "(took|slow|timeout)"

# Profile Playwright
PLAYWRIGHT_DEBUG=1 docker-compose up backend
```

---

## Production Checklist

Before going live, ensure:

- [ ] `NODE_ENV=production` is set
- [ ] Valid SSL certificates installed
- [ ] `ALLOWED_ORIGINS` configured with production domains
- [ ] Rate limiting configured appropriately
- [ ] Logging configured and monitored
- [ ] Backups scheduled
- [ ] Health checks passing
- [ ] DNS configured correctly
- [ ] Firewall rules in place
- [ ] Error monitoring set up (e.g., Sentry)

---

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `docker-compose logs -f`
3. Open a GitHub issue with:
   - Error messages
   - Steps to reproduce
   - Environment details

