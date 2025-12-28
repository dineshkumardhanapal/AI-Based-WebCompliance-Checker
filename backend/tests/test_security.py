"""
Security Tests for Web Compliance Checker

Tests SSRF protection and input validation.
Run with: pytest tests/test_security.py -v
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.middleware.security import (
    validate_url,
    is_blocked_ip,
    sanitize_input,
    sanitize_url,
)


class TestSSRFProtection:
    """Tests for SSRF protection."""
    
    @pytest.mark.asyncio
    async def test_localhost_blocked(self):
        """Test localhost variations are blocked."""
        localhost_urls = [
            "http://localhost",
            "http://127.0.0.1",
            "http://127.0.0.1:8080",
            "http://0.0.0.0",
        ]
        for url in localhost_urls:
            result = await validate_url(url)
            assert not result["valid"], f"Expected {url} to be blocked"
    
    @pytest.mark.asyncio
    async def test_private_ips_blocked(self):
        """Test private IP ranges are blocked."""
        private_ips = [
            "http://10.0.0.1",
            "http://10.255.255.255",
            "http://172.16.0.1",
            "http://172.31.255.255",
            "http://192.168.0.1",
            "http://192.168.255.255",
        ]
        for url in private_ips:
            result = await validate_url(url)
            assert not result["valid"], f"Expected {url} to be blocked"
    
    @pytest.mark.asyncio
    async def test_link_local_blocked(self):
        """Test link-local addresses are blocked."""
        result = await validate_url("http://169.254.0.1")
        assert not result["valid"]
    
    @pytest.mark.asyncio
    async def test_valid_url_allowed(self):
        """Test valid public URLs are allowed."""
        result = await validate_url("https://example.com")
        assert result["valid"]
    
    @pytest.mark.asyncio
    async def test_https_allowed(self):
        """Test HTTPS URLs are allowed."""
        result = await validate_url("https://google.com")
        assert result["valid"]
    
    @pytest.mark.asyncio
    async def test_ftp_blocked(self):
        """Test FTP protocol is blocked."""
        result = await validate_url("ftp://example.com")
        assert not result["valid"]
        assert "HTTP" in result["error"]
    
    @pytest.mark.asyncio
    async def test_file_protocol_blocked(self):
        """Test file:// protocol is blocked."""
        result = await validate_url("file:///etc/passwd")
        assert not result["valid"]
    
    @pytest.mark.asyncio
    async def test_url_too_long(self):
        """Test URL length limit."""
        long_url = "https://example.com/" + "a" * 3000
        result = await validate_url(long_url)
        assert not result["valid"]
        assert "too long" in result["error"].lower()


class TestIPBlocking:
    """Tests for IP blocking logic."""
    
    def test_private_10_range(self):
        """Test 10.x.x.x range is blocked."""
        assert is_blocked_ip("10.0.0.1")
        assert is_blocked_ip("10.255.255.255")
    
    def test_private_172_range(self):
        """Test 172.16-31.x.x range is blocked."""
        assert is_blocked_ip("172.16.0.1")
        assert is_blocked_ip("172.31.255.255")
    
    def test_private_192_range(self):
        """Test 192.168.x.x range is blocked."""
        assert is_blocked_ip("192.168.0.1")
        assert is_blocked_ip("192.168.255.255")
    
    def test_localhost_range(self):
        """Test 127.x.x.x range is blocked."""
        assert is_blocked_ip("127.0.0.1")
        assert is_blocked_ip("127.255.255.255")
    
    def test_public_ips_allowed(self):
        """Test public IPs are allowed."""
        assert not is_blocked_ip("8.8.8.8")
        assert not is_blocked_ip("1.1.1.1")
        assert not is_blocked_ip("93.184.216.34")  # example.com


class TestInputSanitization:
    """Tests for input sanitization."""
    
    def test_xss_tags_removed(self):
        """Test HTML tags are removed."""
        assert "<" not in sanitize_input("<script>alert('xss')</script>")
        assert ">" not in sanitize_input("<script>alert('xss')</script>")
    
    def test_length_limit(self):
        """Test string length is limited."""
        long_input = "a" * 20000
        result = sanitize_input(long_input)
        assert len(result) <= 10000
    
    def test_whitespace_stripped(self):
        """Test whitespace is stripped."""
        assert sanitize_input("  hello  ") == "hello"
    
    def test_normal_input_preserved(self):
        """Test normal input is preserved."""
        assert sanitize_input("Hello World") == "Hello World"


class TestURLSanitization:
    """Tests for URL sanitization."""
    
    def test_valid_http_url(self):
        """Test valid HTTP URL is preserved."""
        url = "http://example.com"
        assert sanitize_url(url) == url
    
    def test_valid_https_url(self):
        """Test valid HTTPS URL is preserved."""
        url = "https://example.com/path?query=1"
        assert sanitize_url(url) == url
    
    def test_javascript_url_blocked(self):
        """Test javascript: URLs are blocked."""
        assert sanitize_url("javascript:alert(1)") == "#"
    
    def test_empty_url(self):
        """Test empty URL returns #."""
        assert sanitize_url("") == "#"
        assert sanitize_url(None) == "#"
    
    def test_url_length_limit(self):
        """Test URL length is limited."""
        long_url = "https://example.com/" + "a" * 3000
        result = sanitize_url(long_url)
        assert len(result) <= 2048


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

