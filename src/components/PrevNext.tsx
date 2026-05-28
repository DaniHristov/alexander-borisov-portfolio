import Link from 'next/link';
import type { Project } from '@/content/types';

interface Props {
  prev?: Project;
  next?: Project;
}

export function PrevNext({ prev, next }: Props) {
  return (
    <nav
      aria-label="Project navigation"
      className="mx-auto mt-16 flex w-full max-w-[960px] justify-between border-t border-rule px-6 py-6 text-sm md:px-10"
    >
      <div>
        {prev ? (
          <Link href={`/works/${prev.slug}`} className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted">
              Previous
            </span>
            <span className="font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
      <div className="text-right">
        {next ? (
          <Link href={`/works/${next.slug}`} className="flex flex-col items-end gap-1">
            <span className="text-xs uppercase tracking-wide text-muted">
              Next
            </span>
            <span className="font-medium">{next.title}</span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </nav>
  );
}
