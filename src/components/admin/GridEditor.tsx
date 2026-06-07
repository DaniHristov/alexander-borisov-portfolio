'use client';

import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { GRID_COLS, clampCol, clampSpan, placementStyle } from '@/lib/grid';
import { Inspector } from './Inspector';
import { saveGrid, saveProjectMeta, createWorkProject, removeProject } from '@/app/admin/(editor)/actions';

export interface EditorTile {
  id: string;
  slug: string;
  title: string;
  year: number;
  summary: string;
  categories: string[];
  coverBlobUrl: string | null;
  coverW: number | null;
  coverH: number | null;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  z: number;
  sortOrder: number;
}

const CELL_PX = 88; // visual cell size; placement is by cells, not pixels

export function GridEditor({ gallery, initial }: { gallery: 'work' | 'art'; initial: EditorTile[] }) {
  const [tiles, setTiles] = useState<EditorTile[]>(initial);
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const sel = tiles.find((t) => t.id === selected) ?? null;

  function patch(id: string, p: Partial<EditorTile>) {
    setTiles((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));
  }

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const dCol = Math.round(e.delta.x / CELL_PX);
    const dRow = Math.round(e.delta.y / CELL_PX);
    setTiles((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        const colSpan = clampSpan(t.colSpan);
        return { ...t, col: clampCol(t.col + dCol, colSpan), row: Math.max(0, t.row + dRow) };
      }),
    );
  }

  async function persist() {
    setSaving(true);
    try {
      // Public renders in dense order by sortOrder — derive it from the visual
      // top-left → bottom-right arrangement so the public order matches the canvas.
      const ordered = [...tiles].sort((a, b) => a.row - b.row || a.col - b.col);
      await saveGrid(
        gallery,
        ordered.map((t, i) => ({
          id: t.id,
          col: t.col,
          row: t.row,
          colSpan: clampSpan(t.colSpan),
          rowSpan: Math.max(1, t.rowSpan),
          z: t.z,
          sortOrder: i,
        })),
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
        categories: t.categories,
        summary: t.summary,
        coverBlobUrl: t.coverBlobUrl ?? undefined,
        coverW: t.coverW ?? undefined,
        coverH: t.coverH ?? undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 overflow-x-auto">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              // Persist any unsaved drags first so the reload doesn't discard them.
              await persist();
              await createWorkProject(gallery);
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
          <span className="text-xs text-neutral-500">Drag to move · select a tile to edit it</span>
        </div>
        <DndContext sensors={sensors} modifiers={[restrictToParentElement]} onDragEnd={onDragEnd}>
          <div
            className="relative grid gap-2 rounded border border-neutral-800 p-2"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_PX}px)`, gridAutoRows: `${CELL_PX}px` }}
          >
            {tiles.map((t) => (
              <DraggableTile
                key={t.id}
                tile={t}
                selected={t.id === selected}
                onSelect={() => setSelected(t.id)}
              />
            ))}
          </div>
        </DndContext>
      </div>
      {sel && (
        <Inspector
          tile={sel}
          onChange={(p) => patch(sel.id, p)}
          onSave={() => persistMeta(sel)}
          onDelete={async () => {
            // Persist other tiles' unsaved positions before the reload.
            await persist();
            await removeProject(sel.id, gallery);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function DraggableTile({
  tile,
  selected,
  onSelect,
}: {
  tile: EditorTile;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: tile.id });
  return (
    <button
      type="button"
      ref={setNodeRef}
      onClick={onSelect}
      {...listeners}
      {...attributes}
      style={{
        ...placementStyle(tile),
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      className={`relative overflow-hidden rounded border ${
        selected ? 'border-white' : 'border-neutral-700'
      } bg-neutral-900`}
    >
      {tile.coverBlobUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tile.coverBlobUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center p-1 text-[10px] text-neutral-500">
          {tile.title}
        </span>
      )}
    </button>
  );
}
