'use client';

import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { ImageDrop } from './ImageDrop';
import {
  addGalleryImage,
  updateGalleryImage,
  removeGalleryImage,
  reorderGalleryImages,
} from '@/app/admin/(editor)/actions';

export interface GalleryImage {
  id: string;
  blobUrl: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

const f = 'w-full rounded border border-neutral-700 bg-transparent p-1.5 text-sm';

export function GalleryManager({
  projectId,
  defaultAlt,
  initial,
}: {
  projectId: string;
  defaultAlt: string;
  initial: GalleryImage[];
}) {
  const [images, setImages] = useState<GalleryImage[]>(initial);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(images, oldIndex, newIndex);
    setImages(next);
    await reorderGalleryImages(next.map((i) => i.id));
  }

  async function onAdded(img: { url: string; width: number; height: number }) {
    const row = await addGalleryImage(projectId, {
      url: img.url,
      width: img.width,
      height: img.height,
      alt: defaultAlt,
      sortOrder: images.length,
    });
    setImages((xs) => [
      ...xs,
      { id: row.id, blobUrl: row.blobUrl, width: row.width, height: row.height, alt: row.alt, caption: row.caption ?? '' },
    ]);
  }

  function patch(id: string, p: Partial<GalleryImage>) {
    setImages((xs) => xs.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }

  async function persistMeta(img: GalleryImage) {
    await updateGalleryImage(img.id, { alt: img.alt, caption: img.caption });
  }

  async function remove(id: string) {
    setImages((xs) => xs.filter((i) => i.id !== id));
    await removeGalleryImage(id);
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs uppercase tracking-wide text-neutral-400">Gallery images</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={images.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {images.map((img) => (
              <SortableRow
                key={img.id}
                img={img}
                onChange={(p) => patch(img.id, p)}
                onBlur={() => persistMeta(img)}
                onDelete={() => remove(img.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {images.length === 0 && <p className="text-xs text-neutral-500">No gallery images yet.</p>}
      <ImageDrop onUploaded={onAdded} />
    </div>
  );
}

function SortableRow({
  img,
  onChange,
  onBlur,
  onDelete,
}: {
  img: GalleryImage;
  onChange: (p: Partial<GalleryImage>) => void;
  onBlur: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className="flex gap-3 rounded border border-neutral-800 p-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab px-1 text-neutral-500"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.blobUrl} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
      <div className="flex-1 space-y-1">
        <label className="block text-xs">Alt
          <input className={f} value={img.alt} onChange={(e) => onChange({ alt: e.target.value })} onBlur={onBlur} />
        </label>
        <label className="block text-xs">Caption (optional)
          <input className={f} value={img.caption} onChange={(e) => onChange({ caption: e.target.value })} onBlur={onBlur} />
        </label>
      </div>
      <button type="button" onClick={onDelete} className="self-start text-xs text-red-400 hover:underline">
        Delete
      </button>
    </li>
  );
}
