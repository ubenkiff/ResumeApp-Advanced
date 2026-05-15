import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Admin check middleware
const isAdmin = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT username, role FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (user && (user.username === 'Uddi_Test2' || user.role === 'admin')) {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during admin check' });
  }
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// GET /api/global-templates - Public access
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT template_type, image_url FROM global_template_images');
    const images = result.rows.reduce((acc, row) => {
      acc[row.template_type] = row.image_url;
      return acc;
    }, {});
    res.json(images);
  } catch (error) {
    console.error('Error fetching global images:', error);
    res.status(500).json({ error: 'Failed to fetch global template images' });
  }
});

// POST /api/global-templates/upload - Admin Only
router.post('/upload', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { templateType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary with a fixed public ID for global overrides
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'resumeapp/global_templates',
          public_id: `${templateType}_global`,
          overwrite: true,
          transformation: [{ quality: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // UPSERT into global_template_images
    await pool.query(
      `INSERT INTO global_template_images (template_type, image_url, updated_by, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (template_type) 
       DO UPDATE SET image_url = EXCLUDED.image_url, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
      [templateType, result.secure_url, req.userId]
    );

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Admin upload error:', error);
    res.status(500).json({ error: 'Failed to upload global image' });
  }
});

// DELETE /api/global-templates/:templateType - Admin Only
router.delete('/:templateType', authenticate, isAdmin, async (req, res) => {
  try {
    const { templateType } = req.params;
    await pool.query('DELETE FROM global_template_images WHERE template_type = $1', [templateType]);
    res.json({ message: 'Reset to default successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete global image' });
  }
});

export default router;
