import express from 'express';
import { authenticate } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import pool from '../db.js';

const router = express.Router();
router.use(authenticate);

// Extract keywords from job description
router.post('/extract-keywords', async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const keywords = await aiService.extractKeywords(jobDescription);
    res.json({ keywords });
  } catch (error) {
    console.error('Keyword extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Impact Scan (Profile Scanner)
router.post('/scan', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const analysis = await aiService.scan(text);
    res.json(analysis);
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate cover letter
router.post('/generate-cover-letter', async (req, res) => {
  try {
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

    const context = {
      jobTitle,
      companyName,
      jobDescription,
      profile,
      experienceSummary,
      careerGoals: coverData.career_goals,
      noticePeriod: coverData.notice_period
    };

    const coverLetter = await aiService.generateCoverLetter(context);
    res.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze gap between job and resume
router.post('/analyze-gap', async (req, res) => {
  try {
    const { jobDescription } = req.body;

    const skillsResult = await pool.query('SELECT name FROM skills WHERE user_id = $1', [req.userId]);
    const experienceResult = await pool.query('SELECT job_title, description FROM experience WHERE user_id = $1', [req.userId]);

    const userSkills = skillsResult.rows.map(s => s.name);
    const userExperience = experienceResult.rows.map(e => `${e.job_title}: ${e.description}`).join('\n');

    const analysis = await aiService.analyzeGap({ jobDescription, userSkills, userExperience });
    res.json(analysis);
  } catch (error) {
    console.error('Gap analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search jobs (InfraScan)
router.post('/search-jobs', async (req, res) => {
  try {
    const { keyword, location } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const jobs = await aiService.searchJobs(keyword, location);
    res.json({ jobs });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crystallize/Optimize resume with AI based on template
router.post('/crystallize', async (req, res) => {
  try {
    const { templateName, rawData } = req.body;
    if (!templateName || !rawData) {
      return res.status(400).json({ error: 'Template name and raw data are required' });
    }

    const optimizedData = await aiService.crystallize(templateName, rawData);
    res.json({ optimizedData });
  } catch (error) {
    console.error('Crystallization error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

