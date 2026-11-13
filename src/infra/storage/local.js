import fs from 'fs/promises';
import path from 'path';
import { config } from '../../config/index.js';

export async function saveToLocal(buffer, key) {
  const fullPath = path.resolve(config.UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);
  return key; // relative key — imageUrl(key) → /uploads/key served by nginx
}
