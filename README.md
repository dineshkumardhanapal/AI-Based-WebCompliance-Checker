<p align="center">
  <img src="https://img.shields.io/badge/WCAG-2.1-blue?style=for-the-badge" alt="WCAG 2.1">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14">
  <img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.9+">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

<h1 align="center">🛡️ Web Compliance Checker</h1>

<p align="center">
  <strong>AI-Powered WCAG Accessibility Analyzer</strong>
  <br>
  <em>Ensure your website meets accessibility standards with instant analysis and smart recommendations</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-documentation">Docs</a> •
  <a href="#-api-reference">API</a>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 10 Compliance Checks
Comprehensive WCAG 2.1 accessibility analysis:
- Heading hierarchy validation
- Image alt text verification
- Color contrast checking
- Keyboard accessibility
- Skip links & ARIA landmarks
- Form label associations
- And more...

</td>
<td width="50%">

### 🤖 AI-Powered Recommendations
Get intelligent fix suggestions:
- Powered by OpenAI GPT-5
- Context-aware recommendations
- Actionable code suggestions
- Template fallback when offline

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Instant Analysis
Fast and reliable:
- Results in under 30 seconds
- Real-time progress tracking
- Detailed pass/fail reports
- Exportable as JSON or PDF

</td>
<td width="50%">

