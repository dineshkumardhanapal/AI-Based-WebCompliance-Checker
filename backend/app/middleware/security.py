"""
Security Middleware

Implements security best practices including SSRF protection,
input validation, and security headers.
"""

import socket
import ipaddress
from urllib.parse import urlparse
import re
from typing import Dict, Any, Optional
import dns.resolver
import asyncio

# Blocked IP ranges for SSRF protection
BLOCKED_IP_RANGES = [
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
]

def is_blocked_ip(ip: str) -> bool:
    """Check if IP is in blocked range"""
    try:
        ip_addr = ipaddress.ip_address(ip)
        for blocked_range in BLOCKED_IP_RANGES:
            if ip_addr in blocked_range:
                return True
        return False
    except ValueError:
        return True  # Invalid IP is considered blocked

async def resolve_hostname(hostname: str) -> list:
    """Resolve hostname to IP addresses"""
    try:
        # Try IPv4 first
        result = dns.resolver.resolve(hostname, "A")
        return [str(rdata) for rdata in result]
    except Exception:
        try:
            # Try IPv6
            result = dns.resolver.resolve(hostname, "AAAA")
            # For now, we'll be conservative with IPv6
            return []
        except Exception:
            return []

async def validate_url(url_string: str) -> Dict[str, Any]:
    """
    Validate URL and check for SSRF vulnerabilities.
    
    Args:
        url_string: URL string to validate
        
    Returns:
        Dictionary with 'valid' boolean and 'url' or 'error' key
    """
    # Basic validation
    if not url_string or not isinstance(url_string, str):
        return {"valid": False, "error": "URL is required and must be a string"}
    
    # Length check to prevent DoS
    if len(url_string) > 2048:
        return {"valid": False, "error": "URL is too long (max 2048 characters)"}
    
    # Validate URL format
    try:
        parsed_url = urlparse(url_string)
    except Exception:
        return {"valid": False, "error": "Invalid URL format"}
    
    # Only allow http and https protocols
    if parsed_url.scheme not in ["http", "https"]:
        return {"valid": False, "error": "Only HTTP and HTTPS protocols are allowed"}
    
    # Validate hostname
    hostname = parsed_url.hostname
    if not hostname:
        return {"valid": False, "error": "Invalid hostname format"}
    
    # Check for localhost variations
    localhost_patterns = [
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "::1",
        "[::1]",
        "0:0:0:0:0:0:0:1",
    ]
    
    if hostname.lower() in localhost_patterns:
        return {"valid": False, "error": "Localhost and local IPs are not allowed"}
    
    # Check if hostname is an IP address
    try:
        ip_addr = ipaddress.ip_address(hostname)
        if is_blocked_ip(hostname):
            return {"valid": False, "error": "Private/internal IP addresses are not allowed"}
        # Allow public IPs
        return {"valid": True, "url": parsed_url}
    except ValueError:
        # Not an IP address, continue with hostname validation
        pass
    
    # Validate hostname format (basic FQDN check)
    if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$', hostname):
        return {"valid": False, "error": "Invalid hostname format"}
    
    # Resolve hostname and check IP addresses
    try:
        addresses = await resolve_hostname(hostname)
        for ip in addresses:
            if is_blocked_ip(ip):
                return {"valid": False, "error": "Resolved to private/internal IP address"}
    except Exception as error:
        # If DNS resolution fails, we'll still allow it but log a warning
        # In production, you might want to be more strict
        print(f"DNS resolution failed for {hostname}: {error}")
    
    # Check for suspicious patterns
    suspicious_patterns = [
        re.compile(r'^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'),  # IP-like hostnames
    ]
    
    for pattern in suspicious_patterns:
        if pattern.match(hostname):
            try:
                ipaddress.ip_address(hostname)
            except ValueError:
                return {"valid": False, "error": "Suspicious hostname pattern detected"}
    
    return {"valid": True, "url": parsed_url}

def sanitize_input(input_str: str) -> str:
    """
    Sanitize string input to prevent XSS.
    
    Args:
        input_str: Input string to sanitize
        
    Returns:
        Sanitized string
    """
    if not isinstance(input_str, str):
        return str(input_str)
    # Remove potentially dangerous characters
    return input_str.replace("<", "").replace(">", "").strip()[:10000]

def sanitize_url(url: str) -> str:
    """
    Sanitize URL for display (prevents XSS in links).
    
    Args:
        url: URL string to sanitize
        
    Returns:
        Sanitized URL or '#'
    """
    if not url or not isinstance(url, str):
        return "#"
    # Basic validation - ensure it starts with http:// or https://
    if not re.match(r'^https?://', url, re.IGNORECASE):
        return "#"
    # Truncate to prevent extremely long URLs
    return url[:2048]

