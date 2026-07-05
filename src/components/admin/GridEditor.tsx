'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { DESIGN_W, canvasHeight, type Fit } from '@/lib/grid';
import { Inspector } from './Inspector';
import { CollagePreview } from './CollagePreview';
import { saveLayout, saveProjectMeta, createWorkProject, removeProject } from '@/app/admin/(editor)/actions';

export interface EditorTile {
  id: string;
  slug: string;
  title: string;
  year: number;
  summary: string;
  fit: Fit;
  clickable: boolean;
  coverBlobUrl: string | null;
  coverW: number | null;
  coverH: number | null;
  x: number;
  y: number;
  w: number;
  z: number;
  sortOrder: number;
}

// Editor renders the DESIGN_W canvas scaled down to fit the screen. All stored
// coordinates stay in design px; this factor only affects the on-screen size.
const SCALE = 0.55;
const MIN_CANVAS_H = 760; // design px — keeps an empty canvas usable

// Work and art are unified into one collage. Every project lives in a single
// coordinate space; `gallery` stays 'work' as the sole discriminator value.
const GALLERY = 'work' as const;

export function GridEditor({ initial }: { initial: EditorTile[] }) {
  const [tiles, setTiles] = useState<EditorTile[]>(initial);
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  // @dnd-kit assigns sequential aria ids that differ between SSR and the client,
  // which trips React's hydration check. The editor doesn't need SSR, so mount
  // the drag canvas only on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const sel = tiles.find((t) => t.id === selected) ?? null;
  const canvasH = Math.max(
    MIN_CANVAS_H,
    canvasHeight(tiles.map((t) => ({ y: t.y, w: t.w, coverW: t.coverW, coverH: t.coverH }))) + 80,
  );

  function patch(id: string, p: Partial<EditorTile>) {
    setTiles((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    // Delta is in on-screen px; convert back to design px. No clamping — x/y are
    // free (may go negative or past DESIGN_W) so tiles can bleed off the frame.
    const dx = e.delta.x / SCALE;
    const dy = e.delta.y / SCALE;
    setTiles((ts) => ts.map((t) => (t.id === id ? { ...t, x: t.x + dx, y: t.y + dy } : t)));
  }

  async function persist() {
    setSaving(true);
    try {
      // Lightbox prev/next follows reading order — derive sortOrder top→bottom,
      // left→right from the free positions.
      const ordered = [...tiles].sort((a, b) => a.y - b.y || a.x - b.x);
      await saveLayout(
        GALLERY,
        ordered.map((t, i) => ({ id: t.id, x: t.x, y: t.y, w: Math.max(40, t.w), z: t.z, sortOrder: i })),
      );
    } finally {
      setSaving(false);
    }
  }

  async function persistMeta(t: EditorTile) {
    setSaving(true);
    try {
      await saveProjectMeta(t.id, {
        title: t.title,
        year: t.year,
        slug: t.slug,
        fit: t.fit,
        clickable: t.clickable,
        summary: t.summary,
        coverBlobUrl: t.coverBlobUrl ?? undefined,
        coverW: t.coverW ?? undefined,
        coverH: t.coverH ?? undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function bringToFront(id: string) {
    const maxZ = tiles.reduce((m, t) => Math.max(m, t.z), 0);
    patch(id, { z: maxZ + 1 });
  }
  function sendToBack(id: string) {
    const minZ = tiles.reduce((m, t) => Math.min(m, t.z), 0);
    patch(id, { z: minZ - 1 });
  }

  // Preview mode — full-width, read-only render exactly as the public site,
  // from the current (possibly unsaved) tiles. No black side gutters.
  if (preview) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="rounded border border-neutral-700 px-2 py-1 text-xs"
          >
            ← Back to editing
          </button>
          <span className="text-xs text-neutral-500">
            Preview — how the collage will look on the site (full width). Unsaved changes are shown.
          </span>
        </div>
        <CollagePreview tiles={tiles} />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 overflow-auto">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              await persist();
              await createWorkProject(GALLERY);
              window.location.reload();
            }}
            className="rounded border border-neutral-700 px-2 py-1 text-xs"
          >
            + Add project
          </button>
          <button
            type="button"
            onClick={persist}
            disabled={saving}
            className="rounded bg-white px-2 py-1 text-xs font-medium text-black disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save layout'}
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="rounded border border-neutral-700 px-2 py-1 text-xs"
          >
            Preview
          </button>
          <span className="text-xs text-neutral-500">Drag to move · drag corner to resize · overlap freely</span>
        </div>
        {mounted ? (
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <div
              className="relative rounded border border-neutral-800 bg-neutral-950"
              style={{ width: DESIGN_W * SCALE, height: canvasH * SCALE }}
            >
              {[...tiles]
                .sort((a, b) => a.z - b.z)
                .map((t) => (
                  <DraggableTile
                    key={t.id}
                    tile={t}
                    scale={SCALE}
                    selected={t.id === selected}
                    onSelect={() => setSelected(t.id)}
                    onResize={(w) => patch(t.id, { w })}
                  />
                ))}
            </div>
          </DndContext>
        ) : (
          <div
            className="rounded border border-neutral-800 bg-neutral-950"
            style={{ width: DESIGN_W * SCALE, height: canvasH * SCALE }}
          />
        )}
      </div>
      {sel && (
        <Inspector
          tile={sel}
          gallery={GALLERY}
          onChange={(p) => patch(sel.id, p)}
          onSave={() => persistMeta(sel)}
          onBringToFront={() => bringToFront(sel.id)}
          onSendToBack={() => sendToBack(sel.id)}
          onDelete={async () => {
            await persist();
            await removeProject(sel.id, GALLERY);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function DraggableTile({
  tile,
  scale,
  selected,
  onSelect,
  onResize,
}: {
  tile: EditorTile;
  scale: number;
  selected: boolean;
  onSelect: () => void;
  onResize: (w: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: tile.id });

  function onResizeDown(e: React.PointerEvent) {
    // Don't let the drag sensor or the tile's click fire while resizing.
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = tile.w;
    function move(ev: PointerEvent) {
      onResize(Math.max(40, startW + (ev.clientX - startX) / scale));
    }
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      {...listeners}
      {...attributes}
      style={{
        position: 'absolute',
        left: tile.x * scale,
        top: tile.y * scale,
        width: tile.w * scale,
        zIndex: tile.z,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      className={`group cursor-move touch-none select-none ${selected ? 'outline outline-2 outline-white' : ''}`}
    >
      {tile.coverBlobUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tile.coverBlobUrl}
          alt=""
          className={`block h-auto w-full ${tile.fit === 'contain' ? 'object-contain' : 'bg-neutral-900 object-cover'}`}
        />
      ) : (
        <span className="flex aspect-[4/5] w-full items-center justify-center bg-neutral-900 p-1 text-center text-[10px] text-neutral-500">
          {tile.title || 'untitled'}
        </span>
      )}
      {/* Resize handle — bottom-right corner. */}
      <span
        onPointerDown={onResizeDown}
        onClick={(e) => e.stopPropagation()}
        className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-neutral-500 bg-white opacity-0 group-hover:opacity-100"
        aria-hidden
      />
    </div>
  );
}
