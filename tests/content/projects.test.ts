import { describe, it, expect } from 'vitest';
import {
  getAllProjects,
  getProjectBySlug,
  getFeaturedProjects,
  getProjectsByCategory,
} from '@/content/projects';
import type { Project } from '@/content/types';

const makeProject = (overrides: Partial<Project>): Project => ({
  slug: 'p',
  title: 'P',
  year: 2024,
  categories: ['other'],
  summary: 's',
  cover: { src: '/x.jpg', alt: '', width: 100, height: 100 },
  images: [],
  ...overrides,
});

describe('getAllProjects', () => {
  it('returns projects sorted by year descending by default', () => {
    const projects = getAllProjects();
    for (let i = 1; i < projects.length; i++) {
      expect(projects[i - 1].year).toBeGreaterThanOrEqual(projects[i].year);
    }
  });

  it('honors manual `order` field over year when provided', () => {
    const projects = getAllProjects();
    const ordered = projects.filter((p) => typeof p.order === 'number');
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i - 1].order!).toBeLessThanOrEqual(ordered[i].order!);
    }
  });
});

describe('getProjectBySlug', () => {
  it('returns the project with the matching slug', () => {
    const all = getAllProjects();
    if (all.length === 0) return;
    const target = all[0];
    expect(getProjectBySlug(target.slug)).toEqual(target);
  });

  it('returns undefined for an unknown slug', () => {
    expect(getProjectBySlug('does-not-exist-zzz')).toBeUndefined();
  });
});

describe('getFeaturedProjects', () => {
  it('returns only projects with featured === true', () => {
    const featured = getFeaturedProjects();
    for (const p of featured) {
      expect(p.featured).toBe(true);
    }
  });
});

describe('getProjectsByCategory', () => {
  it('returns only projects whose categories include the given tag', () => {
    const filtered = getProjectsByCategory('logo');
    for (const p of filtered) {
      expect(p.categories).toContain('logo');
    }
  });

  it('is case-sensitive and returns [] for unknown categories', () => {
    // @ts-expect-error testing runtime behavior with invalid input
    expect(getProjectsByCategory('NOPE')).toEqual([]);
  });
});
