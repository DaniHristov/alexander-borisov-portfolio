'use client';

import { useEffect, useState } from 'react';
import { listUploadedImages, deleteUploadedImage } from '@/app/admin/(editor)/actions';

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
  onNewFromImage,
  onClose,
}: {
  canPick: boolean;
  onPick: (img: { url: string; width: number; height: number }) => void;
  onNewFromImage: (img: { url: string; width: number; height: number }) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<{ url: string; pathname: string }[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    listUploadedImages()
      .then(setItems)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load images'));
  }, []);

  async function del(url: string) {
    if (!confirm('Delete this image from storage? Any project still using it will lose its cover.')) return;
    setItems((xs) => xs?.filter((i) => i.url !== url) ?? null);
    await deleteUploadedImage(url);
  }

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
        Click an image to set it as the selected project’s cover
        {canPick ? '' : ' (select a project first)'} · use{' '}
        <span className="text-neutral-300">+ New</span> to make a new project from it.
      </p>
      {err && <p className="mb-2 text-xs text-red-400">{err}</p>}
      {items === null && !err && <p className="text-xs text-neutral-500">Loading…</p>}
      {items && items.length === 0 && (
        <p className="text-xs text-neutral-500">No uploaded images yet.</p>
      )}

      <div className="grid grid-cols-3 gap-2 overflow-auto sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {items?.map((it) => (
          <div
            key={it.url}
            className="group relative aspect-square overflow-hidden rounded border border-neutral-800"
            title={it.pathname}
          >
            {/* Main click — set as the selected project's cover. */}
            <button
              type="button"
              disabled={!canPick || busy !== null}
              onClick={async () => {
                setBusy(it.url);
                onPick({ url: it.url, ...(await readDims(it.url)) });
              }}
              className="block h-full w-full disabled:cursor-not-allowed"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.url} alt="" className="h-full w-full bg-neutral-900 object-cover" />
            </button>

            {/* Hover actions. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
              <button
                type="button"
                disabled={busy !== null}
                onClick={async () => {
                  setBusy(it.url);
                  onNewFromImage({ url: it.url, ...(await readDims(it.url)) });
                }}
                className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-black disabled:opacity-50"
              >
                + New
              </button>
              <button
                type="button"
                onClick={() => del(it.url)}
                className="rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white"
              >
                Delete
              </button>
            </div>

            {busy === it.url && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white">
                Working…
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
