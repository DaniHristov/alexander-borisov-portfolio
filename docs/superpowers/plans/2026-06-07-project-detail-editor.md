# Project-Detail Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated full-page editor for a Work project that exposes `client`/`role`/`description` and a drag-to-reorder gallery-image manager (add/edit alt+caption/delete), all saved as drafts until Publish.

**Architecture:** Additive. The existing grid page + Inspector are untouched (they arrange covers + grid spans). A new page at `/admin/work/[id]` hosts a `ProjectDetailEditor` (text fields + cover + a `GalleryManager`). Gallery images are rows in the existing `tiles` table; new thin server actions wrap existing/extended queries. Everything writes to working tables; the existing Publish seam serializes them to the snapshot.

**Tech Stack:** Next.js 15 (App Router, Server Actions) · React 19 · Drizzle + Neon · `@dnd-kit/core` + `@dnd-kit/sortable` · `@vercel/blob` client upload (existing `ImageDrop`) · Vitest.

**Spec:** `docs/superpowers/specs/2026-06-07-project-detail-editor-design.md`

**Working dir for all paths:** repo root (`alexander-borisov-portfolio`). Run `npm run typecheck && npm run lint && npm run test` after each code task.

---

## File Structure

**Create:**
- `src/components/admin/GalleryManager.tsx` — sortable gallery-image list (add/reorder/edit/delete).
- `src/components/admin/ProjectDetailEditor.tsx` — full per-project form; embeds `GalleryManager`.
- `src/app/admin/(editor)/work/[id]/page.tsx` — server component host for one Work project.
- `tests/db/tiles.test.ts` — unit test for the pure reorder mapping.

**Modify:**
- `src/db/queries.ts` — add `getWorkingProjectById`, `updateTile`, `tileOrderUpdates`, `reorderTiles`.
- `src/app/admin/(editor)/actions.ts` — add `addGalleryImage`, `updateGalleryImage`, `removeGalleryImage`, `reorderGalleryImages`.
- `src/components/admin/Inspector.tsx` — add a `gallery` prop + an "Edit full details →" link (Work only).
- `src/components/admin/GridEditor.tsx` — pass `gallery` to `Inspector`.
- `package.json` — add `@dnd-kit/sortable`.

---

## Task 1: Install @dnd-kit/sortable

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install**

Run: `npm install @dnd-kit/sortable@^8`
Expected: added to `dependencies`. (`@dnd-kit/core@6.3.1` is already present and working with React 19; sortable v8 matches it. Any peer-range warning is non-blocking — core already coexists with React 19 here.)

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit/sortable for the gallery editor"
```

---

## Task 2: Query helpers (TDD the reorder mapping)

**Files:**
- Modify: `src/db/queries.ts`
- Test: `tests/db/tiles.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/db/tiles.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { tileOrderUpdates } from '@/db/queries';

