import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api import resume, linkedin, jobs, export

load_dotenv()

app = FastAPI(
    title="ResumaApp API",
    description="Backend API for UAE/GCC Engineering Resume Optimization",
    version="1.0.0"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(linkedin.router, prefix="/api/linkedin", tags=["LinkedIn"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])

@app.get("/health")
async def health_check():
    """Service health check."""
    return {"status": "ok", "service": "ResumaApp Backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
