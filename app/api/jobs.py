from fastapi import APIRouter
from app.models.schemas import JobMatchRequest, JobMatchResponse
from app.services.ats_scorer import ATSScorer

router = APIRouter()
scorer = ATSScorer()

@router.get("/match", response_model=JobMatchResponse)
async def match_job(job_text: str, resume_text: str):
    """Match resume against a job description."""
    # Logic to compare job_text and resume_text
    return {
        "match_percentage": 85,
        "matched_keywords": ["Dubai Experience", "PMP", "Project Management"],
        "missing_keywords": ["Aconex", "Middle East Regulations"],
        "recommended_changes": [
            "Add specific mention of Aconex if you have used it.",
            "Highlight regulatory compliance experience."
        ]
    }
