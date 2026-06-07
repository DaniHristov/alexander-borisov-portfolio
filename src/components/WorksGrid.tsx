import type { GalleryProject } from '@/db/snapshot';
import type { CSSProperties } from 'react';
import { ProjectCard } from './ProjectCard';
import { clampSpan } from '@/lib/grid';

interface Props {
  projects: GalleryProject[];
  priorityCount?: number;
}

export function WorksGrid({ projects, priorityCount = 3 }: Props) {
  if (projects.length === 0) {
    return (
      <p className="px-6 py-12 text-sm text-muted md:px-10">No projects to show.</p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-4 px-6 pb-12 sm:grid-cols-12 sm:[grid-auto-flow:dense] md:gap-6 md:px-10">
      {projects.map((p, i) => (
        <li
          key={p.slug}
          // Spans apply only at >= sm (see classes); on mobile every tile is 1 col.
          style={{ '--cs': clampSpan(p.grid.colSpan), '--rs': Math.max(1, p.grid.rowSpan) } as CSSProperties}
          className="min-w-0 sm:[grid-column:span_var(--cs)] sm:[grid-row:span_var(--rs)]"
        >
          <ProjectCard project={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
