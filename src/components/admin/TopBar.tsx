'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const TABS = [
  { href: '/admin/work', label: 'Collage' },
  { href: '/admin/about', label: 'About' },
  { href: '/admin/connect', label: 'Connect' },
];

export function TopBar({ dirty, actions }: { dirty: boolean; actions: ReactNode }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-neutral-800 bg-black px-4 py-3">
      <nav className="flex items-center gap-1 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded px-3 py-1.5 ${
              pathname.startsWith(t.href) ? 'bg-neutral-800 text-white' : 'text-neutral-400'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        {dirty && (
          <span className="text-xs text-amber-400" title="You have unpublished changes">
            ● Unpublished changes
          </span>
        )}
        {actions}
      </div>
    </header>
  );
}
