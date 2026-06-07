/**
 * Seed the database from the existing TypeScript content so nothing is lost
 * when the site moves from static modules to Neon. Idempotent: clears the
 * working tables, re-inserts, then writes the published snapshot so the public
 * site shows the same content immediately.
 *
 * Run AFTER applying the migration:
 *   npm run db:migrate
 *   npm run db:seed
 *
 * Requires DATABASE_URL in .env.local.
 *
 * Image note: the existing content references local SVG/placeholder paths under
 * /public. The seed stores those paths as `blobUrl` so the public site keeps
 * rendering. Real uploads (→ Vercel Blob) replace them via the admin later.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAllSeedProjects } from '../src/content/projects/seed.ts';
import { artPieces, artIntro } from '../src/content/art.ts';
import { site } from '../src/content/site.ts';
import { getDb } from '../src/db/client.ts';
import { projects, tiles, siteContent, publishedSnapshot } from '../src/db/schema.ts';
import { buildSnapshot } from '../src/db/snapshot.ts';

async function main() {
  // 12-column grid: each cover is 4 columns wide (3 per row).
  const COL_SPAN = 4;
  const PER_ROW = 3;
  const db = getDb();

  console.log('Clearing working tables…');
  await db.delete(tiles);
  await db.delete(projects);
  await db.delete(siteContent);

  // --- Work projects (from the seed modules, not the DB accessors) ---
  const work = getAllSeedProjects();
  console.log(`Seeding ${work.length} work projects…`);
  let i = 0;
  for (const p of work) {
    const [inserted] = await db
      .insert(projects)
      .values({
        slug: p.slug,
        gallery: 'work',
        title: p.title,
        year: p.year,
        categories: p.categories,
        client: p.client ?? null,
        role: p.role ?? null,
        summary: p.summary,
        description: p.description ?? null,
        coverBlobUrl: p.cover.src,
        coverW: p.cover.width,
        coverH: p.cover.height,
        col: (i % PER_ROW) * COL_SPAN,
        row: Math.floor(i / PER_ROW),
        colSpan: COL_SPAN,
        rowSpan: 1,
        z: 0,
        status: 'published',
        sortOrder: i,
      })
      .returning();

    // Detail-gallery images
    for (let j = 0; j < p.images.length; j++) {
      const img = p.images[j];
      await db.insert(tiles).values({
        projectId: inserted.id,
        blobUrl: img.src,
        width: img.width,
        height: img.height,
        alt: img.alt,
        caption: img.caption ?? null,
        sortOrder: j,
      });
    }
    i++;
  }

  // --- Art pieces (from src/content/art) ---
  // These are CSS-pattern placeholders today (no image files). We seed them as
  // projects in the 'art' gallery with an empty cover URL; the admin replaces
  // them with real uploads. blobUrl on a tile is required, so art pieces get
  // no detail tiles until real images exist.
  console.log(`Seeding ${artPieces.length} art pieces…`);
  for (let a = 0; a < artPieces.length; a++) {
    const piece = artPieces[a];
    await db.insert(projects).values({
      slug: `art-${slugify(piece.title)}`,
      gallery: 'art',
      title: piece.title,
      year: piece.year,
      categories: [],
      role: piece.medium,
      summary: `${piece.medium} — ${piece.dimensions}`,
      coverBlobUrl: null,
      col: (a % PER_ROW) * COL_SPAN,
      row: Math.floor(a / PER_ROW),
      colSpan: COL_SPAN,
      rowSpan: 1,
      z: 0,
      status: 'published',
      sortOrder: a,
    });
  }

  // --- Site content (About + Connect) ---
  console.log('Seeding site content…');
  await db.insert(siteContent).values({
    id: 1,
    bio: site.about.bio,
    selectedClients: site.about.selectedClients ?? [],
    press: site.about.press ?? [],
    portraitBlobUrl: site.about.portrait?.src ?? null,
    email: site.contact.email,
    socials: site.contact.socials,
    // 'Currently' rows are defined inline on the Connect page today; seed the
    // same defaults so the form has content to edit.
    currently: [
      { label: 'Booking identity & editorial work', value: 'Autumn 2026 →' },
      { label: 'Based between Sofia & the California coast', value: 'GMT+2 / PT' },
      { label: 'Visiting critic, Werkplaats Typografie', value: 'Ongoing' },
    ],
  });

  // --- Publish snapshot (so the public site has data on first load) ---
  console.log('Writing published snapshot…');
  const snapshot = await buildSnapshot(db);
  await db
    .insert(publishedSnapshot)
    .values({ id: 1, data: snapshot })
    .onConflictDoUpdate({
      target: publishedSnapshot.id,
      set: { data: snapshot, publishedAt: new Date() },
    });

  console.log(`Done. artIntro length: ${artIntro.length} (kept for reference).`);
  console.log('Seed complete ✅');
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
