'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Wraps the home page's in-flow menu so it stays hidden while the fixed
 * <HeroScrollFrames> stage is in front of it — otherwise two identical
 * copies of the menu (plus the top nav) are visible at once during the
 * scroll handoff.
 *
 * Defaults to visible so reduced-motion users, no-JS, and the initial paint
 * (the menu sits below the fold at load) are unaffected; it only hides in
 * response to the `hero:within` event the hero emits while it's on screen,
 * and re-shows on `hero:past`.
 */
export function HeroHandoff({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const within = () => setHidden(true);
    const past = () => setHidden(false);
    window.addEventListener('hero:within', within);
    window.addEventListener('hero:past', past);
    return () => {
      window.removeEventListener('hero:within', within);
      window.removeEventListener('hero:past', past);
    };
  }, []);

  return (
    <div
      className={`transition-opacity duration-200 ${
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
}
