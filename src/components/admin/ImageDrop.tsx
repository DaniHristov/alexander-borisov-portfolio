'use client';

import { useState } from 'react';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB (original)
// Downscale the longest edge before upload. Keeps the request body well under
// Vercel's ~4.5 MB serverless function limit and speeds up the public site.
const MAX_EDGE = 2400;

/**
 * Downscale + re-encode in the browser so we upload a small file. Alpha is
 * preserved for PNG/WebP (transparent logos); photos go to JPEG. Falls back to
 * the original file if the browser can't decode it (e.g. some AVIF).
 */
async function downscale(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) {
    bitmap.close();
    return file; // already small — don't re-encode
  }
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
  const outType = keepAlpha ? file.type : 'image/jpeg';
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, outType, 0.85));
  if (!blob) return file;
  const ext = outType === 'image/png' ? 'png' : outType === 'image/webp' ? 'webp' : 'jpg';
  const base = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${base}.${ext}`, { type: outType });
}

export function ImageDrop({
  onUploaded,
}: {
  onUploaded: (img: { url: string; width: number; height: number }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <label className="block cursor-pointer rounded border border-dashed border-neutral-600 p-3 text-center text-xs text-neutral-400">
      {busy ? 'Uploading…' : 'Drop or click to upload an image'}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={async (e) => {
          const input = e.target;
          const file = input.files?.[0];
          if (!file) return;
          setBusy(true);
          setErr(null);
          try {
            if (!ALLOWED.includes(file.type)) {
              throw new Error('Use a JPEG, PNG, WebP, or AVIF image.');
            }
            if (file.size > MAX_BYTES) {
              throw new Error(`File too large (max ${MAX_BYTES / 1024 / 1024} MB).`);
            }
            // Upload server-side through the route (storeImage → Vercel Blob in
            // prod, local disk in dev). Avoids the client-upload CORS path.
            const compressed = await downscale(file);
            const form = new FormData();
            form.append('file', compressed);
            const res = await fetch('/api/admin/blob-upload', { method: 'PUT', body: form });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error ?? 'Upload failed');
            onUploaded(json); // { url, width, height } — dims from the server
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : 'Upload failed');
          } finally {
            setBusy(false);
            // Reset so re-selecting the SAME file still fires onChange.
            input.value = '';
          }
        }}
      />
      {err && <span className="mt-1 block text-red-400">{err}</span>}
    </label>
  );
}
