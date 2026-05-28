'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site } from '@/content/site';

const links = [
  { href: '/work', label: 'Work' },
  { href: '/art', label: 'Art' },
  { href: '/connect', label: 'Connect' },
];

/**
 * Fixed nav with a solid black background. On the home page it stays hidden
 * until the scroll-driven hero animation nears its end (listens for the
 * `hero:reveal` event from HeroScrollFrames). On every other page it
 * renders normally on mount.
 *
 * The nav is positioned `fixed` so it takes no layout space — important on
 * the home page so the hero canvas starts at the very top of the viewport
 * and ScrollTrigger pins immediately on the first scroll pixel.
 */
export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [revealed, setRevealed] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    const show = () => setRevealed(true);
    const hide = () => setRevealed(false);
    window.addEventListener('hero:reveal', show);
    window.addEventListener('hero:hide', hide);
    return () => {
      window.removeEventListener('hero:reveal', show);
      window.removeEventListener('hero:hide', hide);
    };
  }, [isHome]);

  return (
    <nav
      aria-label="Primary"
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-black px-6 py-5 transition-opacity duration-500 md:px-10 md:py-7 ${
        revealed ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!revealed}
    >
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center text-base font-medium tracking-tight"
      >
        {site.designer.name}
      </Link>
      <ul className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide md:gap-4">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-[44px] items-center px-2"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
