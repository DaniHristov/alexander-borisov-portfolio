'use client';

import { useEffect, useState } from 'react';
import { listUploadedImages } from '@/app/admin/(editor)/actions';

/** Read an image's intrinsic size from its URL (Blob doesn't store dimensions). */
function readDims(url: string): Promise<{ width: number; height: number }> {
  return new Promise((res) => {
    const im = new window.Image();
    im.onload = () => res({ width: im.naturalWidth || 1600, height: im.naturalHeight || 2000 });
    im.onerror = () => res({ width: 1600, height: 2000 });
    im.src = url;
  });
}

/**
 * Pool of every already-uploaded image. Pick one to set it as the selected
 * project's cover — no re-uploading. Overlay modal.
 */
export function MediaLibrary({
  canPick,
  onPick,
  onClose,
}: {
  canPick: boolean;
  onPick: (img: { url: string; width: number; height: number }) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<{ url: string; pathname: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [picking, setPicking] = useState<string | null>(null);

  useEffect(() => {
    listUploadedImages()
      .then(setItems)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load images'));
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-wide text-neutral-300">
          Media library {items ? `(${items.length})` : ''}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-neutral-700 px-3 py-1 text-xs hover:bg-neutral-800"
        >
          Close
        </button>
      </div>

      <p className="mb-3 text-xs text-neutral-500">
        {canPick
          ? 'Click an image to set it as the selected project’s cover.'
          : 'Select a project on the canvas first, then click an image to use it as its cover.'}
      </p>
      {err && <p className="mb-2 text-xs text-red-400">{err}</p>}
      {items === null && !err && <p className="text-xs text-neutral-500">Loading…</p>}
      {items && items.length === 0 && (
        <p className="text-xs text-neutral-500">No uploaded images yet.</p>
      )}

      <div className="grid grid-cols-3 gap-2 overflow-auto sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {items?.map((it) => (
          <button
            key={it.url}
            type="button"
            disabled={!canPick || picking !== null}
            onClick={async () => {
              setPicking(it.url);
              const d = await readDims(it.url);
              onPick({ url: it.url, ...d });
            }}
            className="group relative aspect-square overflow-hidden rounded border border-neutral-800 hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
            title={it.pathname}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.url} alt="" className="h-full w-full bg-neutral-900 object-cover" />
            {picking === it.url && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white">
                Setting…
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
