'use client';

import { useEffect } from 'react';
import type { Project } from '@/content/types';
import { ProjectMeta } from './ProjectMeta';
import { ProjectGallery } from './ProjectGallery';

interface Props {
  project: Project;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Full-screen overlay showing one project's meta + stacked gallery. Replaces
 * the old /work/[slug] detail route now that the site is a single page.
 * Locks body scroll while open; Esc closes, ←/→ step between projects.
 */
export function ProjectLightbox({ project, index, total, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} — project ${index + 1} of ${total}`}
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black"
    >
      {/* Sticky control bar over the scrolling content. */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-b from-black via-black/80 to-transparent px-6 py-5 md:px-10">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-[44px] items-center text-sm font-medium uppercase tracking-wide"
        >
          ← Close
        </button>
        <div className="flex items-center gap-4 text-sm uppercase tracking-wide">
          <span className="tabular-nums text-muted">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous project"
            className="inline-flex min-h-[44px] items-center px-1"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next project"
            className="inline-flex min-h-[44px] items-center px-1"
          >
            Next
          </button>
        </div>
      </div>

      <article className="pb-24 pt-2">
        <ProjectMeta project={project} />
        {/* Fall back to the cover when a project has no gallery images yet, so
            the lightbox is never empty (e.g. a freshly added project). */}
        <ProjectGallery
          images={project.images.length > 0 ? project.images : project.cover.src ? [project.cover] : []}
        />
      </article>
    </div>
  );
}
