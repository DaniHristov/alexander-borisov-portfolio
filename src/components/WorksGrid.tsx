import type { Project } from '@/content/types';
import { ProjectCard } from './ProjectCard';

interface Props {
  projects: Project[];
  priorityCount?: number;
}

export function WorksGrid({ projects, priorityCount = 3 }: Props) {
  if (projects.length === 0) {
    return (
      <p className="px-6 py-12 text-sm text-muted md:px-10">
        No projects to show.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-x-4 gap-y-10 px-6 pb-12 sm:grid-cols-2 md:gap-x-6 md:px-10 lg:grid-cols-3">
      {projects.map((p, i) => (
        <li key={p.slug}>
          <ProjectCard project={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
