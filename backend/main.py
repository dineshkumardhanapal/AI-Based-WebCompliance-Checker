"""
FastAPI Backend Server for Web Compliance Checker

This is the main entry point for the Python backend server.
It replaces the Node.js Express server with FastAPI.
"""

import os
import sys
import asyncio

# Fix Windows asyncio subprocess support for Playwright
# This MUST be set before any asyncio operations or imports that use asyncio
if sys.platform == "win32":
    # Set the event loop policy before any other imports
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn

from app.routes import compliance
from app.utils.playwright_helper import close_browser

# Load environment variables
load_dotenv()

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown"""
    # Startup
    print("Starting Web Compliance Checker Backend (Python/FastAPI)...")
    yield
    # Shutdown
    print("Shutting down...")
    await close_browser()

# Create FastAPI app
app = FastAPI(
    title="Web Compliance Checker API",
    description="AI-powered web accessibility and WCAG compliance checking API",
    version="2.0.0",
    lifespan=lifespan
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
allowed_origins = os.getenv(
    'ALLOWED_ORIGINS', 
    'http://localhost:3000,http://localhost:3001'
).split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Security headers middleware (FastAPI doesn't need Helmet, but we add headers manually)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Include routers
app.include_router(compliance.router, prefix="/api", tags=["compliance"])

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Web Compliance Checker API is running",
        "backend": "Python/FastAPI"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Web Compliance Checker API",
        "version": "2.0.0",
        "docs": "/docs"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    is_development = os.getenv("NODE_ENV", "development") == "development"
    
    # Use ASCII-safe error logging to avoid Windows encoding issues
    error_msg = str(exc).encode('ascii', 'replace').decode('ascii')
    try:
        print(f"Error: {exc.__class__.__name__}: {error_msg}")
    except:
        print("Error occurred (could not print details)")
    
    if is_development:
        import traceback
        try:
            print(traceback.format_exc())
        except:
            pass
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if is_development else "An error occurred"
        }
    )

if __name__ == "__main__":
    # IMPORTANT: Set event loop policy BEFORE uvicorn.run() on Windows
    # This must happen at the module level, before any event loop is created
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    port = int(os.getenv("PORT", 3001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("NODE_ENV", "development") == "development",
        log_level="info"
    )

