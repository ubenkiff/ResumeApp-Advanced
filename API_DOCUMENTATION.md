# ResumeApp - Complete API Documentation

## Base URLs
- **Main Backend (Python/FastAPI):** `http://localhost:8000` or `https://resuma-api.onrender.com`
- **Legacy Backend (Node.js):** `http://localhost:3000/api`
- **Production Frontend:** `https://resumeapp.onrender.com`

## 1. ENGINEERING OPTIMIZATION (Python API)
These endpoints are optimized for UAE/GCC engineering metrics.

### POST /api/resume/analyze
Analyzes ATS performance and UAE market fit.

### POST /api/resume/optimize
AI-powered resume rewriting for specific roles and industries.

### POST /api/linkedin/optimize
Optimizes LinkedIn headlines and 'About' sections for visibility.

### GET /api/jobs/match
Compares resume content against job descriptions.

### POST /api/export/csv
Exports resume versions into a CSV file.

---

## 2. AUTHENTICATION ENDPOINTS

### POST /api/auth/register
Register a new user

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "token": "string"
}
```

### POST /api/auth/login
Login existing user

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "subscription_status": "free|premium",
  "token": "string"
}
```

### GET /api/auth/me
Get current user profile (Protected)

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "subscription_status": "free|premium",
  "created_at": "timestamp"
}
```

### PUT /api/auth/profile
Update user profile (Protected)

**Request:**
```json
{
  "username": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string"
}
```

### PUT /api/auth/password
Change password (Protected)

**Request:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### POST /api/auth/forgot-password
Request password reset

**Request:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "message": "Reset link sent to email"
}
```

### POST /api/auth/reset-password
Reset password with token

**Request:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

## 2. PROFILE ENDPOINTS
### GET /api/profile
Get user profile (Protected)

**Response:**
```json
{
  "fullName": "string",
  "title": "string",
  "summary": "string",
  "location": "string",
  "phone": "string",
  "email": "string",
  "linkedin": "string",
  "avatar": "string (URL)",
  "career_level": "executive|senior|mid|junior|graduate|intern",
  "template_style": "professional|modern|minimal",
  "executive_summary": "string",
  "core_competencies": ["string"]
}
```

### PUT /api/profile
Update user profile (Protected)

**Request:** Same structure as GET response

### POST /api/profile/upload-avatar
Upload profile picture (Protected)

**Request:** multipart/form-data with 'avatar' file

**Response:**
```json
{
  "avatar": "string (cloudinary URL)"
}
```

## 3. EXPERIENCE ENDPOINTS
### GET /api/experience
Get all experience entries (Protected)

**Response:**
```json
[
  {
    "id": "number",
    "company": "string",
    "title": "string",
    "description": "string",
    "startDate": "string",
    "endDate": "string|null",
    "current": "boolean"
  }
]
```

### POST /api/experience
Add experience entry (Protected)

**Request:**
```json
{
  "company": "string",
  "title": "string",
  "description": "string",
  "startDate": "string",
  "endDate": "string|null",
  "current": "boolean"
}
```

### PUT /api/experience/:id
Update experience entry (Protected)

### DELETE /api/experience/:id
Delete experience entry (Protected)

## 4. EDUCATION ENDPOINTS
### GET /api/education
Get all education entries (Protected)

**Response:**
```json
[
  {
    "id": "number",
    "degree": "string",
    "institution": "string",
    "year": "string",
    "description": "string"
  }
]
```

### POST /api/education
Add education entry (Protected)

### PUT /api/education/:id
Update education entry (Protected)

### DELETE /api/education/:id
Delete education entry (Protected)

## 5. SKILLS ENDPOINTS
### GET /api/skills
Get all skills (Protected)

**Response:**
```json
["string"]
```

### POST /api/skills
Add skill (Protected)

**Request:**
```json
{
  "skill": "string"
}
```

### DELETE /api/skills/:id
Delete skill (Protected)

## 6. PROJECTS ENDPOINTS
### GET /api/projects
Get all projects (Protected)

