import type { MetadataRoute } from 'next';
import { getAllProjects } from '@/content/projects';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/work', '/art', '/about', '/connect'];
  const now = new Date();

  const staticEntries = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : 0.8,
  }));

  const projectEntries = (await getAllProjects()).map((proj) => ({
    url: `${SITE_URL}/work/${proj.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries];
}
