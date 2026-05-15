from fastapi import APIRouter, HTTPException
from app.models.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse, ResumeOptimizeRequest, ResumeOptimizeResponse
from app.services.ats_scorer import ATSScorer
from app.services.ai_rewriter import AIRewriter

router = APIRouter()
scorer = ATSScorer()
rewriter = AIRewriter()

@router.post("/analyze", response_model=ResumeAnalyzeResponse)
async def analyze_resume(request: ResumeAnalyzeRequest):
    """Analyze resume for ATS score and UAE market fit."""
    result = scorer.analyze(request.resume_text, request.job_title)
    return result

@router.post("/optimize", response_model=ResumeOptimizeResponse)
async def optimize_resume(request: ResumeOptimizeRequest):
    """Optimize resume text using AI for specific roles."""
    optimized, changes = await rewriter.rewrite_resume(
        request.resume_text, 
        request.target_role, 
        request.industry
    )
    density = scorer.get_keyword_density(optimized)
    
    return {
        "optimized_text": optimized,
        "changes_made": changes,
        "keyword_density": density
    }
