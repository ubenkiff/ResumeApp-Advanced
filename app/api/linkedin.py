from fastapi import APIRouter
from app.models.schemas import LinkedInOptimizeRequest, LinkedInOptimizeResponse
from app.services.ai_rewriter import AIRewriter

router = APIRouter()
rewriter = AIRewriter()

@router.post("/optimize", response_model=LinkedInOptimizeResponse)
async def optimize_linkedin(request: LinkedInOptimizeRequest):
    """Generate optimized LinkedIn headline and about section."""
    ai_result = await rewriter.optimize_linkedin(
        request.current_headline,
        request.current_about,
        request.resume_text
    )
    
    # Mock splitting for structure
    return {
        "suggested_headline": "Senior Engineering Lead | Infrastructure Projects UAE & Middle East",
        "suggested_about": ai_result[:500],
        "keyword_recommendations": ["GCC Projects", "Project Lifecycle", "Stakeholder Management"],
        "section_by_section": {
            "experience": "Enhanced with quantifiable metrics.",
            "skills": "Optimized for high-demand engineering skills in GCC."
        }
    }
