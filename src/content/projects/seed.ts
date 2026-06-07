import type { Project } from '../types';
import poster from './_example-poster';
import editorial from './_example-editorial';
import logo from './_example-logo';
import branding from './_example-branding';
import packaging from './_example-packaging';
import artDirection from './_example-art-direction';

// Seed projects, built from the per-project TS modules. This is the FALLBACK
// content used when the database is not configured or has no published
// snapshot (local dev before provisioning, build-time, DB outage). The live
// accessors in src/content/live.ts prefer the DB snapshot and fall back here.
const projectModules: Project[] = [poster, editorial, logo, branding, packaging, artDirection];

export function getAllSeedProjects(): Project[] {
  return [...projectModules].sort((a, b) => {
    if (typeof a.order === 'number' && typeof b.order === 'number') {
      return a.order - b.order;
    }
    if (typeof a.order === 'number') return -1;
    if (typeof b.order === 'number') return 1;
    return b.year - a.year;
  });
}
