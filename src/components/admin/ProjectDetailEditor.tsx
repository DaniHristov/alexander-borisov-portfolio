'use client';

import { useState } from 'react';
import { ImageDrop } from './ImageDrop';
import { GalleryManager, type GalleryImage } from './GalleryManager';
import { saveProjectMeta } from '@/app/admin/(editor)/actions';

export interface DetailProject {
  id: string;
  slug: string;
  title: string;
  year: number;
  fit: 'cover' | 'contain';
  client: string;
  role: string;
  summary: string;
  description: string;
  coverBlobUrl: string | null;
  coverW: number | null;
  coverH: number | null;
}

const f = 'w-full rounded border border-neutral-700 bg-transparent p-2 text-sm';

export function ProjectDetailEditor({
  project,
  images,
}: {
  project: DetailProject;
  images: GalleryImage[];
}) {
  const [p, setP] = useState<DetailProject>(project);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function patch(x: Partial<DetailProject>) {
    setP((cur) => ({ ...cur, ...x }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      await saveProjectMeta(p.id, {
        title: p.title,
        year: p.year,
        slug: p.slug,
        fit: p.fit,
        client: p.client || null,
        role: p.role || null,
        summary: p.summary,
        description: p.description || null,
        coverBlobUrl: p.coverBlobUrl ?? undefined,
        coverW: p.coverW ?? undefined,
        coverH: p.coverH ?? undefined,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded bg-neutral-900">
          {p.coverBlobUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.coverBlobUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-neutral-600">No cover</span>
          )}
        </div>
        <ImageDrop onUploaded={(img) => patch({ coverBlobUrl: img.url, coverW: img.width, coverH: img.height })} />
      </div>

      <div className="max-w-2xl space-y-4">
        <label className="block text-xs">Title
          <input className={f} value={p.title} onChange={(e) => patch({ title: e.target.value })} />
        </label>
        <div className="flex gap-3">
          <label className="block flex-1 text-xs">Year
            <input
              className={f}
              type="number"
              value={p.year}
              onChange={(e) => { const v = Number(e.target.value); if (v > 0) patch({ year: v }); }}
            />
          </label>
          <label className="block flex-1 text-xs">Slug
            <input className={f} value={p.slug} onChange={(e) => patch({ slug: e.target.value })} />
          </label>
        </div>
        <div className="text-xs">Cover fit
          <div className="mt-1 flex overflow-hidden rounded border border-neutral-700">
            {(['cover', 'contain'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => patch({ fit: mode })}
                className={`flex-1 px-2 py-1 ${p.fit === mode ? 'bg-white text-black' : 'text-neutral-300'}`}
              >
                {mode === 'cover' ? 'Cover (framed)' : 'Transparent PNG'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <label className="block flex-1 text-xs">Client
            <input className={f} value={p.client} onChange={(e) => patch({ client: e.target.value })} />
          </label>
          <label className="block flex-1 text-xs">Role
            <input className={f} value={p.role} onChange={(e) => patch({ role: e.target.value })} />
          </label>
        </div>
        <label className="block text-xs">Summary
          <textarea className={f} rows={3} value={p.summary} onChange={(e) => patch({ summary: e.target.value })} />
        </label>
        <label className="block text-xs">Description
          <textarea className={f} rows={6} value={p.description} onChange={(e) => patch({ description: e.target.value })} />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save details'}
        </button>

        <hr className="border-neutral-800" />
        <GalleryManager projectId={p.id} defaultAlt={p.title} initial={images} />
      </div>
    </div>
  );
}
