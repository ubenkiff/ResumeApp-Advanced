import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

class ImageService {
  constructor() {
    this.mode = process.env.IMAGE_MODE || 'cloudinary'; // 'cloudinary', 'local'
    
    if (this.mode === 'cloudinary' || !process.env.IMAGE_MODE) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });
      } else {
        console.warn('Cloudinary config missing, falling back to local mode');
        this.mode = 'local';
      }
    }
  }

  async uploadImage(file) {
    if (!file) throw new Error('No file provided');

    // Fallback: Local storage
    if (this.mode === 'local') {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      
      fs.writeFileSync(filePath, file.buffer || fs.readFileSync(file.path));
      
      console.log(`📸 [LOCAL] Image saved to ${filePath}`);
      // In development, we can serve from /uploads
      return { url: `/uploads/${fileName}`, mode: 'local' };
    }

    // Primary: Cloudinary
    try {
      // If file has 'path' (from disk storage) or 'buffer' (from memory storage)
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'resumeapp' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        if (file.buffer) {
          uploadStream.end(file.buffer);
        } else if (file.path) {
          fs.createReadStream(file.path).pipe(uploadStream);
        } else {
          reject(new Error('File format not supported for upload'));
        }
      });
      
      console.log(`✅ [CLOUDINARY] Image uploaded: ${result.secure_url}`);
      return { url: result.secure_url, mode: 'cloudinary' };
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local:', error.message);
      this.mode = 'local';
      return this.uploadImage(file);
    }
  }
}

export default new ImageService();
