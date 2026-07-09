import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/** Returns an error string, or null when valid. */
export function validateUpload(mime: string, size: number): string | null {
  if (!ALLOWED.includes(mime)) return `Unsupported type ${mime}. Use a JPEG, PNG, WebP, AVIF, or GIF image.`;
  if (size > MAX_BYTES) return `File too large (max ${MAX_BYTES / 1024 / 1024} MB).`;
  return null;
}

export interface StoredImage { url: string; width: number; height: number; }

/**
 * Stores an uploaded image and returns its URL + intrinsic dimensions.
 * Vercel Blob when BLOB_READ_WRITE_TOKEN is set; otherwise a local-disk dev
 * fallback under public/uploads (gitignored), so the editor works locally.
 */
export async function storeImage(file: File): Promise<StoredImage> {
  const err = validateUpload(file.type, file.size);
  if (err) throw new Error(err);

  const buf = Buffer.from(await file.arrayBuffer());
  // Read intrinsic size (first frame for animated GIFs). Never re-encode — the
  // original bytes are stored as-is, so GIF animation is preserved.
  let width = 1600;
  let height = 2000;
  try {
    const meta = await sharp(buf).metadata();
    width = meta.width ?? width;
    height = meta.height ?? height;
  } catch {
    // Fall back to defaults if the decoder can't read this file's dimensions.
  }
  const ext = (file.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
  const name = `${Date.now()}-${Math.round(width)}x${Math.round(height)}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${name}`, buf, { access: 'public', contentType: file.type });
    return { url: blob.url, width, height };
  }

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return { url: `/uploads/${name}`, width, height };
}
