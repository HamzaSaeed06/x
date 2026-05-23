import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage to stream to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only image and video files are allowed'));
  },
});

// POST /api/upload/image
router.post('/image', requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'File upload error' });
      return;
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  try {
    const isVideo = req.file.mimetype.startsWith('video/');
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'zest-partners',
          resource_type: isVideo ? 'video' : 'image',
          ...(isVideo ? {} : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
        },
        (err, result) => {
          if (err || !result) reject(err ?? new Error('Upload failed'));
          else resolve(result as { secure_url: string; public_id: string });
        }
      );
      stream.end(req.file!.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err: any) {
    res.status(500).json({ error: `Upload failed: ${err?.message || 'Check Cloudinary credentials.'}` });
  }
});

// POST /api/upload/images (multiple)
router.post('/images', requireAdmin, (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || 'File upload error' });
      return;
    }
    next();
  });
}, async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ error: 'No files provided' });
    return;
  }

  try {
    const uploads = await Promise.all(
      files.map(
        (file) =>
          new Promise<{ url: string; publicId: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'zest-partners', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
              (err, result) => {
                if (err || !result) reject(err);
                else resolve({ url: (result as { secure_url: string }).secure_url, publicId: (result as { public_id: string }).public_id });
              }
            );
            stream.end(file.buffer);
          })
      )
    );
    res.json({ images: uploads });
  } catch {
    res.status(500).json({ error: 'One or more uploads failed' });
  }
});

export default router;
