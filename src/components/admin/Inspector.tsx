'use client';

import Link from 'next/link';
import { ImageDrop } from './ImageDrop';
import type { EditorTile } from './GridEditor';

const f = 'w-full rounded border border-neutral-700 bg-transparent p-1.5 text-sm';

export function Inspector({
  tile,
  gallery,
  onChange,
  onSave,
  onBringToFront,
  onSendToBack,
  onDelete,
}: {
  tile: EditorTile;
  gallery: 'work' | 'art';
  onChange: (patch: Partial<EditorTile>) => void;
  onSave: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDelete: () => void;
}) {
  return (
    <aside className="w-72 shrink-0 space-y-3 border-l border-neutral-800 p-3">
      <Link
        href={`/admin/${gallery}/${tile.id}`}
        className="block rounded border border-neutral-700 px-2 py-1 text-center text-xs hover:bg-neutral-800"
      >
        Edit full details →
      </Link>
      <div
        className={`relative overflow-hidden rounded ${tile.fit === 'contain' ? '' : 'aspect-[4/5] bg-neutral-900'}`}
      >
        {tile.coverBlobUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tile.coverBlobUrl}
            alt=""
            className={`w-full ${tile.fit === 'contain' ? 'h-auto object-contain' : 'h-full object-cover'}`}
          />
        ) : (
          <span className="flex h-full items-center justify-center py-8 text-xs text-neutral-600">
            No cover
          </span>
        )}
      </div>
      <ImageDrop
        onUploaded={(img) =>
          onChange({ coverBlobUrl: img.url, coverW: img.width, coverH: img.height })
        }
      />

      {/* Fit — framed photo vs floating transparent PNG. */}
      <div className="text-xs">
        Fit
        <div className="mt-1 flex overflow-hidden rounded border border-neutral-700">
          {(['cover', 'contain'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ fit: mode })}
              className={`flex-1 px-2 py-1 ${tile.fit === mode ? 'bg-white text-black' : 'text-neutral-300'}`}
            >
              {mode === 'cover' ? 'Cover' : 'Transparent'}
            </button>
          ))}
        </div>
      </div>

      {/* Clickable — decorative tiles (logos etc.) can be shown but not open. */}
      <div className="text-xs">
        On click
        <div className="mt-1 flex overflow-hidden rounded border border-neutral-700">
          <button
            type="button"
            onClick={() => onChange({ clickable: true })}
            className={`flex-1 px-2 py-1 ${tile.clickable ? 'bg-white text-black' : 'text-neutral-300'}`}
          >
            Opens
          </button>
          <button
            type="button"
            onClick={() => onChange({ clickable: false })}
            className={`flex-1 px-2 py-1 ${!tile.clickable ? 'bg-white text-black' : 'text-neutral-300'}`}
          >
            Decorative
          </button>
        </div>
      </div>

      <label className="block text-xs">Title
        <input className={f} value={tile.title} onChange={(e) => onChange({ title: e.target.value })} />
      </label>
      <label className="block text-xs">Year
        <input
          className={f}
          type="number"
          value={tile.year}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > 0) onChange({ year: v });
          }}
        />
      </label>
      <label className="block text-xs">Slug
        <input className={f} value={tile.slug} onChange={(e) => onChange({ slug: e.target.value })} />
      </label>
      <label className="block text-xs">Summary
        <textarea className={f} rows={3} value={tile.summary} onChange={(e) => onChange({ summary: e.target.value })} />
      </label>

      {/* Placement — width in design px + layer order. */}
      <div className="flex gap-2">
        <label className="block flex-1 text-xs">Width (px)
          <input
            className={f}
            type="number"
            min={40}
            value={Math.round(tile.w)}
            onChange={(e) => onChange({ w: Math.max(40, Number(e.target.value) || 0) })}
          />
        </label>
        <label className="block flex-1 text-xs">Layer (z)
          <input
            className={f}
            type="number"
            value={tile.z}
            onChange={(e) => onChange({ z: Number(e.target.value) || 0 })}
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onBringToFront} className="flex-1 rounded border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800">
          Bring to front
        </button>
        <button type="button" onClick={onSendToBack} className="flex-1 rounded border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800">
          Send to back
        </button>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={onSave} className="rounded bg-white px-2 py-1 text-xs font-medium text-black">
          Save details
        </button>
        <button type="button" onClick={onDelete} className="text-xs text-red-400 hover:underline">
          Delete project
        </button>
      </div>
    </aside>
  );
}