### 🎨 Modern UI/UX
Beautiful, accessible design:
- Dark mode support
- Responsive layout
- Glassmorphism effects
- Success celebrations 🎉

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| Python | 3.9+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Replicate API Token | - | [Get Token](https://replicate.com/account/api-tokens) *(optional)* |

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/web-compliance-checker.git
cd web-compliance-checker

# Terminal 1 - Backend Setup
cd backend
pip install -r requirements.txt
playwright install chromium
cp env.example.python .env  # Configure your API token
python main.py

# Terminal 2 - Frontend Setup
cd frontend
npm install
npm run dev
```

### 🌐 Open in Browser

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001 |
| **API Docs (Swagger)** | http://localhost:3001/docs |
| **API Docs (ReDoc)** | http://localhost:3001/redoc |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND          │  BACKEND           │  INFRASTRUCTURE   │
├────────────────────┼────────────────────┼───────────────────┤
│  Next.js 14        │  FastAPI 0.104     │  Playwright       │
│  React 18          │  Python 3.9+       │  Chromium         │
│  Tailwind CSS 3.4  │  Uvicorn (ASGI)    │  Replicate API    │
│  Lucide Icons      │  Pydantic 2.5      │  (OpenAI GPT-5)   │
│  React Hot Toast   │  slowapi           │                   │
│  jsPDF             │  dnspython         │                   │
└────────────────────┴────────────────────┴───────────────────┘
```

---

## 📋 The 10 Compliance Checks

| # | Check | WCAG | Description |
|:-:|-------|------|-------------|
| 1 | **Meaningful Reading Sequence** | 1.3.2 | Validates heading hierarchy (h1→h2→h3...) |
| 2 | **Sensory Cues** | 1.3.3 | Ensures images have alt text and elements have labels |
| 3 | **Color Usage** | 1.4.1 | Checks color contrast and color-only information |
| 4 | **Keyboard Accessibility** | 2.1.1 | Verifies all elements are keyboard accessible |
| 5 | **No Keyboard Traps** | 2.1.2 | Ensures navigation in/out of all sections |
| 6 | **Pointer Cancellation** | 2.5.2 | Validates hover actions work with click/tap |
| 7 | **Label-Name Matching** | 2.5.3 | Checks form inputs have proper labels |
| 8 | **Time Limits** | 2.2.1 | Detects timers needing user controls |
| 9 | **No Seizure Content** | 2.3.1 | Checks for rapid flashing (< 3/second) |
| 10 | **Skip Links** | 2.4.1 | Looks for skip links and ARIA landmarks |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| 📘 [README.md](./README.md) | Project overview and quick start |
| 🏗️ [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | Complete system architecture and design |
| 🔧 [SETUP.md](./SETUP.md) | Detailed installation guide |
| 🔒 [SECURITY.md](./SECURITY.md) | Security documentation |
| 📝 [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## 🔌 API Reference

### `POST /api/check`

Check a webpage for WCAG compliance.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "checks": [
    {
      "name": "Meaningful Reading Sequence",
      "passed": true,
      "details": "Document has a logical heading hierarchy.",
      "recommendation": null
    },
    {
      "name": "Not Relying Only on Sensory Cues",
      "passed": false,
      "details": "Found 2 image(s) without alt text.",
      "recommendation": "Add descriptive alt text to all images..."
    }
  ],
  "score": "8/10",
  "passedCount": 8,
  "totalCount": 10,
  "timestamp": "2024-12-13T10:30:00.000Z"
}
```

### `GET /health`

Health check endpoint.

```json
{
  "status": "ok",
  "message": "Web Compliance Checker API is running",
  "backend": "Python/FastAPI"
}
```

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/check` | 20 requests | 1 hour |
| Other endpoints | 100 requests | 15 minutes |

---

## 📁 Project Structure

```
web-compliance-checker/
├── 📂 backend/                     # Python/FastAPI Backend
│   ├── 📄 main.py                  # Application entry point
│   ├── 📂 app/
│   │   ├── 📂 routes/
│   │   │   └── compliance.py       # API endpoints
│   │   ├── 📂 services/
│   │   │   ├── compliance_checks.py    # WCAG checks
│   │   │   └── ai_recommender.py       # AI recommendations
│   │   ├── 📂 middleware/
│   │   │   └── security.py         # SSRF protection
│   │   └── 📂 utils/
│   │       └── playwright_helper.py    # Browser automation
│   ├── 📄 requirements.txt
│   └── 📄 env.example.python
│
├── 📂 frontend/                    # Next.js Frontend
│   ├── 📂 app/
│   │   ├── 📄 page.jsx             # Main page
│   │   ├── 📄 layout.jsx           # Root layout
│   │   ├── 📄 globals.css          # Global styles
│   │   └── 📂 components/          # 11 React components
│   ├── 📄 next.config.mjs
│   ├── 📄 tailwind.config.js
│   └── 📄 package.json
│
├── 📄 README.md                    # This file
├── 📄 SYSTEM_DESIGN.md             # Architecture documentation
├── 📄 SETUP.md                     # Installation guide
├── 📄 SECURITY.md                  # Security documentation
└── 📄 CHANGELOG.md                 # Version history
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` from the example file:

```env
# AI Recommendations (optional - falls back to templates)
REPLICATE_API_TOKEN=r8_your_token_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
RATE_LIMIT_MAX=100
CHECK_RATE_LIMIT_MAX=20
```

---

## 🐛 Troubleshooting

<details>
<summary><strong>Playwright fails to install</strong></summary>

```bash
# Install with system dependencies
playwright install chromium --with-deps
```
</details>

<details>
<summary><strong>Port already in use</strong></summary>

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```
</details>

<details>
<summary><strong>Windows asyncio errors</strong></summary>

The backend automatically sets the correct event loop policy for Windows. Ensure you're using Python 3.9+.
</details>

<details>
<summary><strong>npm install fails</strong></summary>

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```
</details>

<details>
<summary><strong>Can't connect to backend</strong></summary>

1. Verify backend is running on port 3001
2. Check `frontend/next.config.mjs` for API rewrite configuration
3. Check browser console for CORS errors
</details>

<details>
<summary><strong>Replicate API errors</strong></summary>

- Verify token in `backend/.env` (starts with `r8_`)
- Check Replicate account credits
- App falls back to template recommendations if API fails
</details>

---

## ⚠️ Limitations

| Limitation | Details |
|------------|---------|
| Simplified checks | Not a comprehensive WCAG audit tool |
| Color contrast | Complex cases require manual verification |
| Keyboard traps | Static analysis only (no dynamic testing) |
| AI latency | 5-15 seconds per failed check |
| Rate limiting | 20 checks per hour per IP |

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Test with various websites
- Update documentation as needed
- Maintain responsive design
- Follow accessibility best practices (practice what we preach!)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
- [Playwright](https://playwright.dev/) - Browser automation
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Replicate](https://replicate.com/) - AI model hosting

---

<p align="center">
  Made with ❤️ for web accessibility
  <br>
  <sub>Helping make the web accessible for everyone</sub>
</p>
