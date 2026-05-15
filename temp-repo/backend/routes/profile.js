import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and SVG files are allowed'), false);
    }
  }
});

// POST /api/profile/upload-template-image
router.post('/upload-template-image', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { templateType } = req.body;
    const userId = req.userId; // Use userId from authenticate middleware
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `resumeapp/templates/${userId}`,
          public_id: `${templateType}_preview`,
          transformation: [{ quality: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });
    
    // Save URL to profile
    const columnMap = {
      executive: 'executive_preview',
      professional: 'professional_preview',
      ats: 'ats_preview',
      modern: 'modern_preview',
      minimal: 'minimal_preview',
      creative: 'creative_preview'
    };
    
    const column = columnMap[templateType];
    if (!column) {
      return res.status(400).json({ error: 'Invalid template type' });
    }
    
    await pool.query(
      `UPDATE profiles SET ${column} = $1 WHERE user_id = $2`,
      [result.secure_url, userId]
    );
    
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// GET /api/profile/template-images
router.get('/template-images', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT executive_preview, professional_preview, ats_preview, modern_preview, minimal_preview, creative_preview FROM profiles WHERE user_id = $1`,
      [userId]
    );
    
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template images' });
  }
});

export default router;
