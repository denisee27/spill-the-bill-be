import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../../core/errors/http-errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/avi',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only JPEG, PNG, WebP images and MP4, MOV, WebM, AVI videos are allowed'), false);
  }
};

// Use memory storage so we can run sharp on the buffer before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 20,
  },
});

/**
 * Compress image with sharp (→ WebP) or write video as-is.
 * Mutates file.filename so downstream controllers work unchanged.
 */
const processFile = async (file) => {
  if (!file?.buffer) return;

  const isVideo = file.mimetype.startsWith('video/');

  if (isVideo) {
    const ext = path.extname(file.originalname) || '.mp4';
    const filename = `${uuidv4()}${ext}`;
    await fs.promises.writeFile(path.join(UPLOADS_DIR, filename), file.buffer);
    file.filename = filename;
  } else {
    const filename = `${uuidv4()}.webp`;
    await sharp(file.buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(path.join(UPLOADS_DIR, filename));
    file.filename = filename;
  }
};

const processAll = async (req) => {
  if (req.file) {
    await processFile(req.file);
  }
  if (Array.isArray(req.files)) {
    await Promise.all(req.files.map(processFile));
  } else if (req.files && typeof req.files === 'object') {
    // upload.fields() returns { fieldname: [files] }
    const all = Object.values(req.files).flat();
    await Promise.all(all.map(processFile));
  }
};

const wrapWithCompression = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return next(new BadRequestError(`Upload error: ${err.message}`));
    }
    if (err) return next(err);
    try {
      await processAll(req);
      next();
    } catch (e) {
      next(e);
    }
  });
};

export const uploadImages = (fieldName, maxCount = 20) =>
  wrapWithCompression(upload.array(fieldName, maxCount));

export const uploadSingle = (fieldName) =>
  wrapWithCompression(upload.single(fieldName));

export const uploadAny = () =>
  wrapWithCompression(upload.any());

export default upload;
