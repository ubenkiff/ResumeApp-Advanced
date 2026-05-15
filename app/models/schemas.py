from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict

class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    job_title: Optional[str] = None

class ResumeAnalyzeResponse(BaseModel):
    ats_score: int
    missing_keywords: List[str]
    format_issues: List[str]
    recommendations: List[str]
    uae_market_fit: str

class ResumeOptimizeRequest(BaseModel):
    resume_text: str
    target_role: str
    industry: str

class ResumeOptimizeResponse(BaseModel):
    optimized_text: str
    changes_made: List[str]
    keyword_density: Dict[str, int]

class LinkedInOptimizeRequest(BaseModel):
    current_headline: str
    current_about: str
    resume_text: str

class LinkedInOptimizeResponse(BaseModel):
    suggested_headline: str
    suggested_about: str
    keyword_recommendations: List[str]
    section_by_section: Dict[str, str]

class JobMatchRequest(BaseModel):
    job_text: Optional[str] = None
    job_url: Optional[str] = None
    resume_text: str

class JobMatchResponse(BaseModel):
    match_percentage: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    recommended_changes: List[str]

class ResumeVersion(BaseModel):
    title: str
    content: str

class ExportCSVRequest(BaseModel):
    resume_versions: List[ResumeVersion]
