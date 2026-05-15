import re
from typing import List, Dict

class ATSScorer:
    def __init__(self):
        self.uae_keywords = [
            "dubai", "abu dhabi", "gcc", "middle east", "international experience",
            "multicultural", "project management", "engineering", "infrastructure"
        ]

    def analyze(self, text: str, job_title: str = None) -> Dict:
        text_lower = text.lower()
        
        # Simple scoring logic
        found_uae = [k for k in self.uae_keywords if k in text_lower]
        score = 60 # Base score
        score += len(found_uae) * 5
        
        missing = [k for k in self.uae_keywords if k not in text_lower][:3]
        
        issues = []
        if len(text) < 500:
            issues.append("Resume is too short. Add more detail about projects.")
        if not re.search(r'\d+%', text):
            issues.append("Missing quantifiable results (percentages/metrics).")
            
        fit = "High" if score > 85 else "Medium" if score > 70 else "Low"
        
        return {
            "ats_score": min(score, 100),
            "missing_keywords": missing,
            "format_issues": issues,
            "recommendations": [
                "Tailor your profile summary to mention GCC experience.",
                "Highlight large-scale projects handled in the region."
            ],
            "uae_market_fit": fit
        }

    def get_keyword_density(self, text: str) -> Dict[str, int]:
        words = re.findall(r'\w+', text.lower())
        density = {}
        for k in self.uae_keywords:
            count = words.count(k)
            if count > 0:
                density[k] = count
        return density
