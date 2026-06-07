'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB — matches the server token limit.

/** Read intrinsic dimensions in the browser (the server no longer sees the file). */
async function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return { width: 1600, height: 2000 }; // sensible fallback if decode fails
  }
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
            const { width, height } = await imageDimensions(file);
            // Upload straight from the browser to Vercel Blob — no Server Action
            // body limit. The route mints an auth-gated, size-restricted token.
            const blob = await upload(`uploads/${file.name}`, file, {
              access: 'public',
              handleUploadUrl: '/api/admin/blob-upload',
              contentType: file.type,
            });
            onUploaded({ url: blob.url, width, height });
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
