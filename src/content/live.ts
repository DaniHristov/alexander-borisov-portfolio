/**
 * Live data layer — the single seam between the public site and its content
 * source. Public pages call these accessors; they read the PUBLISHED snapshot
 * from the database (one cached row), and fall back to seed content when the
 * DB is not configured or has no snapshot yet.
 *
 * The cache is tagged 'published'; the admin's Publish action calls
 * revalidateTag('published') so the public site picks up new content without a
 * redeploy. Reads stay off the working tables entirely.
 */

import { unstable_cache } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getDb, isDbConfigured } from '@/db/client';
import { publishedSnapshot } from '@/db/schema';
import type { Snapshot, GalleryProject } from '@/db/snapshot';
import type { Project, SiteContent } from './types';
import { tileHeightPx } from '@/lib/grid';
import { getAllSeedProjects } from './projects/seed';
import { site as seedSite } from './site';

// Seed collage layout: a 3-column masonry cascade in design-px space
// (DESIGN_W = 1440). Real layouts are authored in the admin; this just gives
// the seed fallback a sensible free-canvas arrangement.
const SEED_COLS = [40, 510, 980];
const SEED_W = 420;
const SEED_GAP = 40;

// Fallback payload when the DB has nothing to serve. Art is empty here until
// real pieces are uploaded via the admin.
function seedSnapshot(): Snapshot {
  const colBottom = [0, 0, 0];
  const work: GalleryProject[] = getAllSeedProjects().map((p, i) => {
    // Drop each tile into the currently shortest column (masonry).
    let c = 0;
    for (let k = 1; k < colBottom.length; k++) {
      if (colBottom[k] < colBottom[c]) c = k;
    }
    const x = SEED_COLS[c];
    const y = colBottom[c];
    colBottom[c] = y + tileHeightPx(SEED_W, p.cover.width, p.cover.height) + SEED_GAP;
    return { ...p, x, y, w: SEED_W, z: i, fit: 'cover' as const, clickable: true };
  });
  return { work, art: [], site: seedSite };
}

async function readSnapshot(): Promise<Snapshot> {
  if (!isDbConfigured()) return seedSnapshot();
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(publishedSnapshot)
      .where(eq(publishedSnapshot.id, 1));
    if (!row) return seedSnapshot();
    return row.data as Snapshot;
  } catch (err) {
    console.warn('[content/live] snapshot read failed, using seed:', err);
    return seedSnapshot();
  }
}

const getCachedSnapshot = unstable_cache(readSnapshot, ['published-snapshot-v1'], {
  tags: ['published'],
});

// Prefer the cached reader inside a Next request; fall back to the uncached
// reader when the cache runtime isn't available (unit tests, scripts).
export async function getPublishedData(): Promise<Snapshot> {
  try {
    return await getCachedSnapshot();
  } catch {
    return readSnapshot();
  }
}

export async function getAllProjects(): Promise<GalleryProject[]> {
  return (await getPublishedData()).work;
}

export async function getArtProjects(): Promise<GalleryProject[]> {
  return (await getPublishedData()).art;
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const data = await getPublishedData();
  return [...data.work, ...data.art].find((p) => p.slug === slug);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getAllProjects()).filter((p) => p.featured === true);
}

export async function getSiteContent(): Promise<SiteContent> {
  return (await getPublishedData()).site;
}
