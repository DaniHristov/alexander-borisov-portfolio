'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function ViewToggle() {
  const pathname = usePathname();
  const params = useSearchParams();
  const tag = params.get('tag');
  const view = params.get('view');

  const hrefFor = (target: 'grid' | 'index') => {
    const sp = new URLSearchParams();
    if (tag) sp.set('tag', tag);
    if (target === 'index') sp.set('view', 'index');
    const q = sp.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  const isIndex = view === 'index';

  return (
    <div
      className="flex items-center gap-3 text-xs uppercase tracking-wide"
      role="group"
      aria-label="View mode"
    >
      <Link
        href={hrefFor('grid')}
        aria-current={!isIndex ? 'page' : undefined}
        className={`inline-flex min-h-[44px] items-center px-2 ${
          !isIndex ? 'underline underline-offset-4' : 'text-muted'
        }`}
      >
        Grid
      </Link>
      <span className="text-muted">/</span>
      <Link
        href={hrefFor('index')}
        aria-current={isIndex ? 'page' : undefined}
        className={`inline-flex min-h-[44px] items-center px-2 ${
          isIndex ? 'underline underline-offset-4' : 'text-muted'
        }`}
      >
        Index
      </Link>
    </div>
  );
}
