'use client';

/**
 * Custom circle cursor — small solid white circle that lerps after the mouse
 * and grows on hover. `mix-blend-mode: difference` inverts whatever's
 * underneath, so hovering over an element shows its color-negative.
 *
 * Why a single element: mix-blend-mode blends against the nearest stacking
 * context. Nesting the blended element inside any wrapper that creates a
 * stacking context (fixed + z-index, will-change, transformed parent, etc.)
 * isolates the blend so the cursor only blends with its own (empty) parent.
 * Keeping it as one direct child of <body> means the blend runs against the
 * whole page.
 *
 * Centering: `gsap.set({ xPercent: -50, yPercent: -50 })` shifts by half the
 * element's own size, then `x`/`y` track the cursor in viewport pixels — so
 * the visual center always sits exactly on the cursor regardless of scale.
 */

import { useEffect, useRef, useState } from 'react';
import type { gsap as GsapType } from 'gsap';

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], label, summary, [data-cursor="grow"]';
const BASE_SIZE = 20; // px
const HOVER_SCALE = 3.0; // grows to ~60px on interactive hover

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const gsapRef = useRef<typeof GsapType | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Only enable on devices with a fine pointer (mouse / trackpad).
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine) setEnabled(true);
  }, []);

  // Mouse tracking
  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      gsapRef.current = gsap;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduced ? 0 : 0.22;

      // Anchor: shift element by -50% of its own size so x/y centers on cursor
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });

      const xTo = gsap.quickTo(cursor, 'x', { duration, ease: 'power3' });
      const yTo = gsap.quickTo(cursor, 'y', { duration, ease: 'power3' });

      const onMove = (e: MouseEvent) => {
        setVisible(true);
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const onOver = (e: MouseEvent) => {
        const target = e.target as Element | null;
        const interactive = !!target?.closest?.(INTERACTIVE_SELECTOR);
        setHovering(interactive);
      };
      const onLeave = () => setVisible(false);
      const onEnter = () => setVisible(true);

      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseover', onOver, { passive: true });
      document.documentElement.addEventListener('mouseleave', onLeave);
      document.documentElement.addEventListener('mouseenter', onEnter);

      cleanup = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseover', onOver);
        document.documentElement.removeEventListener('mouseleave', onLeave);
        document.documentElement.removeEventListener('mouseenter', onEnter);
      };
    })();

    return () => cleanup?.();
  }, [enabled]);

  // Scale on hover (GPU-cheap; centering stays correct because xPercent/yPercent
  // are still relative to the post-scale size)
  useEffect(() => {
    const cursor = cursorRef.current;
    const gsap = gsapRef.current;
    if (!cursor || !gsap) return;
    gsap.to(cursor, {
      scale: hovering ? HOVER_SCALE : 1,
      duration: 0.28,
      ease: 'power2.out',
    });
  }, [hovering]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className={`pointer-events-none fixed left-0 top-0 z-[9999] rounded-full bg-white mix-blend-difference ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        width: BASE_SIZE,
        height: BASE_SIZE,
        transition: 'opacity 200ms ease-out',
      }}
    />
  );
}
