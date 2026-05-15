# ResumaApp Handover Document

## 1. Project Overview
ResumaApp is a professional resume builder specifically tailored for the UAE and GCC engineering markets. It features AI-powered optimization, impact scanning, and multi-template generation.

## 2. System Architecture
- **Frontend:** React 19 (Vite) with Tailwind CSS 4.
- **Backend (Legacy):** Node.js Express (Serving API and assets).
- **Backend (Current):** Python 3.11+ FastAPI (High-performance AI processing and market optimization).
- **Database:** PostgreSQL (Neon).
- **Authentication:** JWT (JSON Web Tokens).

---

## 3. API Inventory

### A. Frontend Services (React)
Located in `src/services/`.
- `aiService.js`: Direct integration with Google Gemini Pro.
- `aiCrystallizeService.js`: Integration with backend AI endpoints.
- `infraScanService.js`: Logic for scanning infrastructure engineering resumes.
- `resilientApi.js`: API wrapper with retry logic and health checks.

### B. Python API Endpoints (FastAPI)
Located in `app/api/`. Base URL: `http://localhost:8000` (Dev)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/resume/analyze` | `POST` | ATS scoring & UAE market fit analysis. |
| `/api/resume/optimize` | `POST` | AI-driven content rewriting for engineering roles. |
| `/api/linkedin/optimize` | `POST` | Headline and 'About' section optimization for GCC markets. |
| `/api/jobs/match` | `GET` | Compares resume against job description for keyword gaps. |
| `/api/export/csv` | `POST` | Generates a downloadable CSV of resume versions. |
| `/health` | `GET` | Service status and uptime. |

### C. Legacy Node.js API Endpoints
Located in `temp-repo/backend/index.js`. Base URL: `/api`

| Category | Endpoints |
| :--- | :--- |
| **Auth** | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/forgot-password` |
| **Data** | `/profile`, `/experience`, `/education`, `/skills`, `/projects`, `/achievements` |
| **AI** | `/ai/scan`, `/ai/crystallize`, `/ai/generate-cover-letter` |
| **Public** | `/public/:username`, `/public/:username/optimized/:templateName` |
| **Images** | `/upload` (Proxies to Cloudinary) |

---

## 4. External Integrations & API Keys

### A. AI Services
- **Google Gemini API:** Primary engine for `gemini-1.5-flash` and `gemini-pro`.
- **OpenAI API:** Fallback/Alternative for GPT-4o optimization.

### B. Image Storage (Image Buckets)
- **Cloudinary:** Used for storing user avatars and project portfolio images.
  - **Bucket Name:** Managed by Cloudinary (Cloud Name).
  - **Environment Variables:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### C. Communication
- **Resend:** SMTP/API for welcome emails and password resets.

---

## 5. Deployment Information
- **Build Tool:** Vite (`npm run build`) outputs to `dist/`.
- **Backend Deployment:** Python backend is ready for Render/Heroku via `render.yaml`.
- **Frontend Deployment:** Vercel/Netlify for SPA or Render for full-stack.

## 6. Development Setup
1. **Frontend:** `npm install` followed by `npm run dev`.
2. **Backend (Python):** `pip install -r requirements.txt` followed by `uvicorn app.main:app --reload`.
3. **Environment:** Copy `.env.example` to `.env` and populate keys.

---
**Handover Status:** Production Ready | **Last Updated:** May 2026
