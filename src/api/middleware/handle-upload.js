import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../../core/errors/http-errors.js';
import { uploadToS3 } from '../../infra/storage/s3.js';

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

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 20,
  },
});

const processFile = async (file) => {
  if (!file?.buffer) return;

  const isVideo = file.mimetype.startsWith('video/');

  if (isVideo) {
    const ext = file.originalname.split('.').pop() || 'mp4';
    const key = `${uuidv4()}.${ext}`;
    const url = await uploadToS3(file.buffer, key, file.mimetype);
    file.filename = url;
  } else {
    const key = `${uuidv4()}.webp`;
    const compressed = await sharp(file.buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    const url = await uploadToS3(compressed, key, 'image/webp');
    file.filename = url;
  }
};

const processAll = async (req) => {
  if (req.file) {
    await processFile(req.file);
  }
  if (Array.isArray(req.files)) {
    await Promise.all(req.files.map(processFile));
  } else if (req.files && typeof req.files === 'object') {
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
