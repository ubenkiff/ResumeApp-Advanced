import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class AIRewriter:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def rewrite_resume(self, text: str, role: str, industry: str):
        if not self.model:
            return "AI Service unconfigured. Please add GEMINI_API_KEY.", []

        prompt = f"""
        Act as an expert career coach specialized in the UAE and GCC job market.
        Rewrite the following resume content for the role of '{role}' in the '{industry}' industry.
        
        Focus on:
        - Quantifiable achievements (using METRIC, ACTION, RESULT).
        - UAE-specific formatting (clear headers, professional tone).
        - High-impact industry keywords.
        
        Resume Content:
        {text}
        
        Return the optimized text and a list of specific changes made.
        Format:
        OPTIMIZED TEXT:
        [text here]
        CHANGES:
        - [change 1]
        """
        
        response = self.model.generate_content(prompt)
        # Simple parsing for demo purposes
        parts = response.text.split("CHANGES:")
        optimized = parts[0].replace("OPTIMIZED TEXT:", "").strip()
        changes = [c.strip("- ") for c in parts[1].split("\n") if c.strip()] if len(parts) > 1 else []
        
        return optimized, changes

    async def optimize_linkedin(self, headline: str, about: str, resume: str):
        prompt = f"""
        Optimize this LinkedIn profile for the UAE market.
        Headline: {headline}
        About: {about}
        Resume Context: {resume}
        
        Return a high-impact headline and a compelling 'About' section.
        """
        response = self.model.generate_content(prompt)
        return response.text # Simplified processing