describe('tileOrderUpdates', () => {
  it('assigns sortOrder by array position', () => {
    expect(tileOrderUpdates(['c', 'a', 'b'])).toEqual([
      { id: 'c', sortOrder: 0 },
      { id: 'a', sortOrder: 1 },
      { id: 'b', sortOrder: 2 },
    ]);
  });
  it('returns an empty array for no ids', () => {
    expect(tileOrderUpdates([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/db/tiles.test.ts`
Expected: FAIL — `tileOrderUpdates` is not exported.

- [ ] **Step 3: Implement the queries**

In `src/db/queries.ts`, add these after the existing `deleteTile` function (around line 112), before `upsertSiteContent`. (Imports `asc`, `eq`, `getDb`, `tiles`, `projects`, `NewTileRow` already exist at the top of the file.)
```ts
// --- Project-detail editor: by-id read + tile edits ---
export async function getWorkingProjectById(id: string, db: Db = getDb()) {
  const [p] = await db.select().from(projects).where(eq(projects.id, id));
  if (!p) return null;
  const imgs = await db
    .select()
    .from(tiles)
    .where(eq(tiles.projectId, p.id))
    .orderBy(asc(tiles.sortOrder));
  return { project: p, tiles: imgs };
}

export async function updateTile(id: string, fields: Partial<NewTileRow>, db: Db = getDb()) {
  await db.update(tiles).set(fields).where(eq(tiles.id, id));
}

/** Pure: map an ordered id list to {id, sortOrder} by position. */
export function tileOrderUpdates(orderedIds: string[]): { id: string; sortOrder: number }[] {
  return orderedIds.map((id, i) => ({ id, sortOrder: i }));
}

export async function reorderTiles(orderedIds: string[], db: Db = getDb()) {
  const updates = tileOrderUpdates(orderedIds);
  if (updates.length === 0) return;
  // One atomic batch so a mid-save failure can't leave the order half-applied.
  const stmts = updates.map((u) =>
    db.update(tiles).set({ sortOrder: u.sortOrder }).where(eq(tiles.id, u.id)),
  );
  await db.batch(stmts as [(typeof stmts)[number], ...(typeof stmts)[number][]]);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/db/tiles.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run typecheck`
```bash
git add src/db/queries.ts tests/db/tiles.test.ts
git commit -m "feat: tile queries — by-id project, update tile, reorder tiles"
```

---

## Task 3: Server actions for the gallery

**Files:** Modify `src/app/admin/(editor)/actions.ts`

- [ ] **Step 1: Extend the queries import**

In `src/app/admin/(editor)/actions.ts`, change the `@/db/queries` import (line 7) to add the tile functions:
```ts
import { publish, upsertSiteContent, createProject, updateProjectFields, deleteProject, updateGrid as persistGrid, addTile, deleteTile, updateTile, reorderTiles } from '@/db/queries';
```

- [ ] **Step 2: Append the gallery actions**

Add at the end of `src/app/admin/(editor)/actions.ts`:
```ts
export async function addGalleryImage(
  projectId: string,
  img: { url: string; width: number; height: number; alt: string; sortOrder: number },
) {
  await requireSession();
  const row = await addTile({
    projectId,
    blobUrl: img.url,
    width: img.width,
    height: img.height,
    alt: img.alt,
    sortOrder: img.sortOrder,
  });
  revalidatePath('/admin', 'layout'); // refresh the dirty indicator
  return row;
}

export async function updateGalleryImage(tileId: string, fields: { alt: string; caption: string }) {
  await requireSession();
  // Empty caption → null so the public figcaption doesn't render an empty node.
  await updateTile(tileId, { alt: fields.alt, caption: fields.caption.trim() || null });
  revalidatePath('/admin', 'layout');
}

export async function removeGalleryImage(tileId: string) {
  await requireSession();
  await deleteTile(tileId);
  revalidatePath('/admin', 'layout');
}

export async function reorderGalleryImages(orderedIds: string[]) {
  await requireSession();
  await reorderTiles(orderedIds);
  revalidatePath('/admin', 'layout');
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npm run typecheck && npm run lint`
Expected: PASS.
```bash
git add "src/app/admin/(editor)/actions.ts"
git commit -m "feat: server actions for gallery add/update/remove/reorder"
```

---

## Task 4: GalleryManager component

**Files:** Create `src/components/admin/GalleryManager.tsx`

- [ ] **Step 1: Implement**

```tsx
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
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck && npm run lint`
Expected: PASS.
```bash
git add src/components/admin/GalleryManager.tsx
git commit -m "feat: GalleryManager — sortable add/edit/delete gallery images"
```

---

## Task 5: ProjectDetailEditor component

**Files:** Create `src/components/admin/ProjectDetailEditor.tsx`

- [ ] **Step 1: Implement**

```tsx
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
  categories: string[];
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
        categories: p.categories,
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
        <label className="block text-xs">Categories (comma-separated)
          <input
            className={f}
            value={p.categories.join(', ')}
            onChange={(e) => patch({ categories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          />
        </label>
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
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck && npm run lint`
Expected: PASS.
```bash
git add src/components/admin/ProjectDetailEditor.tsx
git commit -m "feat: ProjectDetailEditor — full per-project form + gallery"
```

---

## Task 6: Detail page route `/admin/work/[id]`

**Files:** Create `src/app/admin/(editor)/work/[id]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWorkingProjectById } from '@/db/queries';
import { ProjectDetailEditor, type DetailProject } from '@/components/admin/ProjectDetailEditor';
import type { GalleryImage } from '@/components/admin/GalleryManager';

export const dynamic = 'force-dynamic'; // never cache admin pages

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getWorkingProjectById(id).catch(() => null);
  if (!data || data.project.gallery !== 'work') notFound();

  const project: DetailProject = {
    id: data.project.id,
    slug: data.project.slug,
    title: data.project.title,
    year: data.project.year,
    categories: data.project.categories,
    client: data.project.client ?? '',
    role: data.project.role ?? '',
    summary: data.project.summary,
    description: data.project.description ?? '',
    coverBlobUrl: data.project.coverBlobUrl,
    coverW: data.project.coverW,
    coverH: data.project.coverH,
  };
  const images: GalleryImage[] = data.tiles.map((t) => ({
    id: t.id,
    blobUrl: t.blobUrl,
    width: t.width,
    height: t.height,
    alt: t.alt,
    caption: t.caption ?? '',
  }));

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/work" className="text-xs text-neutral-400 hover:text-white">← Back to grid</Link>
        <h1 className="text-sm uppercase tracking-wide text-neutral-400">Edit project</h1>
      </div>
      <ProjectDetailEditor project={project} images={images} />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS; build output lists `/admin/work/[id]` as a dynamic route.

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(editor)/work/[id]/page.tsx"
git commit -m "feat: /admin/work/[id] project-detail edit page"
```

---

## Task 7: "Edit full details →" link from the Inspector

**Files:** Modify `src/components/admin/Inspector.tsx`, `src/components/admin/GridEditor.tsx`

- [ ] **Step 1: Add the `gallery` prop + link to the Inspector**

In `src/components/admin/Inspector.tsx`, add the Link import at the top (after the `'use client';` line and existing imports):
```tsx
import Link from 'next/link';
```
Add `gallery` to the props destructure and type:
```tsx
export function Inspector({
  tile,
  gallery,
  onChange,
  onSave,
  onDelete,
}: {
  tile: EditorTile;
  gallery: 'work' | 'art';
  onChange: (patch: Partial<EditorTile>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
```
Then, immediately inside the `<aside …>` opening tag (before the cover `<div>`), add the link for Work only:
```tsx
      {gallery === 'work' && (
        <Link
          href={`/admin/work/${tile.id}`}
          className="block rounded border border-neutral-700 px-2 py-1 text-center text-xs hover:bg-neutral-800"
        >
          Edit full details →
        </Link>
      )}
```

- [ ] **Step 2: Pass `gallery` from GridEditor**

In `src/components/admin/GridEditor.tsx`, update the `<Inspector …>` usage (around line 146) to pass `gallery`:
```tsx
        <Inspector
          tile={sel}
          gallery={gallery}
          onChange={(p) => patch(sel.id, p)}
          onSave={() => persistMeta(sel)}
          onDelete={async () => {
            await persist();
            await removeProject(sel.id, gallery);
            window.location.reload();
          }}
        />
```

- [ ] **Step 3: Typecheck, lint, build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/Inspector.tsx src/components/admin/GridEditor.tsx
git commit -m "feat: link from grid Inspector to the project-detail editor (Work)"
```

---

## Task 8: Verify end-to-end + manual QA + push

**Files:** none (verification)

- [ ] **Step 1: Full local verification**

Run: `npm run typecheck && npm run lint && npm run test && npm run build`
Expected: all PASS; tests show the new `tests/db/tiles.test.ts` passing.

- [ ] **Step 2: Manual QA (dev server, DB seeded)**

Run: `npm run dev`
- Sign in at `/admin/login`, go to `/admin/work`, select a project → click **"Edit full details →"**.
- On `/admin/work/[id]`: edit Client, Role, Description → **Save details** → "Unpublished changes" badge appears.
- Add 2–3 gallery images (drag/click to upload) → they appear; set an alt + caption; **drag to reorder**; delete one.
- Click **Publish** (top bar) → open `/work/<slug>` in another tab → confirm the gallery images (in the chosen order, with captions) and Client/Role/Description render.

- [ ] **Step 3: Commit any QA fixes, then push**

```bash
git push origin main
```
Expected: pushes to `origin/main`; Vercel deploys. (The spec + this plan commit go up with this push.)

---

## Self-Review

**Spec coverage:**
- Gallery manager (add/reorder/delete, alt+caption) → Tasks 4 (component), 3 (actions), 2 (reorder query). ✓
- `client`/`role`/`description` fields → Task 5 (`ProjectDetailEditor`), persisted via existing `saveProjectMeta` (already accepts them). ✓
- Dedicated `/admin/work/[id]` page → Task 6. ✓
- Additive integration (Inspector "Edit details →", grid untouched) → Task 7. ✓
- Work-only (Art unaffected) → Task 6 `notFound` when `gallery !== 'work'`; Task 7 link gated on `gallery === 'work'`. ✓
- Drafts → Publish seam unchanged → all actions write working tables + `revalidatePath('/admin','layout')`; Publish via existing `publishNow`. ✓
- Alt defaults to title → `GalleryManager` passes `defaultAlt={p.title}` on add. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code.

**Type consistency:** `GalleryImage` defined in `GalleryManager.tsx`, imported by `ProjectDetailEditor` and the page. `DetailProject` defined in `ProjectDetailEditor.tsx`, imported by the page. `tileOrderUpdates`/`reorderTiles`/`updateTile`/`getWorkingProjectById` defined in Task 2, used in Tasks 3/6. Action names (`addGalleryImage`, `updateGalleryImage`, `removeGalleryImage`, `reorderGalleryImages`) consistent across Tasks 3 and 4. `addGalleryImage` returns the inserted `TileRow` (`{ id, blobUrl, width, height, alt, caption, … }`), consumed by `GalleryManager.onAdded`. Inspector gains `gallery` prop (Task 7) matching the `GridEditor` call site.

**Testing reality:** React components + server actions follow the existing manual-QA pattern (the codebase has no React Testing Library; existing editor UI is verified the same way). Pure logic (`tileOrderUpdates`) is unit-tested.
```
