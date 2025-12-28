# ===========================================
# Web Compliance Checker - Makefile
# ===========================================
# Run `make help` to see available commands

.PHONY: help install dev build start stop restart logs clean test lint deploy

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

# Variables
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV := docker-compose.dev.yml

# ===========================================
# Help
# ===========================================

help: ## Show this help message
	@echo ""
	@echo "$(BLUE)Web Compliance Checker$(NC)"
	@echo "$(BLUE)======================$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC) make [target]"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; /^(install|dev|dev-backend|dev-frontend)/ {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; /^(build|start|stop|restart|logs|ps|clean)/ {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Testing & Quality:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; /^(test|lint|format|security)/ {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Deployment:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; /^(deploy|prod|staging)/ {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ===========================================
# Development
# ===========================================

install: ## Install all dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && pip install -r requirements.txt
	cd backend && playwright install chromium
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)Installation complete!$(NC)"

dev: ## Start development servers (both frontend and backend)
	@echo "$(BLUE)Starting development servers...$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:3001$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@make -j2 dev-backend dev-frontend

dev-backend: ## Start backend development server
	cd backend && python main.py

dev-frontend: ## Start frontend development server
	cd frontend && npm run dev

dev-docker: ## Start development with Docker
	docker-compose -f $(COMPOSE_DEV) up --build

# ===========================================
# Docker
# ===========================================

build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build
	@echo "$(GREEN)Build complete!$(NC)"

build-no-cache: ## Build Docker images without cache
	docker-compose -f $(COMPOSE_FILE) build --no-cache

start: ## Start all services
	@echo "$(BLUE)Starting services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Services started!$(NC)"
	@make ps

stop: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services stopped!$(NC)"

restart: ## Restart all services
	docker-compose -f $(COMPOSE_FILE) restart

logs: ## View container logs (use: make logs service=backend)
ifdef service
	docker-compose -f $(COMPOSE_FILE) logs -f $(service)
else
	docker-compose -f $(COMPOSE_FILE) logs -f
endif

ps: ## Show running containers
	docker-compose -f $(COMPOSE_FILE) ps

clean: ## Remove containers, volumes, and images
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

shell-backend: ## Open shell in backend container
	docker-compose -f $(COMPOSE_FILE) exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker-compose -f $(COMPOSE_FILE) exec frontend /bin/sh

# ===========================================
# Testing & Quality
# ===========================================

test: ## Run all tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && python -m pytest tests/ -v
	@echo "$(GREEN)Tests complete!$(NC)"

test-coverage: ## Run tests with coverage
	cd backend && python -m pytest tests/ -v --cov=app --cov-report=html
	@echo "$(GREEN)Coverage report: backend/htmlcov/index.html$(NC)"

lint: ## Run linters
	@echo "$(BLUE)Linting backend...$(NC)"
	cd backend && ruff check .
	@echo "$(BLUE)Linting frontend...$(NC)"
	cd frontend && npm run lint
	@echo "$(GREEN)Linting complete!$(NC)"

format: ## Format code
	@echo "$(BLUE)Formatting backend...$(NC)"
	cd backend && black . && isort .
	@echo "$(GREEN)Formatting complete!$(NC)"

security: ## Run security checks
	@echo "$(BLUE)Running security audit...$(NC)"
	cd backend && pip-audit
	cd frontend && npm audit
	@echo "$(GREEN)Security check complete!$(NC)"

# ===========================================
# Deployment
# ===========================================

deploy: ## Deploy to production
	@echo "$(BLUE)Deploying to production...$(NC)"
	./scripts/deploy.sh deploy

prod: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	NODE_ENV=production docker-compose -f $(COMPOSE_FILE) up -d
	@make health

staging: ## Deploy to staging
	@echo "$(BLUE)Deploying to staging...$(NC)"
	NODE_ENV=staging docker-compose -f $(COMPOSE_FILE) up -d

health: ## Run health checks
	@echo "$(BLUE)Running health checks...$(NC)"
	@sleep 5
	@curl -sf http://localhost:3001/health > /dev/null && echo "$(GREEN)Backend: OK$(NC)" || echo "$(YELLOW)Backend: FAILED$(NC)"
	@curl -sf http://localhost:3000 > /dev/null && echo "$(GREEN)Frontend: OK$(NC)" || echo "$(YELLOW)Frontend: FAILED$(NC)"

backup: ## Create backup
	@echo "$(BLUE)Creating backup...$(NC)"
	./scripts/deploy.sh backup

# ===========================================
# Utilities
# ===========================================

ssl-gen: ## Generate self-signed SSL certificates
	@echo "$(BLUE)Generating self-signed SSL certificates...$(NC)"
	mkdir -p nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/ssl/privkey.pem \
		-out nginx/ssl/fullchain.pem \
		-subj "/CN=localhost"
	@echo "$(GREEN)SSL certificates generated!$(NC)"

update: ## Update dependencies
	@echo "$(BLUE)Updating backend dependencies...$(NC)"
	cd backend && pip install --upgrade -r requirements.txt
	@echo "$(BLUE)Updating frontend dependencies...$(NC)"
	cd frontend && npm update
	@echo "$(GREEN)Update complete!$(NC)"

docs: ## Generate documentation
	@echo "$(BLUE)Generating documentation...$(NC)"
	cd backend && mkdocs build
	@echo "$(GREEN)Documentation generated!$(NC)"

