import { uploadToS3 } from './s3.js';
import { saveToLocal } from './local.js';
import { config } from '../../config/index.js';

/**
 * Save a file to the configured storage backend.
 * STORAGE_DRIVER=s3   → Neon/S3, returns full https:// URL
 * STORAGE_DRIVER=local → local disk, returns relative key (e.g. "uuid.webp")
 */
export async function saveFile(buffer, key, contentType) {
  if (config.STORAGE_DRIVER === 's3') {
    return uploadToS3(buffer, key, contentType);
  }
  return saveToLocal(buffer, key);
}

/**
 * Given what saveFile returned (URL or relative key), return a full public URL.
 * Used when the URL must be publicly reachable (e.g. Google Lens).
 */
export function getPublicUrl(keyOrUrl) {
  if (keyOrUrl.startsWith('http')) return keyOrUrl;
  return `${config.SITE_URL}/uploads/${keyOrUrl}`;
}
