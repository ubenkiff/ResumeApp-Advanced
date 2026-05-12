import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Groq from 'groq-sdk';
import pool from '../db.js';

const router = express.Router();
router.use(authenticate);

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required for AI features');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// Extract keywords from job description
router.post('/extract-keywords', async (req, res) => {
  try {
    const groq = getGroqClient();
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const prompt = `Extract the key skills, technologies, and requirements from the following job description. Return ONLY a JSON array of keywords. Do not include any other text.

Job Description: ${jobDescription}

JSON array of keywords:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content || '[]';

    // Clean and parse
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let keywords;
    try {
      keywords = JSON.parse(cleanText);
    } catch {
      keywords = [];
    }

    res.json({ keywords });
  } catch (error) {
    console.error('Keyword extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate cover letter
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const groq = getGroqClient();
    const { jobTitle, companyName, jobDescription } = req.body;

    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
    const experienceResult = await pool.query('SELECT * FROM experience WHERE user_id = $1 ORDER BY start_date DESC', [req.userId]);
    const skillsResult = await pool.query('SELECT name FROM skills WHERE user_id = $1', [req.userId]);
    const coverDataResult = await pool.query('SELECT * FROM user_cover_data WHERE user_id = $1', [req.userId]);

    const profile = profileResult.rows[0] || {};
    const experience = experienceResult.rows;
    const skills = skillsResult.rows.map(s => s.name);
    const coverData = coverDataResult.rows[0] || {};

    const experienceSummary = experience.map(exp =>
      `- ${exp.job_title} at ${exp.company} (${exp.start_date} - ${exp.current ? 'Present' : exp.end_date}): ${exp.description}`
    ).join('\n');

    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${companyName}.

User Profile:
- Name: ${profile.name || 'Applicant'}
- Current Title: ${profile.title || 'Professional'}
- Bio: ${profile.bio || ''}
- Skills: ${skills.join(', ')}

Experience:
${experienceSummary}

Career Goals: ${coverData.career_goals || 'Professional growth'}
Notice Period: ${coverData.notice_period || '2 weeks'}

Job Description: ${jobDescription}

Write a professional cover letter as plain text, no markdown. Sign with the applicant's name.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const coverLetter = completion.choices[0]?.message?.content || '';

    res.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze gap between job and resume
router.post('/analyze-gap', async (req, res) => {
  try {
    const groq = getGroqClient();
    const { jobDescription } = req.body;

    const skillsResult = await pool.query('SELECT name FROM skills WHERE user_id = $1', [req.userId]);
    const experienceResult = await pool.query('SELECT job_title, description FROM experience WHERE user_id = $1', [req.userId]);

    const userSkills = skillsResult.rows.map(s => s.name);
    const userExperience = experienceResult.rows.map(e => `${e.job_title}: ${e.description}`).join('\n');

    const prompt = `Analyze the gap between this job description and the candidate's profile.

Job Description: ${jobDescription}

Candidate Skills: ${userSkills.join(', ')}

Candidate Experience: ${userExperience}

Return ONLY valid JSON in this exact format:
{
  "targetKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "matchedKeywords": ["matched1", "matched2"],
  "matchPercentage": 65,
  "suggestedBulletPoints": []
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content || '{}';

    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let analysis;
    try {
      analysis = JSON.parse(cleanText);
    } catch {
      analysis = {
        targetKeywords: [],
        missingKeywords: [],
        matchedKeywords: [],
        matchPercentage: 0,
        suggestedBulletPoints: []
      };
    }

    res.json(analysis);
  } catch (error) {
    console.error('Gap analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search jobs (InfraScan)
router.post('/search-jobs', async (req, res) => {
  try {
    const groq = getGroqClient();
    const { keyword, location } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const prompt = `Generate 5 realistic job listings for "${keyword}"${location ? ` in ${location}` : ' worldwide'}.

Return ONLY a valid JSON array. Each object must have these fields:
- title (string)
- company (string)
- location (string)
- salary (string, in the local currency of the job location, e.g. "$80,000", "£45,000", "AED 15,000/month", "R 35,000/month")
- description (string, 2-3 sentences about the role)
- postedDate (string, e.g. "2 days ago", "Today", "1 week ago")
- url (string, realistic job board URL)
- isInfrastructureRelated (boolean)

No region restrictions. Include jobs from any country matching the search.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || '[]';
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let jobs;
    try {
      jobs = JSON.parse(cleanText);
    } catch {
      jobs = [];
    }

    res.json({ jobs });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crystallize/Optimize resume with AI based on template
router.post('/crystallize', async (req, res) => {
  try {
    const groq = getGroqClient();
    const { templateName, rawData } = req.body;

    if (!templateName || !rawData) {
      return res.status(400).json({ error: 'Template name and raw data are required' });
    }

    const prompt = `You are a world-class Executive Resume Writer specializing in high-impact leadership resumes. Your goal is to transform raw candidate data into a "power-packed" 2-page document.

STRICT TRANSFORMATION RULES:
1. ACHIEVEMENT OBSESSION: Never describe duties. Transform "Responsible for managing team" into "Led high-performance team of 15 to exceed annual KPIs by 40%, delivering $2.5M in cost savings."
2. ACTION VERBS: Every bullet MUST start with a tier-1 action verb (e.g., Orchestrated, Propelled, Spearheaded, Architected, Championed). 
3. QUANTIFIABLE METRICS: Every single experience bullet and project description MUST include at least one hard metric ($, %, #). If missing from raw data, use your domain expertise to estimate realistic, context-appropriate industry benchmarks.
4. EXECUTIVE SUMMARY: Craft a 4-line summary using the candidate's biggest unique value proposition. Use bold, authoritative language.
5. 2-PAGE LIMIT: Strictly prune content to ensure it fits on exactly 2 pages. Prioritize the last 10 years of experience. Remove any bullet that doesn't scream "impact".

TEMPLATE STYLES:
- Executive: Use for Board/C-Suite. Highlight strategic vision and global impact.
- Minimal: Use the EXACT same achievement-focused data, but for a clean, single-column ATS-optimized structure.

Raw Data:
${JSON.stringify(rawData, null, 2)}

Return ONLY a valid JSON object with the structure: { "optimizedData": { "profile": {...}, "experience": [...], "education": [...], "skills": [...], "projects": [...], "achievements": [...] } }.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const text = completion.choices[0]?.message?.content || '{}';
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let result;
    try {
      const parsed = JSON.parse(cleanText);
      result = parsed.optimizedData || parsed;
    } catch {
      result = rawData; // Fallback to raw data on parse error
    }

    res.json({ optimizedData: result });
  } catch (error) {
    console.error('Crystallization error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
