'use client';

import { canvasHeight, tileStyle, DESIGN_W } from '@/lib/grid';
import type { EditorTile } from './GridEditor';

/**
 * Read-only render of the current (unsaved) tile arrangement, matching the
 * public collage — full width, real proportions, cover/contain fit, layered by
 * z. Lets the designer see how it will look before saving/publishing.
 */
export function CollagePreview({ tiles }: { tiles: EditorTile[] }) {
  if (tiles.length === 0) {
    return <p className="p-8 text-sm text-neutral-500">Nothing to preview yet.</p>;
  }

  const canvasH = canvasHeight(
    tiles.map((t) => ({ y: t.y, w: t.w, coverW: t.coverW, coverH: t.coverH })),
  );

  return (
    <div className="w-full bg-black">
      <div
        className="relative isolate w-full"
        style={{ aspectRatio: `${DESIGN_W} / ${canvasH}` }}
      >
        {[...tiles]
          .sort((a, b) => a.z - b.z)
          .map((t) => (
            <div key={t.id} style={tileStyle(t, canvasH)}>
              {t.coverBlobUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.coverBlobUrl}
                  alt=""
                  className={`block h-auto w-full ${
                    t.fit === 'contain' ? 'object-contain' : 'bg-neutral-900 object-cover'
                  }`}
                />
              ) : (
                <span className="flex aspect-[4/5] w-full items-center justify-center bg-neutral-900 p-1 text-center text-[10px] text-neutral-500">
                  {t.title || 'untitled'}
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
