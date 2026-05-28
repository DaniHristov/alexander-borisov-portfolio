import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/content/types';

interface Props {
  project: Project;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: Props) {
  return (
    <Link
      href={`/works/${project.slug}`}
      className="group block no-underline hover:no-underline"
      aria-label={`${project.title}, ${project.year}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-rule">
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className={`object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02] ${priority ? 'first-image-fade' : ''}`}
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{project.title}</span>
        <span className="shrink-0 text-xs uppercase tracking-wide text-muted">
          {project.categories.join(' · ')}
        </span>
      </div>
    </Link>
  );
}
