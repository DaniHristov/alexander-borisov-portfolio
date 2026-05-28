import type { Project } from '@/content/types';

interface Props {
  project: Project;
}

export function ProjectMeta({ project }: Props) {
  return (
    <header className="mx-auto w-full max-w-[960px] px-6 pb-10 pt-2 md:px-10">
      <h1 className="text-balance text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
        {project.title}
      </h1>
      <dl className="mt-6 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-xs uppercase tracking-wide text-muted">Year</dt>
        <dd className="tabular-nums">{project.year}</dd>
        <dt className="text-xs uppercase tracking-wide text-muted">
          Category
        </dt>
        <dd>{project.categories.join(', ')}</dd>
        {project.client ? (
          <>
            <dt className="text-xs uppercase tracking-wide text-muted">
              Client
            </dt>
            <dd>{project.client}</dd>
          </>
        ) : null}
        {project.role ? (
          <>
            <dt className="text-xs uppercase tracking-wide text-muted">
              Role
            </dt>
            <dd>{project.role}</dd>
          </>
        ) : null}
      </dl>
      <p className="mt-8 max-w-prose text-base leading-relaxed">{project.summary}</p>
      {project.description ? (
        <p className="mt-4 max-w-prose text-base leading-relaxed text-muted">
          {project.description}
        </p>
      ) : null}
    </header>
  );
}
