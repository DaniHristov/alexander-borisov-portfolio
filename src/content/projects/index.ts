import type { Category, Project } from '../types';
import poster from './_example-poster';
import editorial from './_example-editorial';
import logo from './_example-logo';
import branding from './_example-branding';
import packaging from './_example-packaging';
import artDirection from './_example-art-direction';

const projectModules: Project[] = [poster, editorial, logo, branding, packaging, artDirection];

export function getAllProjects(): Project[] {
  return [...projectModules].sort((a, b) => {
    if (typeof a.order === 'number' && typeof b.order === 'number') {
      return a.order - b.order;
    }
    if (typeof a.order === 'number') return -1;
    if (typeof b.order === 'number') return 1;
    return b.year - a.year;
  });
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projectModules.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured === true);
}

export function getProjectsByCategory(category: Category): Project[] {
  return getAllProjects().filter((p) => p.categories.includes(category));
}
