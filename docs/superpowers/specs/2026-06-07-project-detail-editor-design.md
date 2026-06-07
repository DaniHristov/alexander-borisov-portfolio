# Project-Detail Editor — Design

**Date:** 2026-06-07
**Status:** Approved (pending spec review)
**Repo:** alexander-borisov-portfolio

## Problem

The admin can arrange the cover grid and edit a project's cover + basic metadata
(title, year, slug, categories, summary), but it cannot build out a full Work
project. Two things the public detail page (`/work/[slug]`) renders are not
editable:

1. **The image gallery** — the multiple images on the detail page. The data
   model (`tiles`) and queries (`addTile`/`deleteTile`) exist, but no UI or
   server action wires them, so gallery images come only from seed data.
2. **`client`, `role`, `description`** — rendered by `ProjectMeta`, accepted by
   the `saveProjectMeta` action, but absent from the editor UI.

## Goal

Add a dedicated, full-page editor for a single Work project that exposes every
field the detail page renders, plus a gallery-image manager (add / reorder /
delete, with per-image alt + caption). All edits remain drafts until **Publish**.

## Scope

- **Work projects only.** Art has no public detail page (`/art` is a single grid,
  no `/art/[slug]`), so Art keeps its existing cover-grid editor. The gallery
  manager is Work-only.
- **Integration = additive.** The existing grid page + Inspector stay as-is (for
  arranging covers and grid spans). The new detail page is reached via an
  "Edit details →" link on each project. Basic fields appear in both places but
  write the same working row, so drafts stay consistent. (No Inspector refactor.)

## Existing building blocks (already in place)

- `projects` table has `client` / `role` / `description` columns.
- `tiles` table: `id`, `projectId`, `blobUrl`, `width`, `height`,
  `alt` (default `''`), `caption` (nullable), `sortOrder` (default `0`).
- `saveProjectMeta` action already accepts `client` / `role` / `description`.
- `addTile` / `deleteTile` queries exist.
- Image upload goes browser→Blob via `/api/admin/blob-upload` + `ImageDrop`
  (returns `{ url, width, height }`); no Server Action body limit.
- `buildSnapshot` already maps `tiles` → `images[]` (src/alt/width/height/caption)
  and `client`/`role`/`description` into the public `Project` shape.

## Design

### Route / page

`src/app/admin/(editor)/work/[id]/page.tsx` — server component. `requireSession`,
load the working project + its tiles by **id** (stable across slug edits), render
`ProjectDetailEditor`. A new query `getWorkingProjectById(id)` returns
`{ project, tiles }` (mirrors the existing `getWorkingProjectBySlug`).

The grid page (`/admin/work`) Inspector gains an **"Edit details →"** link to
`/admin/work/${id}`.

### Components

- **`ProjectDetailEditor`** (client) — the full form for one project:
  - Cover image (reuse `ImageDrop`) + replace.
  - Text fields: title, year, slug, categories (comma-sep), summary, **client**,
    **role**, **description** (textarea).
  - Saves via the existing `saveProjectMeta` (extended call args: client/role/
    description already supported by the action).
  - Embeds `GalleryManager`.
- **`GalleryManager`** (client) — vertical **drag-to-reorder** list (`@dnd-kit`,
  already a dependency):
  - Each row: thumbnail, **alt** input (pre-filled from the project title,
    editable), optional **caption** input, delete button.
  - An "Add image" drop-zone (reuse `ImageDrop`) uploads to Blob and appends a
    new tile.
  - Drag reorders; reorder persists tile `sortOrder`.

### Server actions (in `src/app/admin/(editor)/actions.ts`)

All write to working tables (drafts); all call `requireSession()` first.

- `addGalleryImage(projectId, { url, width, height })` → `addTile`
  (`alt` defaults to the project title, `sortOrder` = current max + 1).
- `updateGalleryImage(tileId, { alt?, caption? })` → update the tile row.
- `removeGalleryImage(tileId)` → `deleteTile`.
- `reorderGalleryImages(projectId, orderedTileIds)` → batch-update `sortOrder`.

New queries to support these (in `src/db/queries.ts`): `getWorkingProjectById`,
`updateTile(id, fields)`, `reorderTiles(orderedIds)`. (`addTile`/`deleteTile`
already exist.)

### Data flow

1. **Add image:** `ImageDrop` uploads to Blob → `{url,width,height}` →
   `addGalleryImage` → revalidate the edit page → new row appears.
2. **Edit alt/caption:** on blur → `updateGalleryImage`.
3. **Reorder:** drag end → `reorderGalleryImages` with the new id order.
4. **Delete:** `removeGalleryImage`.
5. **Fields:** "Save details" → `saveProjectMeta` (now including client/role/
   description).
6. All of the above mark the content dirty (the "Unpublished changes" badge).
   **Publish** (unchanged) serializes the working tables into the snapshot;
   `/work/[slug]` renders the gallery + fields. The publish seam is untouched.

### Error handling

- Upload failures surface inline in `ImageDrop` (already implemented).
- Server actions validate `requireSession`; invalid tile/project ids are no-ops
  (the action returns; the page reload reflects true state).
- Year guard (ignore 0/empty) carried over from the Inspector.

### Testing

- Unit tests (Vitest) for the new pure-ish query helpers where practical
  (e.g., `reorderTiles` order mapping), following the existing
  `tests/db/publish.test.ts` pattern.
- Manual QA: add → reorder → caption → delete gallery images on a project,
  edit client/role/description, Publish, confirm `/work/[slug]` reflects it.
- `npm run typecheck && npm run lint && npm run test && npm run build` green.

## Out of scope (YAGNI)

- Art detail pages / Art galleries.
- Rich text, section headings, or text blocks between images (magazine layout).
- Per-image layout controls (full-bleed is auto from image width, unchanged).
- Inspector refactor (kept as-is; detail page is additive).
```
