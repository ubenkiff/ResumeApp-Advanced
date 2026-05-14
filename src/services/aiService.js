import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FORMAT_INSTRUCTIONS = {
  executive: `
    LEADERSHIP & STRATEGY FOCUS:
    - Rewrite bullet points to emphasize: leadership, market strategy, team growth (size/scale), budget management (exact or relative), ROI, and vision.
    - Create a punchy Executive Summary (3-5 lines) focusing on bottom-line impact.
    - Highlight board-level or C-suite achievements.
    - Use active, high-impact verbs (Orchestrated, Spearheaded, Transformed, Pioneered).
    - If specific numbers aren't provided, suggest placements for KPIs (e.g., "[X]% growth").
  `,
  ats: `
    KEYWORD & STRUCTURE OPTIMIZATION:
    - Simplify language to standard industry terms.
    - Ensure clear section headings: EXPERIENCE, EDUCATION, SKILLS, SUMMARY.
    - Optimize keyword density for the professional title provided.
    - Remove all non-standard characters, keep it purely text-based.
    - Flatten complex hierarchies; each job should follow: Title, Company, Date, Bullets.
  `,
  modern: `
    IMPACT & TECH FOCUS:
    - Keep it concise and energetic.
    - Focus on technical stack and tools used in each project.
    - Use brief, impact-heavy sentences.
    - Summarize older experiences to make room for modern skills.
  `,
  minimal: `
    CLARITY & ESSENCE FOCUS:
    - Strip all fluff. Keep only the most impressive 2-3 bullets per role.
    - Focus on the core value proposition of the individual.
    - Use clean, direct language.
  `,
  professional: `
    CHRONOLOGICAL & BALANCED:
    - Traditional resume style. 
    - Balanced mix of duties and achievements.
    - Clear, readable descriptions with standard bullet patterns.
  `
};

export const transformResumeWithAI = async (profileData, targetFormat) => {
  const instruction = FORMAT_INSTRUCTIONS[targetFormat] || FORMAT_INSTRUCTIONS.professional;
  
  const prompt = `
    You are an expert Resume writer and Career Coach. 
    Transform the following resume data into the "${targetFormat}" format.
    
    INSTRUCTIONS FOR THIS FORMAT:
    ${instruction}
    
    DATA TO TRANSFORM:
    ${JSON.stringify(profileData, null, 2)}
    
    RETURN ONLY A JSON OBJECT matching this structure:
    {
      "executive_summary": "string (the new summary)",
      "experience": [
        {
          "id": "original_id",
          "job_title": "string",
          "company": "string",
          "description": "string (rewritten context)",
          "highlights": ["rewritten bullet 1", "rewritten bullet 2"]
        }
      ],
      "skills": [
        {
          "name": "string",
          "category": "string",
          "level": "string"
        }
      ],
      "core_competencies": ["string", "string"] (specifically for Executive/Senior)
    }
    
    STRICT RULES:
    1. Do not hallucinate brand new jobs or degrees.
    2. Enhance the phrasing and impact based on the "Instructions for this format".
    3. Keep all IDs the same.
    4. Return ONLY valid JSON.
  `;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean potential markdown and whitespace
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Transformation Error:", error);
    throw error;
  }
};