**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "description": "string",
    "link": "string",
    "technologies": ["string"]
  }
]
```

### POST /api/projects
Add project (Protected)

### PUT /api/projects/:id
Update project (Protected)

### DELETE /api/projects/:id
Delete project (Protected)

## 7. ACHIEVEMENTS ENDPOINTS
### GET /api/achievements
Get all achievements (Protected)

**Response:**
```json
[
  {
    "id": "number",
    "title": "string",
    "description": "string",
    "date": "string"
  }
]
```

### POST /api/achievements
Add achievement (Protected)

### PUT /api/achievements/:id
Update achievement (Protected)

### DELETE /api/achievements/:id
Delete achievement (Protected)

## 8. AI & SCANNER ENDPOINTS
### POST /api/ai/scan
Scan profile text for impact metrics (Protected)

**Request:**
```json
{
  "text": "string (LinkedIn profile text)"
}
```

**Response:**
```json
{
  "score": 0-100,
  "benchmarks": {
    "leadershipLanguage": { "passed": true, "found": ["string"] },
    "keywordDensity": { "passed": true, "percentage": 0-10 },
    "achievementMetrics": { "passed": false, "found": 0, "required": 3 },
    "sectionCompleteness": { "passed": true, "completed": 0, "total": 6 },
    "actionVerbVariety": { "passed": true, "unique": 0 }
  },
  "extractedProfile": {
    "fullName": "string",
    "headline": "string",
    "location": "string",
    "about": "string",
    "experience": [
      {
        "company": "string",
        "title": "string",
        "dates": "string",
        "bullets": ["string"]
      }
    ],
    "skills": ["string"]
  }
}
```

### POST /api/ai/crystallize
Transform profile data for specific template (Protected)

**Request:**
```json
{
  "templateType": "executive|professional|modern|minimal",
  "profileData": {}
}
```

**Response:**
```json
{
  "transformedContent": {},
  "message": "Crystallization complete"
}
```

### POST /api/ai/generate-cover-letter
Generate cover letter (Protected)

**Request:**
```json
{
  "jobTitle": "string",
  "companyName": "string",
  "jobDescription": "string"
}
```

**Response:**
```json
{
  "coverLetter": "string"
}
```

## 9. RESUME ENDPOINTS
### GET /api/resume/public/:username
Get public resume data (Public)

**Response:** Full profile, experience, education, skills, projects, achievements

### GET /api/resume/ats/:username
Get ATS-optimized resume (Public)

**Response:** Simplified, text-only version

### POST /api/resume/save-optimized
Save AI-optimized version (Protected)

**Request:**
```json
{
  "templateType": "string",
  "optimizedData": {}
}
```

### GET /api/resume/optimized/:userId/:templateType
Get saved optimized version (Protected)

## 10. USER OPTIMIZED RESUMES (New Table)
### GET /api/optimized/:userId/:templateType
Get optimized resume by user and template (Protected)

### POST /api/optimized/save
Save optimized version (Protected)

### DELETE /api/optimized/:id
Delete optimized version (Protected)

## 11. HEALTH & MONITORING
### GET /api/health
Full health check

**Response:**
```json
{
  "status": "healthy|degraded",
  "timestamp": "timestamp",
  "uptime": 3600,
  "services": {
    "database": { "status": "healthy", "latency": 5 },
    "gemini": { "status": "healthy" },
    "resend": { "status": "configured" }
  }
}
```

### GET /api/health/lite
Quick health check for load balancers

### GET /api/health/metrics
Detailed system metrics

## 12. CIRCUIT BREAKER STATUS
### GET /api/circuit-breaker/status
Get all circuit breaker states (Protected - Admin)

**Response:**
```json
{
  "gemini": { "state": "CLOSED", "failures": 0 },
  "resend": { "state": "CLOSED", "failures": 0 }
}
```

### POST /api/circuit-breaker/reset/:name
Reset specific circuit breaker (Protected - Admin)

## ERROR RESPONSES
### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## ENVIRONMENT VARIABLES REQUIRED
```bash
# Backend (.env)
PORT=5001
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=your_resend_key
FRONTEND_URL=http://localhost:5173
EMAIL_FROM=onboarding@resend.dev

# Optional
AI_MODE=gemini|mock
EMAIL_MODE=resend|file|console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## DEPLOYMENT CHECKLIST
- All environment variables set in Vercel/Render
- Database migrations run on Neon
- CORS configured for frontend URLs
- Health endpoint returns 200
- Circuit breakers configured
- Rate limiting enabled for production
- SSL enabled (automatic on Vercel/Render)
