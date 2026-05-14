import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import pool from './db.js';
import { sendEmail } from './email.js';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import referencesRouter from './routes/references.js';
import aiRouter from './routes/ai.js';
import coverDataRouter from './routes/user-cover-data.js';
import optimizedResumesRouter, { getPublicOptimizedResume } from './routes/optimized-resumes.js';
import authRouter from './routes/auth.js';
import { authenticate } from './middleware/auth.js';
import imageService from './services/imageService.js';

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Immediate health check
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

async function startServer() {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
  console.log('--- Registering API Routes ---');

// List of admin emails (hardcoded)
const adminEmails = [
  'ubenkiff@gmail.com',
  'uddi.cpos@gmail.com',
  'benkiffdocs@gmail.com',
  'uddi.mikendad@gmail.com'
];

// Helper function to parse various date formats for sorting
function parseDate(dateStr) {
  if (!dateStr) return new Date(0);
  
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                  'july', 'august', 'september', 'october', 'november', 'december'];
  const lower = dateStr.toLowerCase();
  
  // Handle "April 2026" format
  for (let i = 0; i < months.length; i++) {
    if (lower.includes(months[i])) {
      const year = parseInt(dateStr.match(/\d{4}/)?.[0] || '2000');
      return new Date(year, i, 1);
    }
  }
  
  // Handle "2025" format
  if (dateStr.match(/^\d{4}$/)) {
    return new Date(parseInt(dateStr), 0, 1);
  }
  
  return new Date(dateStr);
}

// Configure multer for memory storage (ImageService will handle upload)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.socket.remoteAddress || 
         'Unknown';
};

// ============ HEALTH CHECK ============
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbCheck.rows.length > 0 ? 'connected' : 'error',
      aiMode: process.env.AI_MODE || 'auto'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============ AUTH ROUTES ============
app.use('/api/auth', authRouter);

// ============ ADMIN MIDDLEWARE ============

