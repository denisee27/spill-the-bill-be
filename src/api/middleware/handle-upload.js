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

async function addWatermark(imageBuffer) {
  const meta = await sharp(imageBuffer).metadata();
  const W = meta.width || 800;
  const H = meta.height || 800;
  const fontSize = Math.max(16, Math.round(W * 0.04));
  const svgText = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>text{font-family:Arial,sans-serif;font-size:${fontSize}px;fill:rgba(180,180,180,0.55);font-weight:bold;}</style>
    <g transform="translate(${W / 2},${H / 2}) rotate(-30)">
      <text text-anchor="middle" dominant-baseline="middle">@spillthebill</text>
    </g>
  </svg>`;
  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .webp({ quality: 90 })
    .toBuffer();
}

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
    const withWatermark = await addWatermark(compressed);
    const url = await uploadToS3(withWatermark, key, 'image/webp');
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
