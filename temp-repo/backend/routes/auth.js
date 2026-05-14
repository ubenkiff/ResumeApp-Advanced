import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { sendEmail } from '../email.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    const existing = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, subscription_status) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [username, email, password_hash, 'free']
    );
    
    const userId = result.rows[0].id;
    await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [userId]);
    
    const token = jwt.sign({ userId }, JWT_SECRET);
    
    sendEmail(email, 'welcome', { username })
      .catch(err => console.error('Welcome email failed:', err.message));
    
    res.json({ user: result.rows[0], token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at, subscription_status FROM users WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  const { username, email } = req.body;
  const userId = req.userId;
  
  try {
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email',
      [username, email, userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Update failed' });
    }
  }
});

// Change password
router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;
  
  try {
    const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const isValid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, userId]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT id, username FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const user = result.rows[0];
    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
      [resetToken, user.id]
    );
    
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await sendEmail(email, 'passwordReset', { username: user.username, resetLink });
    
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
      [decoded.userId, token]
    );
    
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [password_hash, user.rows[0].id]
    );
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
});

export default router;
