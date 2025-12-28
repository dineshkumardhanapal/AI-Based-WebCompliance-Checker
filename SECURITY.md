# Security Documentation

Security measures implemented in the Web Compliance Checker application.

## Security Features

### 1. SSRF (Server-Side Request Forgery) Protection

- **Internal IP Blocking**: All private IP ranges (RFC 1918) are blocked
  - 10.0.0.0/8
  - 172.16.0.0/12
  - 192.168.0.0/16
  - Localhost (127.0.0.0/8)
  - Link-local addresses (169.254.0.0/16)
  
- **DNS Resolution**: Hostnames resolved and checked against blocked ranges
- **Protocol Restrictions**: Only HTTP and HTTPS allowed
- **Localhost Blocking**: Explicit blocking of localhost variations

### 2. Input Validation and Sanitization

- **URL Validation**: Comprehensive URL format validation
- **Length Limits**: 
  - URL input: 2048 characters
  - Response fields truncated to prevent excessive output
- **Type Checking**: Pydantic models for strict type validation
- **Hostname Validation**: FQDN validation with TLD requirements

### 3. Rate Limiting

- **General Rate Limiting**: 100 requests per 15 minutes per IP (configurable)
- **Check Endpoint**: 20 requests per hour per IP (configurable)
- **Implementation**: Uses `slowapi` middleware for FastAPI
- **Headers**: Rate limit info included in response headers

### 4. CORS Configuration

- **Whitelist-Based**: Only specific origins allowed (configurable)
- **Development Mode**: Allows localhost origins
- **Methods**: Restricted to GET, POST, OPTIONS
- **Headers**: Restricted to Content-Type and Authorization

### 5. Security Headers

Added via middleware:
- **X-Frame-Options**: DENY - Prevents clickjacking
- **X-Content-Type-Options**: nosniff - Prevents MIME sniffing
- **X-XSS-Protection**: 1; mode=block - Additional XSS protection
- **Referrer-Policy**: strict-origin-when-cross-origin

### 6. Error Handling

- **Information Leakage Prevention**: Detailed errors only in development
- **Generic Error Messages**: Production errors don't expose internals
- **Error Logging**: Server-side logging without client exposure
- **Stack Traces**: Only shown in development

### 7. Playwright Security

- **Browser Sandbox**: Runs in headless mode with security flags
- **Resource Blocking**: Fonts, media, websockets blocked by default
- **Timeout Protection**: 30-second timeout for page loads
- **HTTPS Validation**: SSL errors are not ignored
- **Request Interception**: Unnecessary resources blocked

### 8. API Security

- **Replicate API**: 
  - Input sanitization for prompt injection prevention
  - Timeout protection (30 seconds)
  - Length limits on prompts and outputs
  - Error handling without exposing API details

### 9. XSS Prevention

- **React Escaping**: React auto-escapes content by default
- **Output Sanitization**: All user-controlled output sanitized
- **URL Sanitization**: URLs validated before display
- **Content Length Limits**: Truncated output prevents excessive data

### 10. DoS Protection

- **URL Length Limits**: 2048 character limit
- **Timeout Protection**: Multiple timeout layers (30-60 seconds)
- **Resource Limits**: Limited concurrent operations
- **Rate Limiting**: Prevents abuse

## Environment Variables

### Security Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `localhost:3000,3001` | CORS whitelist |
| `RATE_LIMIT_MAX` | `100` | Requests per 15 min |
| `CHECK_RATE_LIMIT_MAX` | `20` | Checks per hour |
| `NODE_ENV` | `development` | Affects error detail |

## Production Checklist

Before deploying:

- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with actual domains
- [ ] Review and adjust rate limits
- [ ] Ensure HTTPS is configured
- [ ] Set up logging and monitoring
- [ ] Add authentication for `/api/cleanup`
- [ ] Configure firewall rules
- [ ] Update dependencies regularly
- [ ] Set up backup/disaster recovery

## Best Practices

### For Developers

1. **Never trust user input**: Always validate and sanitize
2. **Keep dependencies updated**: Run `pip list --outdated` regularly
3. **Review logs**: Monitor for suspicious activity
4. **Test security**: Regular vulnerability testing
5. **Principle of least privilege**: Only allow what's necessary
6. **Use HTTPS in production**: Encrypt all traffic
7. **Implement authentication**: Add auth for production

### Dependency Updates

```bash
# Check for vulnerabilities
pip-audit

# Update packages
pip install --upgrade -r requirements.txt
```

## Reporting Security Issues

If you discover a vulnerability:
1. Do not create a public GitHub issue
2. Email security concerns privately
3. Allow time for the issue to be addressed

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Python Security Best Practices](https://python-security.readthedocs.io/)
