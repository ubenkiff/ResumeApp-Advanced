import express from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get optimized resumes for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT template_name, optimized_data, created_at FROM user_optimized_resumes WHERE user_id = $1',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save or update optimized resume data
router.post('/', authenticate, async (req, res) => {
  try {
    const { templateName, optimizedData } = req.body;
    if (!templateName || !optimizedData) {
      return res.status(400).json({ error: 'Template name and optimized data are required' });
    }

    const result = await pool.query(
      `INSERT INTO user_optimized_resumes (user_id, template_name, optimized_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, template_name) 
       DO UPDATE SET optimized_data = EXCLUDED.optimized_data, created_at = NOW()
       RETURNING *`,
      [req.userId, templateName, optimizedData]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Save optimized resume error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get public optimized resume for a user
// Note: This is registered in index.js separately often, but we define the logic here
export const getPublicOptimizedResume = async (req, res) => {
  try {
    const { username, templateName } = req.params;
    
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    const result = await pool.query(
      'SELECT optimized_data FROM user_optimized_resumes WHERE user_id = $1 AND template_name = $2',
      [userId, templateName]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Optimized version not found' });
    }
    
    res.json(result.rows[0].optimized_data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default router;
