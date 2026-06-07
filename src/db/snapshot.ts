/**
 * Builds the public payload from the working tables. This is the ONLY place
 * that translates DB rows into the public-facing `Project` / `SiteContent`
 * shapes (src/content/types.ts), so the public site stays decoupled from the
 * database schema.
 *
 * The result is stored verbatim in `published_snapshot.data` on Publish, and
 * the public data layer reads it back. Shape changes here = shape changes the
 * public site sees, only after the next Publish.
 */

import { asc, eq } from 'drizzle-orm';
import type { getDb } from './client';
import { projects, tiles, siteContent } from './schema';
import type { Project, SiteContent, ProjectImage } from '@/content/types';
import { site as seedSite } from '@/content/site';

type Db = ReturnType<typeof getDb>;

export interface GalleryProject extends Project {
  // Snap-grid placement of the cover on the gallery page.
  grid: { col: number; row: number; colSpan: number; rowSpan: number; z: number };
}

export interface Snapshot {
  work: GalleryProject[];
  art: GalleryProject[];
  site: SiteContent;
}

export async function buildSnapshot(db: Db): Promise<Snapshot> {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.sortOrder));

  const galleries: { work: GalleryProject[]; art: GalleryProject[] } = {
    work: [],
    art: [],
  };

  for (const p of allProjects) {
    const galleryImages = await db
      .select()
      .from(tiles)
      .where(eq(tiles.projectId, p.id))
      .orderBy(asc(tiles.sortOrder));

    const images: ProjectImage[] = galleryImages.map((t) => ({
      src: t.blobUrl,
      alt: t.alt,
      width: t.width,
      height: t.height,
      caption: t.caption ?? undefined,
    }));

    const cover: ProjectImage = {
      src: p.coverBlobUrl ?? '',
      alt: p.title,
      width: p.coverW ?? 1600,
      height: p.coverH ?? 2000,
    };

    const project: GalleryProject = {
      slug: p.slug,
      title: p.title,
      year: p.year,
      categories: p.categories as Project['categories'],
      client: p.client ?? undefined,
      role: p.role ?? undefined,
      summary: p.summary,
      description: p.description ?? undefined,
      cover,
      images,
      order: p.sortOrder,
      grid: {
        col: p.col,
        row: p.row,
        colSpan: p.colSpan,
        rowSpan: p.rowSpan,
        z: p.z,
      },
    };

    if (p.gallery === 'art') galleries.art.push(project);
    else galleries.work.push(project);
  }

  const [sc] = await db.select().from(siteContent).where(eq(siteContent.id, 1));

  // Designer name/tagline and SEO are not admin-editable in this build, so they
  // come from the seed (code). About + Contact come from the DB. This keeps the
  // snapshot complete — the public site (hero, metadata) never regresses.
  const site: SiteContent = {
    designer: seedSite.designer,
    seo: seedSite.seo,
    about: sc
      ? {
          bio: sc.bio,
          selectedClients: sc.selectedClients,
          press: sc.press as SiteContent['about']['press'],
          portrait: sc.portraitBlobUrl
            ? { src: sc.portraitBlobUrl, alt: 'Portrait', width: 1200, height: 1500 }
            : undefined,
        }
      : seedSite.about,
    contact: sc
      ? {
          email: sc.email,
          socials: sc.socials as SiteContent['contact']['socials'],
          currently: sc.currently as SiteContent['contact']['currently'],
        }
      : seedSite.contact,
  };

  return { work: galleries.work, art: galleries.art, site };
}
