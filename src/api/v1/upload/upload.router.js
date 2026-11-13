import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../../middleware/require-auth.js';
import { requireAdmin } from '../../middleware/require-admin.js';
import { saveFile, getPublicUrl } from '../../../infra/storage/index.js';

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only images allowed'), false);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

export function makeUploadRouter() {
  const router = Router();

  // Temp upload for Google Lens reverse search — no watermark, not stored in DB
  router.post(
    '/temp',
    requireAuth,
    requireAdmin,
    upload.single('image'),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, error: 'No image provided' });
        }
        const compressed = await sharp(req.file.buffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
        const key = `temp/${uuidv4()}.webp`;
        const result = await saveFile(compressed, key, 'image/webp');
        const url = getPublicUrl(result);
        return res.json({ success: true, data: { url } });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
