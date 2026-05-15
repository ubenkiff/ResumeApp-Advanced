# Local Deployment & Git Handover Guide

This guide describes how to clone and run **ResumaApp** locally on your machine.

## 1. Prerequisites
- **Git** installed.
- **Python 3.11+** (for the AI backend).
- **Node.js 18+** (for the React frontend).
- **API Keys:** You will need a `GEMINI_API_KEY` (or OpenAI) for real AI features.

---

## 2. Global Setup (Clone from Git)
```bash
# Clone the repository
git clone <your-repo-url>
cd ResumeApp-Advanced
```

---

## 3. Backend Setup (FastAPI at localhost:8000)
The backend handles AI optimization, PDF styling logic, and CSV exports.

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 5. Run the server
uvicorn app.main:app --reload --port 8000
```
**Verification:** Open `http://localhost:8000/health` in your browser.

---

## 4. Frontend Setup (React at localhost:3000)
The frontend is the interactive dashboard used for resume building.

```bash
# 1. Install Node dependencies
npm install

# 2. Run the development server
npm run dev
```
**Verification:** Open `http://localhost:3000`.

---

## 5. Deployment to Production (Render)
The project includes a `render.yaml` file for native deployment.
1. Connect your GitHub repo to **Render.com**.
2. Select "Blueprint" and it will automatically detect the settings.
3. Add your `GEMINI_API_KEY` in the Render dashboard environment variables.

---

## 6. Troubleshooting
- **CORS Errors:** Ensure the `CORS_ORIGINS` in your `.env` includes `http://localhost:3000`.
- **Module Not Found:** If Python fails, run `pip install -r requirements.txt` again while inside the virtual environment.
- **Port Conflict:** If port 3000 is taken, Vite will try 3001. Ensure your backend CORS settings match the actual frontend port.
