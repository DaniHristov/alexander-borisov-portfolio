'use client';

import { ImageDrop } from './ImageDrop';
import type { EditorTile } from './GridEditor';

const f = 'w-full rounded border border-neutral-700 bg-transparent p-1.5 text-sm';

export function Inspector({
  tile,
  onChange,
  onSave,
  onDelete,
}: {
  tile: EditorTile;
  onChange: (patch: Partial<EditorTile>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <aside className="w-72 shrink-0 space-y-3 border-l border-neutral-800 p-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded bg-neutral-900">
        {tile.coverBlobUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tile.coverBlobUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-neutral-600">
            No cover
          </span>
        )}
      </div>
      <ImageDrop
        onUploaded={(img) =>
          onChange({ coverBlobUrl: img.url, coverW: img.width, coverH: img.height })
        }
      />
      <label className="block text-xs">Title
        <input className={f} value={tile.title} onChange={(e) => onChange({ title: e.target.value })} />
      </label>
      <label className="block text-xs">Year
        <input
          className={f}
          type="number"
          value={tile.year}
          // Ignore empty/zero so clearing the field doesn't persist year 0.
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > 0) onChange({ year: v });
          }}
        />
      </label>
      <label className="block text-xs">Slug
        <input className={f} value={tile.slug} onChange={(e) => onChange({ slug: e.target.value })} />
      </label>
      <label className="block text-xs">Categories (comma-sep)
        <input
          className={f}
          value={tile.categories.join(', ')}
          onChange={(e) => onChange({ categories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
        />
      </label>
      <label className="block text-xs">Summary
        <textarea className={f} rows={3} value={tile.summary} onChange={(e) => onChange({ summary: e.target.value })} />
      </label>
      <div className="flex gap-2">
        <label className="block text-xs">W (cols)
          <input className={f} type="number" min={1} max={12} value={tile.colSpan} onChange={(e) => onChange({ colSpan: Number(e.target.value) })} />
        </label>
        <label className="block text-xs">H (rows)
          <input className={f} type="number" min={1} value={tile.rowSpan} onChange={(e) => onChange({ rowSpan: Number(e.target.value) })} />
        </label>
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
