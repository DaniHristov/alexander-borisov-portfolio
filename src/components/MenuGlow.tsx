'use client';

import { useEffect, useState } from 'react';

/**
 * Ambient haze behind the home menu. It does NOT scroll into view — that made
 * it read as a mysterious image rising from below during the intro handoff.
 * Instead it stays put (absolute, centered in the menu section) and only
 * FADES IN once the intro reel hands off (`hero:past`), by which point the
 * section already fills the viewport — so the glow materializes in place,
 * centered, never sliding up. Fades back out if the user scrolls back into the
 * reel (`hero:within`).
 *
 * Starts hidden; the menu section sits below the fold at load, so there's
 * nothing to reveal until the handoff. Reduced-motion / no-JS still get it,
 * since the hero dispatches `hero:past` on mount in those cases.
 */
export function MenuGlow() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const within = () => setVisible(false);
    const past = () => setVisible(true);
    window.addEventListener('hero:within', within);
    window.addEventListener('hero:past', past);
    return () => {
      window.removeEventListener('hero:within', within);
      window.removeEventListener('hero:past', past);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`menu-glow pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(245,245,245,0.12)_0%,transparent_70%)] transition-opacity duration-1000 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
