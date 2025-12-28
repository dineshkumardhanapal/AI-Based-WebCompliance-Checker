# Backend - Python/FastAPI

The Python/FastAPI backend for Web Compliance Checker.

## Features

- **FastAPI**: Modern async web framework with automatic API docs
- **Playwright**: Browser automation for webpage analysis
- **Replicate API**: AI-powered recommendations (OpenAI GPT-5)
- **Async/Await**: Full async support for performance
- **Type Safety**: Python type hints throughout
- **Security**: SSRF protection, input validation, rate limiting

## Quick Start

```bash
cd backend

# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Configure environment
cp env.example.python .env
# Edit .env and add your REPLICATE_API_TOKEN

# Run server
python main.py
```

Server runs on `http://localhost:3001`

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Playwright Browser

```bash
playwright install chromium
```

### 3. Configure Environment

```bash
cp env.example.python .env
```

Edit `.env`:
```env
REPLICATE_API_TOKEN=your_token_here  # Optional
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Run Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 3001
```

## API Documentation

FastAPI auto-generates interactive documentation:

- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

## Project Structure

```
backend/
├── main.py                      # FastAPI app entry point
├── app/
│   ├── routes/
│   │   └── compliance.py        # API endpoints
│   ├── services/
│   │   ├── compliance_checks.py # WCAG compliance checks
│   │   └── ai_recommender.py    # AI recommendation generation
│   ├── middleware/
│   │   └── security.py          # SSRF protection, validation
│   └── utils/
│       └── playwright_helper.py # Browser automation
├── requirements.txt             # Python dependencies
└── env.example.python           # Environment template
```

## API Endpoints

### Health Check

```http
GET /health
```

Returns server status.

### Compliance Check

```http
POST /api/check
Content-Type: application/json

{
  "url": "https://example.com"
}
```

Analyzes a website for WCAG compliance.

**Response:**
```json
{
  "url": "https://example.com",
  "checks": [...],
  "score": "8/10",
  "passedCount": 8,
  "totalCount": 10,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Cleanup

```http
POST /api/cleanup
```

Closes browser resources.

## Windows Compatibility

The backend automatically handles Windows-specific asyncio issues for Playwright. The `main.py` sets the correct event loop policy before any async operations.

If you encounter `NotImplementedError` with subprocess operations:
1. Ensure Python 3.9+
2. Restart terminal
3. Run `python main.py` (not uvicorn directly)

## Dependencies

| Package | Purpose |
|---------|---------|
| fastapi | Web framework |
| uvicorn | ASGI server |
| playwright | Browser automation |
| replicate | AI API client |
| slowapi | Rate limiting |
| dnspython | DNS resolution |
| python-dotenv | Environment variables |
| pydantic | Data validation |

## Troubleshooting

### Playwright Issues

**Browser not installed:**
```bash
playwright install chromium
```

**Missing system dependencies (Linux):**
```bash
playwright install chromium --with-deps
```

### Port Conflicts

```bash
# Change port
PORT=3002 python main.py
```

### API Token Issues

- Token starts with `r8_`
- Get from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
- Without token, uses template recommendations (still works)

## Performance

FastAPI provides excellent async performance. Tips:
- Browser instances are reused
- Async I/O for API calls
- Rate limiting prevents abuse
- Timeout handling for slow sites

## Code Style

Recommended tools:
- `black` - Code formatting
- `mypy` - Type checking
- `pylint` or `flake8` - Linting

```bash
# Format code
black .

# Type check
mypy .
```
