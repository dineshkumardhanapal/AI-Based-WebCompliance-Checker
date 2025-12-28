"""
Compliance Check Routes

Handles API endpoints for web compliance checking.
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel, HttpUrl
from typing import Optional
import os
import asyncio

from app.services.compliance_checks import run_compliance_checks
from app.services.ai_recommender import generate_recommendations
from app.middleware.security import validate_url, sanitize_url

router = APIRouter()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Request model
class ComplianceCheckRequest(BaseModel):
    url: str

# Stricter rate limit for check endpoint
CHECK_RATE_LIMIT = os.getenv("CHECK_RATE_LIMIT_MAX", "20")

@router.post("/check")
@limiter.limit(f"{CHECK_RATE_LIMIT}/hour")
async def check_compliance(
    request: Request,
    body: ComplianceCheckRequest
):
    """
    Check website compliance with WCAG standards.
    
    Args:
        request: FastAPI request object (for rate limiting)
        body: Request body containing URL to check
        
    Returns:
        JSON response with compliance check results
    """
    try:
        url = body.url.strip()
        
        # Validate input
        if not url or not isinstance(url, str):
            raise HTTPException(
                status_code=400,
                detail="URL is required and must be a string"
            )
        
        # Validate URL and check for SSRF vulnerabilities
        validation = await validate_url(url)
        if not validation["valid"]:
            raise HTTPException(
                status_code=400,
                detail=validation["error"]
            )
        
        valid_url = validation["url"]
        # Use geturl() to properly reconstruct URL, or use original if it's a string
        if hasattr(valid_url, 'geturl'):
            url_string = valid_url.geturl()
        else:
            # valid_url is already a string or ParseResult - reconstruct properly
            from urllib.parse import urlunparse
            url_string = urlunparse(valid_url) if hasattr(valid_url, 'scheme') else str(valid_url)
        
        # If URL string is empty or invalid, use the original validated URL
        if not url_string or url_string == "":
            url_string = url.strip()
        
        # Log the request (sanitized) - use ASCII safe encoding
        try:
            hostname = valid_url.hostname if hasattr(valid_url, 'hostname') else 'unknown'
            print(f"Analyzing URL: {hostname} (sanitized)")
        except UnicodeEncodeError:
            print(f"Analyzing URL: (hostname contains special characters)")
        
        # Set timeout for the entire operation
        try:
            # Run compliance checks with timeout
            results = await asyncio.wait_for(
                run_compliance_checks(url_string),
                timeout=60.0  # 60 second timeout
            )
            
            # Get failed checks
            failed_checks = [check for check in results["checks"] if not check["passed"]]
            
            # Generate AI recommendations for failed checks (with timeout)
            recommendations = []
            try:
                recommendations = await asyncio.wait_for(
                    generate_recommendations(failed_checks, url_string),
                    timeout=45.0  # 45 second timeout
                )
            except asyncio.TimeoutError:
                recommendations = []
            except Exception as recommendation_error:
                recommendations = []
            
            # Map recommendations to checks and sanitize output
            checks_with_recommendations = []
            for check in results["checks"]:
                recommendation = next(
                    (rec for rec in recommendations if rec["checkName"] == check["name"]),
                    None
                )
                checks_with_recommendations.append({
                    "name": check["name"],
                    "passed": check["passed"],
                    "details": (check["details"] or "")[:1000],  # Limit details length
                    "recommendation": (recommendation["recommendation"][:500] 
                                     if recommendation and recommendation.get("recommendation") 
                                     else None),  # Limit recommendation length
                })
            
            # Sanitize URL in response
            from datetime import datetime
            return {
                "url": sanitize_url(url_string),
                "checks": checks_with_recommendations,
                "score": results["score"],
                "passedCount": results["passedCount"],
                "totalCount": results["totalCount"],
                "timestamp": datetime.utcnow().isoformat(),
            }
            
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=504,
                detail="Request timeout - analysis took too long"
            )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as error:
        # Log error with sanitized information (handle Windows encoding)
        try:
            error_str = str(error).encode('ascii', 'replace').decode('ascii')
            print(f"Error in compliance check: {error.__class__.__name__}: {error_str}")
        except:
            print("Error in compliance check (could not print details)")
        
        # Don't leak internal error details
        is_development = os.getenv("NODE_ENV", "development") == "development"
        error_msg = str(error).encode('ascii', 'replace').decode('ascii') if is_development else ""
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze webpage" + (f": {error_msg}" if is_development else "")
        )

@router.post("/cleanup")
async def cleanup_browser(request: Request):
    """
    Cleanup browser resources.
    Should be protected in production.
    """
    # In production, add authentication check here
    if os.getenv("NODE_ENV") == "production" and not request.headers.get("authorization"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        from app.utils.playwright_helper import close_browser
        await close_browser()
        return {"message": "Browser closed successfully"}
    except Exception as error:
        print(f"Error closing browser: {error}")
        raise HTTPException(status_code=500, detail="Failed to close browser")

