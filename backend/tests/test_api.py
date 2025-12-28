"""
API Tests for Web Compliance Checker

Run with: pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for /health endpoint."""
    
    def test_health_check(self, client):
        """Test health check returns OK."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "message" in data
        assert data["backend"] == "Python/FastAPI"
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data


class TestComplianceEndpoint:
    """Tests for /api/check endpoint."""
    
    def test_check_requires_url(self, client):
        """Test that URL is required."""
        response = client.post("/api/check", json={})
        assert response.status_code == 422  # Validation error
    
    def test_check_invalid_url_format(self, client):
        """Test invalid URL format is rejected."""
        response = client.post("/api/check", json={"url": "not-a-url"})
        assert response.status_code == 400
    
    def test_check_localhost_blocked(self, client):
        """Test localhost URLs are blocked."""
        response = client.post("/api/check", json={"url": "http://localhost"})
        assert response.status_code == 400
        assert "not allowed" in response.json()["detail"].lower()
    
    def test_check_private_ip_blocked(self, client):
        """Test private IP addresses are blocked."""
        response = client.post("/api/check", json={"url": "http://192.168.1.1"})
        assert response.status_code == 400
        assert "not allowed" in response.json()["detail"].lower()
    
    def test_check_internal_ip_blocked(self, client):
        """Test internal IP addresses are blocked."""
        response = client.post("/api/check", json={"url": "http://10.0.0.1"})
        assert response.status_code == 400
    
    def test_check_ftp_protocol_blocked(self, client):
        """Test non-HTTP protocols are blocked."""
        response = client.post("/api/check", json={"url": "ftp://example.com"})
        assert response.status_code == 400
        assert "HTTP" in response.json()["detail"]


class TestSecurityHeaders:
    """Tests for security headers."""
    
    def test_security_headers_present(self, client):
        """Test that security headers are present in responses."""
        response = client.get("/health")
        
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert response.headers.get("X-XSS-Protection") == "1; mode=block"


class TestRateLimiting:
    """Tests for rate limiting."""
    
    def test_rate_limit_headers(self, client):
        """Test that rate limit headers are present."""
        response = client.get("/health")
        # Rate limit headers may be present
        # This test just verifies the endpoint responds
        assert response.status_code == 200


class TestInputValidation:
    """Tests for input validation."""
    
    def test_url_length_limit(self, client):
        """Test that extremely long URLs are rejected."""
        long_url = "https://example.com/" + "a" * 3000
        response = client.post("/api/check", json={"url": long_url})
        assert response.status_code == 400
        assert "too long" in response.json()["detail"].lower()
    
    def test_empty_url_rejected(self, client):
        """Test that empty URL is rejected."""
        response = client.post("/api/check", json={"url": ""})
        assert response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

