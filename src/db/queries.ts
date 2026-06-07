import { asc, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { getDb } from './client';
import { projects, tiles, siteContent, publishedSnapshot } from './schema';
import { buildSnapshot } from './snapshot';
import type { NewProjectRow, NewTileRow } from './schema';

type Db = ReturnType<typeof getDb>;

/** Recursively sort object keys so stringify is independent of key order. */
function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') {
    return Object.keys(v as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = canonical((v as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return v;
}

/**
 * Pure structural comparison of two snapshots, independent of key order. The
 * published snapshot is read back from Postgres JSONB, which does NOT preserve
 * insertion key order, so a plain `JSON.stringify` compare would always differ.
 * Canonicalize (sort keys) both sides first.
 */
export function snapshotsDiffer(current: unknown, published: unknown): boolean {
  return JSON.stringify(canonical(current)) !== JSON.stringify(canonical(published));
}

/**
 * "Dirty" = the snapshot we WOULD publish differs from what's currently live.
 * This covers every working surface (projects, tiles, AND site content), unlike
 * a per-table timestamp would, and needs no extra bookkeeping columns.
 */
export async function hasUnpublishedChanges(db: Db = getDb()): Promise<boolean> {
  const [snap] = await db
    .select()
    .from(publishedSnapshot)
    .where(eq(publishedSnapshot.id, 1));
  if (!snap) return true; // never published
  const current = await buildSnapshot(db);
  return snapshotsDiffer(current, snap.data);
}

// --- Reads (working tables) ---
export async function getWorkingProjects(db: Db = getDb()) {
  return db.select().from(projects).orderBy(asc(projects.sortOrder));
}
export async function getWorkingProjectBySlug(slug: string, db: Db = getDb()) {
  const [p] = await db.select().from(projects).where(eq(projects.slug, slug));
  if (!p) return null;
  const imgs = await db
    .select()
    .from(tiles)
    .where(eq(tiles.projectId, p.id))
    .orderBy(asc(tiles.sortOrder));
  return { project: p, tiles: imgs };
}
export async function getWorkingSiteContent(db: Db = getDb()) {
  const [sc] = await db.select().from(siteContent).where(eq(siteContent.id, 1));
  return sc ?? null;
}

// --- Writes ---
function touch() {
  return { updatedAt: new Date() };
}

export async function updateProjectFields(
  id: string,
  fields: Partial<NewProjectRow>,
  db: Db = getDb(),
) {
  await db.update(projects).set({ ...fields, ...touch() }).where(eq(projects.id, id));
}

export async function updateGrid(
  layout: { id: string; col: number; row: number; colSpan: number; rowSpan: number; z: number; sortOrder: number }[],
  db: Db = getDb(),
) {
  if (layout.length === 0) return;
  // One atomic batch so a mid-save failure can't leave the grid half-updated.
  const stmts = layout.map((t) =>
    db
      .update(projects)
      .set({ col: t.col, row: t.row, colSpan: t.colSpan, rowSpan: t.rowSpan, z: t.z, sortOrder: t.sortOrder, ...touch() })
      .where(eq(projects.id, t.id)),
  );
  await db.batch(stmts as [(typeof stmts)[number], ...(typeof stmts)[number][]]);
}

export async function createProject(values: NewProjectRow, db: Db = getDb()) {
  const [row] = await db.insert(projects).values(values).returning();
  return row;
}

export async function deleteProject(id: string, db: Db = getDb()) {
  await db.delete(projects).where(eq(projects.id, id)); // tiles cascade
}

export async function addTile(values: NewTileRow, db: Db = getDb()) {
  const [row] = await db.insert(tiles).values(values).returning();
  return row;
}

export async function deleteTile(id: string, db: Db = getDb()) {
  await db.delete(tiles).where(eq(tiles.id, id));
}

export async function upsertSiteContent(
  fields: Partial<typeof siteContent.$inferInsert>,
  db: Db = getDb(),
) {
  // Never let `id` reach the UPDATE set — Postgres rejects updating a PK.
  const updateSet = { ...fields };
  delete updateSet.id;
  await db
    .insert(siteContent)
    .values({ id: 1, ...updateSet })
    .onConflictDoUpdate({ target: siteContent.id, set: updateSet });
}

// --- Publish ---
export async function publish(db: Db = getDb()): Promise<void> {
  const snapshot = await buildSnapshot(db);
  await db
    .insert(publishedSnapshot)
    .values({ id: 1, data: snapshot, publishedAt: new Date() })
    .onConflictDoUpdate({
      target: publishedSnapshot.id,
      set: { data: snapshot, publishedAt: new Date() },
    });
  revalidateTag('published');
}

export { projects, tiles, siteContent };
