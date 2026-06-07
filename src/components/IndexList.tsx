import Link from 'next/link';
import type { Project } from '@/content/types';

interface Props {
  projects: Project[];
}

export function IndexList({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <p className="px-6 py-12 text-sm text-muted md:px-10">
        No projects to show.
      </p>
    );
  }
  return (
    <ol className="border-t border-rule px-6 pb-12 md:px-10">
      {projects.map((p) => (
        <li
          key={p.slug}
          className="border-b border-rule"
        >
          <Link
            href={`/work/${p.slug}`}
            className="grid grid-cols-[1fr_auto_auto] items-baseline gap-6 py-4 text-sm no-underline hover:no-underline md:py-5"
          >
            <span className="font-medium">{p.title}</span>
            <span className="text-xs uppercase tracking-wide text-muted">
              {p.categories.join(' · ')}
            </span>
            <span className="tabular-nums text-muted">{p.year}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
