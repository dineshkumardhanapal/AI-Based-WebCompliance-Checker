# System Design Document

## Web Compliance Checker - AI-Powered WCAG Accessibility Analyzer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Component Design](#3-component-design)
4. [Data Flow](#4-data-flow)
5. [API Design](#5-api-design)
6. [Database & Storage](#6-database--storage)
7. [Security Architecture](#7-security-architecture)
8. [Performance & Scalability](#8-performance--scalability)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Technology Stack](#10-technology-stack)
11. [Error Handling & Resilience](#11-error-handling--resilience)
12. [Future Considerations](#12-future-considerations)

---

## 1. Executive Summary

### 1.1 Purpose

The Web Compliance Checker is a modern web application that analyzes websites for accessibility compliance with WCAG (Web Content Accessibility Guidelines) 2.1 standards. It provides instant analysis, AI-powered recommendations, and exportable reports.

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **10 Compliance Checks** | Comprehensive WCAG 2.1 accessibility analysis |
| **AI Recommendations** | GPT-5 powered contextual fix suggestions |
| **Real-time Analysis** | Results in under 30 seconds |
| **Export Options** | JSON and PDF report generation |
| **Check History** | Local storage of last 20 checks |
| **Dark Mode** | System preference detection |
| **Responsive Design** | Mobile-first approach |

### 1.3 System Goals

- **Performance**: < 30 second analysis time
- **Reliability**: 99.9% uptime target
- **Security**: SSRF protection, rate limiting, input sanitization
- **Accessibility**: The checker itself is WCAG 2.1 compliant
- **Usability**: No sign-up required, free forever

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTS                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Desktop   │  │   Mobile    │  │   Tablet    │  │   API       │             │
│  │   Browser   │  │   Browser   │  │   Browser   │  │   Client    │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                      │
│                           (Next.js 14 / React 18)                               │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         http://localhost:3000                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  URL Input  │  │   Results   │  │   History   │  │   Export    │      │   │
│  │  │  Component  │  │   Display   │  │   Sidebar   │  │   Actions   │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  Progress   │  │   Error     │  │   Empty     │  │   Success   │      │   │
│  │  │  Indicator  │  │   Handler   │  │   State     │  │  Celebration│      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                          API Proxy (/api/* → :3001)
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                       │
│                         (Python FastAPI + Uvicorn)                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         http://localhost:3001                             │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                         MIDDLEWARE STACK                             │ │   │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │ │   │
│  │  │  │  CORS   │→ │  Rate   │→ │Security │→ │  SSRF   │→ │  Error  │   │ │   │
│  │  │  │         │  │ Limiter │  │ Headers │  │ Filter  │  │ Handler │   │ │   │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                            ROUTES                                    │ │   │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │ │   │
│  │  │  │  POST /api/check │  │  GET /health    │  │ POST /api/cleanup│     │ │   │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                           SERVICES                                   │ │   │
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐                 │ │   │
│  │  │  │  Compliance Checker  │  │   AI Recommender     │                 │ │   │
│  │  │  │  (10 WCAG Checks)    │  │   (Replicate/GPT-5)  │                 │ │   │
│  │  │  └──────────────────────┘  └──────────────────────┘                 │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          BROWSER AUTOMATION LAYER                                │
│                              (Playwright + Chromium)                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                     Headless Chromium Browser                        │ │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │ │   │
│  │  │  │  Page Load  │→ │   DOM       │→ │Accessibility│                  │ │   │
│  │  │  │  & Render   │  │  Analysis   │  │    Tree     │                  │ │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘                  │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐                             │
│  │   Target Websites    │  │   Replicate API      │                             │
│  │   (URLs to analyze)  │  │   (OpenAI GPT-5)     │                             │
│  └──────────────────────┘  └──────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Pattern

The system follows a **Layered Architecture** pattern with clear separation of concerns:

| Layer | Responsibility | Technology |
|-------|---------------|------------|
| **Presentation** | UI rendering, user interaction | Next.js, React, Tailwind CSS |
| **API Gateway** | Request routing, proxy | Next.js API rewrites |
| **Application** | Business logic, orchestration | FastAPI, Python |
| **Service** | Compliance checks, AI recommendations | Custom services |
| **Infrastructure** | Browser automation, external APIs | Playwright, Replicate |

---

## 3. Component Design

### 3.1 Frontend Components

```
frontend/
├── app/
│   ├── page.jsx                    # Main application page
│   ├── layout.jsx                  # Root layout with metadata
│   ├── globals.css                 # Global styles & animations
│   ├── App.css                     # Component-specific styles
│   └── components/
│       ├── URLInput.jsx            # URL input form with validation
│       ├── ResultsDisplay.jsx      # Compliance results container
│       ├── RuleCheck.jsx           # Individual check result card
│       ├── ResultsActions.jsx      # Export, share, filter actions
│       ├── HistorySidebar.jsx      # Check history panel
│       ├── ProgressIndicator.jsx   # Real-time progress tracker
│       ├── LoadingSkeleton.jsx     # Loading state placeholder
│       ├── EnhancedError.jsx       # Error display with retry
│       ├── EmptyState.jsx          # Initial empty state
│       ├── SuccessCelebration.jsx  # Perfect score celebration
│       └── Tooltip.jsx             # Accessible tooltip component
```

#### Component Hierarchy

```
HomePage (page.jsx)
├── Navigation Header
│   └── Mobile Menu
├── Hero Section
│   └── Trust Indicators
├── Main Content
│   ├── URLInput
│   ├── ProgressIndicator + LoadingSkeleton (loading state)
│   ├── EnhancedError (error state)
│   ├── EmptyState (initial state)
│   └── ResultsDisplay (results state)
│       ├── Score Summary
│       ├── RuleCheck[] (10 checks)
│       │   └── Recommendation
│       ├── ResultsActions
│       │   ├── Export (JSON/PDF)
│       │   ├── Share
│       │   └── Filter
│       └── SuccessCelebration (10/10 score)
├── HistorySidebar (overlay)
├── Features Section
├── About Section
└── Footer
```

### 3.2 Backend Components

```
backend/
├── main.py                         # FastAPI application entry point
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   └── compliance.py           # API endpoints
│   ├── services/
│   │   ├── compliance_checks.py    # 10 WCAG compliance checks
│   │   └── ai_recommender.py       # AI recommendation generator
│   ├── middleware/
│   │   └── security.py             # SSRF protection, validation
│   └── utils/
│       └── playwright_helper.py    # Browser automation
```

#### Service Layer Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     ComplianceCheckService                       │
├─────────────────────────────────────────────────────────────────┤
│  run_compliance_checks(url: str) → Dict                         │
│    ├── analyze_webpage(url) → PageData                          │
│    ├── check_reading_sequence(page_data) → CheckResult          │
│    ├── check_sensory_only_cues(page_data) → CheckResult         │
│    ├── check_color_usage(page_data) → CheckResult               │
│    ├── check_keyboard_accessibility(page_data) → CheckResult    │
│    ├── check_keyboard_traps(page_data) → CheckResult            │
│    ├── check_pointer_cancellation(page_data) → CheckResult      │
│    ├── check_label_accessible_name_match(page_data) → CheckResult│
│    ├── check_time_limits(page_data) → CheckResult               │
│    ├── check_seizure_triggering_content(page_data) → CheckResult│
│    └── check_skip_links(page_data) → CheckResult                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     AIRecommenderService                         │
├─────────────────────────────────────────────────────────────────┤
│  generate_recommendations(failed_checks, url) → List[Rec]       │
│    ├── (API available) → Call Replicate GPT-5                   │
│    └── (API unavailable) → generate_template_recommendations()  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PlaywrightHelper                             │
├─────────────────────────────────────────────────────────────────┤
│  analyze_webpage(url: str) → Dict                               │
│    ├── Launch headless Chromium                                  │
│    ├── Navigate to URL (30s timeout)                            │
│    ├── Extract DOM elements                                      │
│    ├── Build accessibility tree                                  │
│    ├── Analyze interactive elements                              │
│    └── Return structured page data                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 The 10 WCAG Compliance Checks

| # | Check Name | WCAG Criterion | What It Analyzes |
|---|------------|----------------|------------------|
| 1 | Meaningful Reading Sequence | 1.3.2 | Heading hierarchy (h1-h6) |
| 2 | Sensory Cues | 1.3.3 | Alt text, ARIA labels |
| 3 | Color Usage | 1.4.1, 1.4.3 | Color contrast, color-only info |
| 4 | Keyboard Accessibility | 2.1.1 | Tab navigation, focus order |
| 5 | No Keyboard Trap | 2.1.2 | Escape from interactive areas |
| 6 | Pointer Cancellation | 2.5.2 | Hover/click behavior |
| 7 | Label-Name Matching | 2.5.3 | Form label associations |
| 8 | Time Limits | 2.2.1 | Timer controls |
| 9 | Seizure Content | 2.3.1 | Flash frequency analysis |
| 10 | Skip Links | 2.4.1 | Navigation bypass mechanisms |

---

## 4. Data Flow

### 4.1 Compliance Check Flow

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  User    │   │ Frontend │   │ Backend  │   │Playwright│   │  Target  │
│          │   │ (Next.js)│   │ (FastAPI)│   │(Chromium)│   │  Website │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │              │              │
     │ 1. Enter URL │              │              │              │
     │─────────────>│              │              │              │
     │              │              │              │              │
     │              │ 2. POST /api/check          │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │              │ 3. Validate URL (SSRF check)│
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │ 4. Launch browser           │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │              │ 5. Fetch page│
     │              │              │              │─────────────>│
     │              │              │              │              │
     │              │              │              │ 6. HTML + CSS│
     │              │              │              │<─────────────│
     │              │              │              │              │
     │              │              │ 7. Page data + a11y tree    │
     │              │              │<─────────────│              │
     │              │              │              │              │
     │              │              │ 8. Run 10 compliance checks │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │ 9. Generate AI recommendations
     │              │              │─────────────> (Replicate API)
     │              │              │              │              │
     │              │ 10. Results JSON            │              │
     │              │<─────────────│              │              │
     │              │              │              │              │
     │ 11. Display  │              │              │              │
     │<─────────────│              │              │              │
     │              │              │              │              │
     │ 12. Save to localStorage    │              │              │
     │              │              │              │              │
```

### 4.2 Data Structures

#### Request: POST /api/check

```json
{
  "url": "https://example.com"
}
```

#### Response: Compliance Results

```json
{
  "url": "https://example.com",
  "checks": [
    {
      "name": "Meaningful Reading Sequence",
      "passed": true,
      "details": "Document has a logical heading hierarchy with proper h1-h6 structure.",
      "recommendation": null
    },
    {
      "name": "Not Relying Only on Sensory Cues",
      "passed": false,
      "details": "Found 3 image(s) without alt text.",
      "recommendation": "Add descriptive alt text to all images. Screen readers rely on alt text to convey image content to users with visual impairments."
    }
    // ... 8 more checks
  ],
  "score": "8/10",
  "passedCount": 8,
  "totalCount": 10,
  "timestamp": "2024-12-13T10:30:00.000Z"
}
```

#### Page Data (Internal)

```json
{
  "html": "<html>...</html>",
  "accessibilityTree": { /* Chromium accessibility snapshot */ },
  "pageData": {
    "interactiveElements": [
      {
        "tag": "button",
        "id": "submit-btn",
        "text": "Submit",
        "tabIndex": 0,
        "ariaLabel": "Submit form",
        "role": "button",
        "disabled": false
      }
    ],
    "images": [
      { "src": "logo.png", "alt": "Company Logo", "hasAlt": true }
    ],
    "headings": [
      { "level": 1, "text": "Welcome", "id": "main-heading" }
    ],
    "formInputs": [
      { "type": "email", "id": "email", "label": "Email Address" }
    ],
    "links": [
      { "href": "#main", "text": "Skip to content", "isSkipLink": true }
    ],
    "hasLandmarks": true,
    "hasTimers": false,
    "hasAutoAdvance": false,
    "animations": 5
  },
  "styles": "/* CSS rules */"
}
```

---

## 5. API Design

### 5.1 RESTful Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/check` | Run compliance check | 20/hour |
| `GET` | `/health` | Health check | 100/15min |
| `GET` | `/` | API info | 100/15min |
| `POST` | `/api/cleanup` | Close browser (admin) | Protected |

### 5.2 API Documentation

Auto-generated OpenAPI documentation available at:
- **Swagger UI**: http://localhost:3001/docs
- **ReDoc**: http://localhost:3001/redoc

### 5.3 Error Responses

```json
// 400 Bad Request
{
  "detail": "URL is required and must be a string"
}

// 400 Bad Request (SSRF)
{
  "detail": "Private/internal IP addresses are not allowed"
}

// 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retry_after": 3600
}

// 504 Gateway Timeout
{
  "detail": "Request timeout - analysis took too long"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "message": "Failed to analyze webpage" // Dev only
}
```

---

## 6. Database & Storage

### 6.1 Storage Strategy

This application uses a **stateless architecture** with client-side storage:

| Storage Type | Location | Purpose | Retention |
|--------------|----------|---------|-----------|
| **Check Results** | localStorage | Last check result | Until cleared |
| **Check History** | localStorage | Last 20 checks | Manual clear |
| **User Preferences** | System | Dark mode | System pref |

### 6.2 localStorage Schema

```javascript
// Last check result
localStorage.setItem('lastCheckResult', JSON.stringify({
  url: "https://example.com",
  checks: [...],
  score: "8/10",
  timestamp: "2024-12-13T10:30:00.000Z"
}));

// Check history (array, max 20 items)
localStorage.setItem('checkHistory', JSON.stringify([
  {
    id: "1702464600000-abc123def",
    url: "https://example.com",
    score: "8/10",
    passedCount: 8,
    totalCount: 10,
    timestamp: "2024-12-13T10:30:00.000Z",
    checks: [...]
  }
  // ... up to 19 more
]));
```

### 6.3 Future Database Considerations

For production scaling, consider:

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Options                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL/MySQL     │ User accounts, persistent history   │
│  Redis                │ Rate limiting, session cache        │
│  MongoDB              │ Flexible check result storage       │
│  S3/CloudStorage      │ PDF report storage                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Network                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • CORS whitelist (allowed origins only)                     ││
│  │ • HTTPS enforcement (production)                            ││
│  │ • Rate limiting (slowapi middleware)                        ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: Input Validation                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • URL format validation (urlparse)                          ││
│  │ • Length limits (2048 chars max)                            ││
│  │ • Protocol whitelist (http/https only)                      ││
│  │ • Pydantic model validation                                 ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: SSRF Protection                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • Private IP range blocking (RFC 1918)                      ││
│  │ • Localhost blocking (127.0.0.0/8, ::1)                     ││
│  │ • DNS resolution verification                               ││
│  │ • Link-local address blocking (169.254.0.0/16)              ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: Response Security                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • X-Frame-Options: DENY                                     ││
│  │ • X-Content-Type-Options: nosniff                           ││
│  │ • X-XSS-Protection: 1; mode=block                           ││
│  │ • Referrer-Policy: strict-origin-when-cross-origin          ││
│  │ • Output sanitization (XSS prevention)                      ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Layer 5: Error Handling                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ • Generic error messages (production)                       ││
│  │ • No stack trace exposure                                   ││
│  │ • Sanitized logging                                         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 SSRF Protection Flow

```
                  ┌─────────────────┐
                  │  Incoming URL   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Parse URL       │
                  │ (urlparse)      │
                  └────────┬────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌─────────────────┐      ┌─────────────────┐
     │ Protocol Check  │      │ Hostname Check  │
     │ http/https only │      │ Not localhost   │
     └────────┬────────┘      └────────┬────────┘
              │                         │
              │         ┌───────────────┘
              │         │
              ▼         ▼
     ┌─────────────────────────────┐
     │   DNS Resolution            │
     │   Resolve hostname → IPs    │
     └────────────┬────────────────┘
                  │
                  ▼
     ┌─────────────────────────────┐
     │   IP Range Check            │──────┐
     │   Against blocked ranges:   │      │
     │   • 10.0.0.0/8             │      │ BLOCKED
     │   • 172.16.0.0/12          │      │    ↓
     │   • 192.168.0.0/16         │      │ Return 400
     │   • 127.0.0.0/8            │      │
     │   • 169.254.0.0/16         │      │
     └────────────┬────────────────┘      │
                  │                        │
                  │ ALLOWED                │
                  ▼                        │
     ┌─────────────────────────────┐      │
     │   Proceed to Playwright     │<─────┘
     │   Analysis                  │
     └─────────────────────────────┘
```

### 7.3 Rate Limiting Configuration

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `/api/check` | 20 requests | 1 hour | IP address |
| `/*` (general) | 100 requests | 15 minutes | IP address |

---

## 8. Performance & Scalability

### 8.1 Current Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Analysis Time | < 30s | 10-30s |
| API Response | < 100ms | ~50ms |
| Page Load | < 2s | ~1s |
| Memory Usage | < 512MB | ~300MB |

### 8.2 Timeout Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                     TIMEOUT LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│  Playwright page load:     30 seconds                        │
│  Compliance check:         60 seconds                        │
│  AI recommendations:       45 seconds (per check)            │
│  Replicate API call:       30 seconds                        │
│  Overall request:          120 seconds                       │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Browser Resource Management

```python
# Playwright optimization settings
browser = chromium.launch(
    headless=True,
    args=[
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
    ]
)
```

### 8.4 Scalability Considerations

#### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCALED ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      ┌───────────────┐                          │
│                      │ Load Balancer │                          │
│                      │   (nginx)     │                          │
│                      └───────┬───────┘                          │
│                              │                                   │
│          ┌───────────────────┼───────────────────┐              │
│          │                   │                   │              │
│          ▼                   ▼                   ▼              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  Backend #1   │  │  Backend #2   │  │  Backend #3   │       │
│  │  + Playwright │  │  + Playwright │  │  + Playwright │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│                                                                  │
│                      ┌───────────────┐                          │
│                      │    Redis      │                          │
│                      │ (Rate Limits) │                          │
│                      └───────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Queue-Based Architecture (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                   QUEUE-BASED SCALING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────────────┐  │
│  │ API     │───>│ Queue   │───>│ Worker Pool                 │  │
│  │ Server  │    │ (Redis) │    │ (Playwright instances)      │  │
│  └─────────┘    └─────────┘    │  ┌─────┐ ┌─────┐ ┌─────┐   │  │
│       │                         │  │ W1  │ │ W2  │ │ W3  │   │  │
│       │                         │  └─────┘ └─────┘ └─────┘   │  │
│       ▼                         └─────────────────────────────┘  │
│  WebSocket                                     │                 │
│  (Progress updates)                            ▼                 │
│                                        ┌───────────────┐         │
│                                        │   Results     │         │
│                                        │   (Callback)  │         │
│                                        └───────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Deployment Architecture

### 9.1 Development Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Terminal 1:                    Terminal 2:                      │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │  cd backend         │       │  cd frontend        │          │
│  │  python main.py     │       │  npm run dev        │          │
│  │  → localhost:3001   │       │  → localhost:3000   │          │
│  └─────────────────────┘       └─────────────────────┘          │
│                                                                  │
│  Browser: http://localhost:3000                                  │
│  API Docs: http://localhost:3001/docs                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Production Deployment Options

#### Option A: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
      - ALLOWED_ORIGINS=https://yourdomain.com
```

#### Option B: Cloud Platform

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD DEPLOYMENT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend:                     Backend:                          │
│  ┌─────────────────────┐       ┌─────────────────────┐          │
│  │  Vercel / Netlify   │       │  Railway / Render   │          │
│  │  (Static + SSR)     │       │  (Docker + Python)  │          │
│  └─────────────────────┘       └─────────────────────┘          │
│           │                             │                        │
│           └─────────────┬───────────────┘                        │
│                         │                                        │
│                         ▼                                        │
│                ┌─────────────────────┐                          │
│                │   Cloudflare CDN    │                          │
│                │   (SSL + Cache)     │                          │
│                └─────────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Environment Configuration

```bash
# Backend (.env)
NODE_ENV=production
PORT=3001
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_MAX=100
CHECK_RATE_LIMIT_MAX=20
```

---

## 10. Technology Stack

### 10.1 Complete Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND                                                        │
│  ─────────────────────────────────────────────────────────────  │
│  Framework:      Next.js 14 (React 18)                          │
│  Styling:        Tailwind CSS 3.4                               │
│  HTTP Client:    Axios 1.6                                      │
│  Icons:          Lucide React 0.294                             │
│  Charts:         Recharts 2.10                                  │
│  PDF Export:     jsPDF 2.5                                      │
│  Notifications:  React Hot Toast 2.4                            │
│                                                                  │
│  BACKEND                                                         │
│  ─────────────────────────────────────────────────────────────  │
│  Framework:      FastAPI 0.104                                  │
│  Server:         Uvicorn 0.24 (ASGI)                            │
│  Validation:     Pydantic 2.5                                   │
│  Rate Limiting:  slowapi 0.1.9                                  │
│  DNS:            dnspython 2.4                                  │
│                                                                  │
│  BROWSER AUTOMATION                                              │
│  ─────────────────────────────────────────────────────────────  │
│  Library:        Playwright 1.40                                │
│  Browser:        Chromium (headless)                            │
│                                                                  │
│  AI/ML                                                           │
│  ─────────────────────────────────────────────────────────────  │
│  Provider:       Replicate API                                  │
│  Model:          OpenAI GPT-5                                   │
│                                                                  │
│  DEVELOPMENT                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  Python:         3.9+                                           │
│  Node.js:        18+                                            │
│  Package Mgmt:   pip, npm                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Dependency Graph

```
Frontend (package.json)
├── next@14.2.5
│   ├── react@18.2.0
│   └── react-dom@18.2.0
├── axios@1.6.2
├── lucide-react@0.294.0
├── jspdf@2.5.1
├── react-hot-toast@2.4.1
├── recharts@2.10.3
├── tailwindcss@3.4.10 (dev)
├── postcss@8.4.47 (dev)
└── eslint-config-next@14.2.5 (dev)

Backend (requirements.txt)
├── fastapi@0.104.1
│   └── pydantic@2.5.0
├── uvicorn[standard]@0.24.0
├── slowapi@0.1.9
├── playwright@1.40.0
├── replicate@0.25.0
├── dnspython@2.4.2
└── python-dotenv@1.0.0
```

---

## 11. Error Handling & Resilience

### 11.1 Error Classification

| Category | HTTP Status | Handling Strategy |
|----------|-------------|-------------------|
| Validation | 400 | Return specific error message |
| Security | 400 | Return generic "not allowed" message |
| Rate Limit | 429 | Return retry-after header |
| Timeout | 504 | Return timeout message |
| Server Error | 500 | Log details, return generic message |

### 11.2 Frontend Error Handling

```javascript
// Error type classification
const determineErrorType = (errorMessage) => {
  const message = errorMessage.toLowerCase();
  if (message.includes('network')) return 'network';
  if (message.includes('invalid url')) return 'validation';
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('server')) return 'server';
  return 'generic';
};

// User-friendly error display
<EnhancedError 
  error={error} 
  onRetry={handleRetry}
  type={errorType}
/>
```

### 11.3 Backend Error Handling

```python
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    is_development = os.getenv("NODE_ENV") == "development"
    
    # Log full error server-side
    logger.error(f"{exc.__class__.__name__}: {exc}")
    
    # Return sanitized error to client
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if is_development else "An error occurred"
        }
    )
```

### 11.4 Fallback Strategies

```
┌─────────────────────────────────────────────────────────────────┐
│                    FALLBACK CHAIN                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AI Recommendations:                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ Replicate    │───>│ Timeout/     │───>│ Template     │       │
│  │ GPT-5 API    │    │ Error        │    │ Fallback     │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
│  Page Analysis:                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ Full         │───>│ Network      │───>│ Error with   │       │
│  │ Analysis     │    │ Idle Wait    │    │ Partial Data │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Future Considerations

### 12.1 Feature Roadmap

| Phase | Feature | Description |
|-------|---------|-------------|
| **v2.1** | User Accounts | Persistent history, saved reports |
| **v2.2** | Scheduled Checks | Automated periodic compliance monitoring |
| **v2.3** | Batch Analysis | Check multiple URLs at once |
| **v2.4** | API Access | Public API for integrations |
| **v3.0** | Full WCAG 2.2 | Complete standard coverage |

### 12.2 Technical Improvements

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUTURE ENHANCEMENTS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Performance:                                                    │
│  • WebSocket for real-time progress                             │
│  • Redis caching for repeated checks                            │
│  • CDN for static assets                                        │
│  • Browser pooling for faster analysis                          │
│                                                                  │
│  Features:                                                       │
│  • Color contrast ratio calculation                             │
│  • Keyboard navigation simulation                               │
│  • CSS animation frequency analysis                             │
│  • PDF accessibility checking                                   │
│                                                                  │
│  Integration:                                                    │
│  • GitHub Action for CI/CD checks                               │
│  • Slack/Teams notifications                                    │
│  • Jira ticket creation                                         │
│  • Chrome extension                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Metrics:         Prometheus + Grafana                          │
│  Logging:         ELK Stack (Elasticsearch, Logstash, Kibana)   │
│  Tracing:         Jaeger / OpenTelemetry                        │
│  Alerting:        PagerDuty / Opsgenie                          │
│  Uptime:          Pingdom / Better Uptime                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Appendix

### A. File Structure

```
web-compliance-checker/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── env.example.python
│   ├── README_PYTHON.md
│   └── app/
│       ├── __init__.py
│       ├── routes/
│       │   ├── __init__.py
│       │   └── compliance.py
│       ├── services/
│       │   ├── __init__.py
│       │   ├── compliance_checks.py
│       │   └── ai_recommender.py
│       ├── middleware/
│       │   ├── __init__.py
│       │   └── security.py
│       └── utils/
│           ├── __init__.py
│           └── playwright_helper.py
├── frontend/
│   ├── app/
│   │   ├── page.jsx
│   │   ├── layout.jsx
│   │   ├── globals.css
│   │   ├── App.css
│   │   └── components/
│   │       └── [11 React components]
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── README.md
├── SETUP.md
├── SECURITY.md
├── CHANGELOG.md
└── SYSTEM_DESIGN.md (this document)
```

### B. Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 3001 | http://localhost:3001 |
| API Docs | 3001 | http://localhost:3001/docs |

### C. Related Documents

- [README.md](./README.md) - Project overview and quick start
- [SETUP.md](./SETUP.md) - Detailed installation guide
- [SECURITY.md](./SECURITY.md) - Security documentation
- [CHANGELOG.md](./CHANGELOG.md) - Version history

---

*Document Version: 1.0.0*  
*Last Updated: December 2024*  
*Author: System Architecture Team*

