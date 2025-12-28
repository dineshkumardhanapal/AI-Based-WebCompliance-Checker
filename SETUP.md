# Setup Guide

Complete setup instructions for the Web Compliance Checker application.

## Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| Python | 3.9+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Git | Any | [git-scm.com](https://git-scm.com/) (optional) |

### Verify Installation

```bash
python --version    # Should show 3.9+
pip --version       # Comes with Python
node --version      # Should show 18+
npm --version       # Comes with Node.js
```

## Step-by-Step Installation

### Step 1: Navigate to Project

```bash
cd "path/to/web-compliance-checker"
```

### Step 2: Backend Setup (Python/FastAPI)

```bash
cd backend

# Option A: Direct installation
pip install -r requirements.txt
playwright install chromium

# Option B: Using virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium
```

### Step 3: Configure Environment

```bash
cd backend

# Copy example environment file
# Windows PowerShell:
Copy-Item env.example.python .env
# Linux/Mac:
cp env.example.python .env
```

Edit `backend/.env`:

```env
# Required for AI recommendations (optional - uses templates if not set)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Server configuration
PORT=3001
NODE_ENV=development

# CORS (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate limiting
RATE_LIMIT_MAX=100
CHECK_RATE_LIMIT_MAX=20
```

**Get Replicate API Token:**
1. Visit [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Sign in or create account
3. Create new API token
4. Copy token (starts with `r8_`)

> **Note:** Without a Replicate API token, the app works but uses template-based recommendations instead of AI-generated ones.

### Step 4: Frontend Setup (Next.js)

```bash
cd frontend
npm install
```

### Step 5: Verify Installation

```bash
# Check Python packages
cd backend
pip list | grep -E "fastapi|playwright|replicate"

# Check Node packages
cd ../frontend
npm list next react tailwindcss
```

## Running the Application

You need **two terminal windows** - one for backend, one for frontend.

### Terminal 1: Backend Server

```bash
cd backend

# If using virtual environment, activate first:
# Windows: .\venv\Scripts\Activate.ps1
# Linux/Mac: source venv/bin/activate

python main.py
```

**Expected output:**
```
Starting Web Compliance Checker Backend (Python/FastAPI)...
INFO:     Uvicorn running on http://0.0.0.0:3001
INFO:     Application startup complete.
```

**API Documentation:**
- Swagger UI: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc

### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in xxxms
```

### Access Application

Open your browser: **http://localhost:3000**

## Troubleshooting

### Python Issues

**"python not found":**
- Use `python3` instead of `python`
- Add Python to PATH during installation
- Windows: Use `py` command

**pip install fails:**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Playwright browser fails:**
```bash
# Install with dependencies
playwright install chromium --with-deps

# On Linux, you may need:
sudo apt-get install -y libgbm1 libnss3 libatk-bridge2.0-0
```

### Node.js Issues

**npm install fails:**
```bash
# Clear cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Next.js dev fails:**
- Ensure port 3000 is free
- Check `npm run dev` output for errors

### Port Conflicts

**Port 3001 (backend) in use:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=3002
```

**Port 3000 (frontend) in use:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Connection Issues

**Frontend can't reach backend:**
1. Verify backend is running on port 3001
2. Check `frontend/next.config.mjs` has correct API rewrite
3. Look for CORS errors in browser console
4. Try accessing `http://localhost:3001/health` directly

**Windows-specific asyncio errors:**
The backend handles Windows event loop automatically. If issues persist:
- Ensure Python 3.9+
- Restart terminal after Python installation

## Production Setup

### Build Frontend

```bash
cd frontend
npm run build
```

### Environment Variables

Set for production:
```env
NODE_ENV=production
REPLICATE_API_TOKEN=your_production_token
ALLOWED_ORIGINS=https://your-domain.com
```

### Start Servers

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 3001
```

**Frontend:**
```bash
cd frontend
npm run start
```

### Deployment Options

| Service | Frontend | Backend |
|---------|----------|---------|
| Vercel | ✓ (recommended) | - |
| Railway | ✓ | ✓ |
| Render | ✓ | ✓ |
| AWS | ✓ | ✓ |
| Heroku | - | ✓ |

## Next Steps

After successful setup:
1. Test with a sample URL (e.g., `https://example.com`)
2. Review API docs at `http://localhost:3001/docs`
3. Check the main [README.md](README.md) for usage details
4. See [CHANGELOG.md](CHANGELOG.md) for recent updates

## Getting Help

1. Check troubleshooting sections above
2. Review [backend/README_PYTHON.md](backend/README_PYTHON.md) for backend details
3. Check browser console and terminal for error messages
4. Verify all environment variables are set correctly
