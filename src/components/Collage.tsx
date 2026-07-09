'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { GalleryProject } from '@/db/snapshot';
import { canvasHeight, tileStyle, DESIGN_W, isAnimated } from '@/lib/grid';
import { ProjectLightbox } from './ProjectLightbox';

interface Props {
  projects: GalleryProject[];
}

function TileImage({ p, priority }: { p: GalleryProject; priority: boolean }) {
  if (!p.cover.src) {
    return (
      <span className="flex aspect-[4/5] w-full items-center justify-center bg-rule px-3 text-center text-xs uppercase tracking-wide text-muted">
        {p.title}
      </span>
    );
  }
  return (
    <Image
      src={p.cover.src}
      alt={p.cover.alt}
      width={p.cover.width}
      height={p.cover.height}
      sizes="(min-width: 1024px) 40vw, 60vw"
      priority={priority}
      unoptimized={isAnimated(p.cover.src)}
      className={`h-auto w-full ${
        p.fit === 'contain' ? 'object-contain' : 'bg-rule object-cover'
      }`}
    />
  );
}

/**
 * Free-canvas collage. Tiles are absolutely positioned in design-px space
 * (see src/lib/grid.ts) so they can overlap, layer (z), and bleed past the
 * frame. The canvas carries `aspect-ratio: DESIGN_W / canvasH`, so the whole
 * thing scales uniformly to its container without any layout JS.
 *
 * Clicking a *clickable* tile opens the project in a lightbox; non-clickable
 * tiles (decorative logos etc.) render as static images. Lightbox prev/next
 * cycles only through the clickable projects.
 */
export function Collage({ projects }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  // The navigable set: only clickable projects, in canvas order.
  const clickable = useMemo(() => projects.filter((p) => p.clickable), [projects]);

  if (projects.length === 0) {
    return <p className="px-6 py-12 text-sm text-muted md:px-10">No projects to show.</p>;
  }

  const canvasH = canvasHeight(
    projects.map((p) => ({ y: p.y, w: p.w, coverW: p.cover.width, coverH: p.cover.height })),
  );

  return (
    <>
      {/* Full-bleed canvas — spans the whole viewport width (no side gutters).
          `isolate` contains the tiles' z-indexes (set freely in the admin) in
          this stacking context, so a high-z tile can never paint above the
          fixed hero stage or the nav. */}
      <div
        className="relative isolate w-full"
        style={{ aspectRatio: `${DESIGN_W} / ${canvasH}` }}
      >
        {projects.map((p, i) =>
          p.clickable ? (
            <button
              key={p.slug}
              type="button"
              onClick={() => setSelected(clickable.indexOf(p))}
              aria-label={`${p.title}, ${p.year}`}
              style={tileStyle(p, canvasH)}
              className="group block cursor-pointer text-left no-underline transition-transform duration-200 ease-out hover:scale-[1.02] hover:no-underline"
            >
              <TileImage p={p} priority={i < 3} />
            </button>
          ) : (
            <div
              key={p.slug}
              aria-hidden
              style={tileStyle(p, canvasH)}
              className="block select-none"
            >
              <TileImage p={p} priority={i < 3} />
            </div>
          ),
        )}
      </div>

      {selected !== null && clickable[selected] && (
        <ProjectLightbox
          project={clickable[selected]}
          index={selected}
          total={clickable.length}
          onClose={() => setSelected(null)}
          onPrev={() => setSelected((s) => (s === null ? s : (s - 1 + clickable.length) % clickable.length))}
          onNext={() => setSelected((s) => (s === null ? s : (s + 1) % clickable.length))}
        />
      )}
    </>
  );
}
