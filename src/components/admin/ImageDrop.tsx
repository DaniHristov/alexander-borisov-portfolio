'use client';

import { useState } from 'react';
import { uploadImage } from '@/app/admin/(editor)/actions';

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
            const fd = new FormData();
            fd.set('file', file);
            onUploaded(await uploadImage(fd));
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
