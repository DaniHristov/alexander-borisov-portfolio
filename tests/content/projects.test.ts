import { describe, it, expect } from 'vitest';
import {
  getAllProjects,
  getProjectBySlug,
  getFeaturedProjects,
  getProjectsByCategory,
} from '@/content/projects';

// These accessors are async (DB snapshot with seed fallback). With no
// DATABASE_URL set in the test env, they resolve to the seed content.

describe('getAllProjects', () => {
  it('returns projects sorted by year descending by default', async () => {
    const projects = await getAllProjects();
    for (let i = 1; i < projects.length; i++) {
      expect(projects[i - 1].year).toBeGreaterThanOrEqual(projects[i].year);
    }
  });

  it('honors manual `order` field over year when provided', async () => {
    const projects = await getAllProjects();
    const ordered = projects.filter((p) => typeof p.order === 'number');
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i - 1].order!).toBeLessThanOrEqual(ordered[i].order!);
    }
  });
});

describe('getProjectBySlug', () => {
  it('returns the project with the matching slug', async () => {
    const all = await getAllProjects();
    if (all.length === 0) return;
    const target = all[0];
    expect(await getProjectBySlug(target.slug)).toEqual(target);
  });

  it('returns undefined for an unknown slug', async () => {
    expect(await getProjectBySlug('does-not-exist-zzz')).toBeUndefined();
  });
});

describe('getFeaturedProjects', () => {
  it('returns only projects with featured === true', async () => {
    const featured = await getFeaturedProjects();
    for (const p of featured) {
      expect(p.featured).toBe(true);
    }
  });
});

describe('getProjectsByCategory', () => {
  it('returns only projects whose categories include the given tag', async () => {
    const filtered = await getProjectsByCategory('logo');
    for (const p of filtered) {
      expect(p.categories).toContain('logo');
    }
  });

  it('is case-sensitive and returns [] for unknown categories', async () => {
    // @ts-expect-error testing runtime behavior with invalid input
    expect(await getProjectsByCategory('NOPE')).toEqual([]);
  });
});