async function isAdmin(req, res, next) {
  try {
    const result = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    const userEmail = result.rows[0]?.email;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============ ADMIN EMAIL ROUTES ============

app.get('/api/admin/emails', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT el.*, u.username 
      FROM email_logs el
      JOIN users u ON el.user_id = u.id
      ORDER BY el.sent_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/emails', authenticate, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM email_logs');
    res.json({ success: true, message: 'All email logs deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/emails/old', authenticate, isAdmin, async (req, res) => {
  const { days = 30 } = req.query;
  try {
    await pool.query('DELETE FROM email_logs WHERE sent_at < NOW() - INTERVAL \'1 day\' * $1', [days]);
    res.json({ success: true, message: `Deleted email logs older than ${days} days` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/test-email', authenticate, isAdmin, async (req, res) => {
  const { email } = req.body;
  try {
    const result = await sendEmail(email, 'welcome', { username: 'Admin Test' });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ IMAGE UPLOAD ROUTE ============
app.post('/api/upload', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const result = await imageService.uploadImage(req.file);
    res.json({ url: result.url, mode: result.mode });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ PROFILE ROUTES ============

app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { name, title, bio, email, phone, location, linkedin, avatar_url, template_style, career_level, executive_summary, core_competencies, transformed_versions } = req.body;
    await pool.query(`
      UPDATE profiles SET 
        name = $1, title = $2, bio = $3, email = $4, 
        phone = $5, location = $6, linkedin = $7, avatar_url = $8,
        template_style = $9, career_level = $10, executive_summary = $11, 
        core_competencies = $12, transformed_versions = $13
      WHERE user_id = $14
    `, [
      name, title, bio, email, phone, location, linkedin, avatar_url, 
      template_style, career_level, executive_summary, core_competencies, 
      JSON.stringify(transformed_versions || {}), req.userId
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ EXPERIENCE ROUTES ============

app.get('/api/experience', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experience WHERE user_id = $1', [req.userId]);
    // Sort by parsed date (most recent first)
    const sorted = result.rows.sort((a, b) => {
      const dateA = parseDate(a.start_date);
      const dateB = parseDate(b.start_date);
      return dateB - dateA;
    });
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/experience', authenticate, async (req, res) => {
  try {
    const { job_title, company, location, start_date, end_date, current, description, highlights } = req.body;
    const result = await pool.query(`
      INSERT INTO experience (user_id, job_title, company, location, start_date, end_date, current, description, highlights)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [req.userId, job_title, company, location, start_date, end_date, current, description, highlights]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/experience/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { job_title, company, location, start_date, end_date, current, description, highlights } = req.body;
    await pool.query(`
      UPDATE experience SET 
        job_title = $1, company = $2, location = $3, start_date = $4, 
        end_date = $5, current = $6, description = $7, highlights = $8
      WHERE id = $9 AND user_id = $10
    `, [job_title, company, location, start_date, end_date, current, description, highlights, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/experience/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM experience WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EDUCATION ROUTES ============

app.get('/api/education', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM education WHERE user_id = $1 ORDER BY start_year DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/education', authenticate, async (req, res) => {
  try {
    const { degree, field, institution, location, start_year, end_year, grade, description } = req.body;
    const result = await pool.query(`
      INSERT INTO education (user_id, degree, field, institution, location, start_year, end_year, grade, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [req.userId, degree, field, institution, location, start_year, end_year, grade, description]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/education/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { degree, field, institution, location, start_year, end_year, grade, description } = req.body;
    await pool.query(`
      UPDATE education SET 
        degree = $1, field = $2, institution = $3, location = $4, 
        start_year = $5, end_year = $6, grade = $7, description = $8
      WHERE id = $9 AND user_id = $10
    `, [degree, field, institution, location, start_year, end_year, grade, description, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/education/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM education WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SKILLS ROUTES ============

app.get('/api/skills', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY category', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/skills', authenticate, async (req, res) => {
  try {
    const { name, category, level } = req.body;
    const result = await pool.query(`
      INSERT INTO skills (user_id, name, category, level)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [req.userId, name, category, level]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/skills/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level } = req.body;
    await pool.query(`
      UPDATE skills SET name = $1, category = $2, level = $3
      WHERE id = $4 AND user_id = $5
    `, [name, category, level, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/skills/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROJECTS ROUTES ============

app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY featured DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', authenticate, async (req, res) => {
  try {
    const { title, description, tech_stack, live_url, github_url, image_urls, featured } = req.body;
    const result = await pool.query(`
      INSERT INTO projects (user_id, title, description, tech_stack, live_url, github_url, image_urls, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [req.userId, title, description, tech_stack, live_url, github_url, image_urls, featured || false]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tech_stack, live_url, github_url, image_urls, featured } = req.body;
    await pool.query(`
      UPDATE projects SET 
        title = $1, description = $2, tech_stack = $3, live_url = $4, 
        github_url = $5, image_urls = $6, featured = $7
      WHERE id = $8 AND user_id = $9
    `, [title, description, tech_stack, live_url, github_url, image_urls, featured || false, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ACHIEVEMENTS ROUTES ============

app.get('/api/achievements', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/achievements', authenticate, async (req, res) => {
  try {
    const { title, issuer, date, description, category } = req.body;
    const result = await pool.query(`
      INSERT INTO achievements (user_id, title, issuer, date, description, category)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [req.userId, title, issuer, date, description, category]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/achievements/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, issuer, date, description, category } = req.body;
    await pool.query(`
      UPDATE achievements SET 
        title = $1, issuer = $2, date = $3, description = $4, category = $5
      WHERE id = $6 AND user_id = $7
    `, [title, issuer, date, description, category, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/achievements/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM achievements WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PUBLIC VIEW ROUTE (with date sorting fix) ============

app.get('/api/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    const profile = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const experienceResult = await pool.query('SELECT * FROM experience WHERE user_id = $1', [userId]);
    // Sort experience by parsed date (most recent first)
    const experience = experienceResult.rows.sort((a, b) => {
      const dateA = parseDate(a.start_date);
      const dateB = parseDate(b.start_date);
      return dateB - dateA;
    });
    const education = await pool.query('SELECT * FROM education WHERE user_id = $1 ORDER BY start_year DESC', [userId]);
    const skills = await pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY category', [userId]);
    const projects = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY featured DESC', [userId]);
    const achievements = await pool.query('SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC', [userId]);
    
    res.json({
      profile: profile.rows[0] || {},
      experience: experience,
      education: education.rows,
      skills: skills.rows,
      projects: projects.rows,
      achievements: achievements.rows
    });
  } catch (error) {
    console.error('Public view error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public/:username/optimized/:templateName', getPublicOptimizedResume);

// ============ RESUME DATA ROUTE (for printable/ATS resumes) ============

app.get('/api/resume/data', authenticate, async (req, res) => {
  try {
    const profile = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
    const experienceResult = await pool.query('SELECT * FROM experience WHERE user_id = $1', [req.userId]);
    // Sort experience by parsed date (most recent first)
    const experience = experienceResult.rows.sort((a, b) => {
      const dateA = parseDate(a.start_date);
      const dateB = parseDate(b.start_date);
      return dateB - dateA;
    });
    const education = await pool.query('SELECT * FROM education WHERE user_id = $1 ORDER BY start_year DESC', [req.userId]);
    const skills = await pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY category', [req.userId]);
    const projects = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY featured DESC', [req.userId]);
    const achievements = await pool.query('SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC', [req.userId]);
    
    res.json({
      profile: profile.rows[0] || {},
      experience: experience,
      education: education.rows,
      skills: skills.rows,
      projects: projects.rows,
      achievements: achievements.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ REFERENCES ROUTES ============
app.use('/api/user/references', referencesRouter);

// ============ AI ROUTES ============
app.use('/api/ai', aiRouter);

// ============ COVER DATA ROUTES ============
app.use('/api/user/cover-data', coverDataRouter);

// ============ OPTIMIZED RESUMES ROUTES ============
app.use('/api/user/optimized-resumes', optimizedResumesRouter);

  // ============ VITE / STATIC SERVING ============
  if (process.env.NODE_ENV !== 'production') {
    console.log('--- Initializing Vite Middleware ---');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('--- Vite Middleware Ready ---');
    } catch (viteError) {
      console.error('--- Vite Initialization Failed ---', viteError);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ResumeApp server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('--- startServer fatal error ---', err);
});
