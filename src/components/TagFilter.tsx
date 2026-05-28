'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Category } from '@/content/types';

interface Props {
  tags: Category[];
}

export function TagFilter({ tags }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const rawActive = params.get('tag');
  const active = rawActive && tags.includes(rawActive as never)
    ? rawActive
    : null;
  const view = params.get('view');

  const hrefFor = (tag: string | null) => {
    const sp = new URLSearchParams();
    if (tag) sp.set('tag', tag);
    if (view) sp.set('view', view);
    const q = sp.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  return (
    <nav aria-label="Filter projects by category">
      <ul className="-mx-6 flex gap-1 overflow-x-auto px-4 text-xs uppercase tracking-wide md:-mx-10 md:px-8">
        <li>
          <Link
            href={hrefFor(null)}
            aria-current={active === null ? 'page' : undefined}
            className={`inline-flex min-h-[44px] items-center px-2 ${
              active === null
                ? 'underline underline-offset-4'
                : 'text-muted hover:text-fg'
            }`}
          >
            All
          </Link>
        </li>
        {tags.map((t) => (
          <li key={t}>
            <Link
              href={hrefFor(t)}
              aria-current={active === t ? 'page' : undefined}
              className={`inline-flex min-h-[44px] items-center whitespace-nowrap px-2 ${
                active === t
                  ? 'underline underline-offset-4'
                  : 'text-muted hover:text-fg'
              }`}
            >
              {t.replaceAll('-', ' ')}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
