import type { MetadataRoute } from 'next';
import { getAllProjects } from '@/content/projects';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/works', '/about', '/contact'];
  const now = new Date();

  const staticEntries = staticPaths.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : 0.8,
  }));

  const projectEntries = getAllProjects().map((proj) => ({
    url: `${SITE_URL}/works/${proj.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries];
}
