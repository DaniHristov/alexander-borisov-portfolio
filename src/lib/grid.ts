import type { CSSProperties } from 'react';

/**
 * Free-canvas collage model. Tiles are positioned on a virtual canvas of fixed
 * width `DESIGN_W` (in "design px"). x/y/w are stored in that space; x and y may
 * be negative or exceed DESIGN_W so a tile can bleed past the frame. A tile's
 * height is derived from its cover's aspect ratio, so the designer only controls
 * width. The public canvas scales uniformly to its container (percentage-based),
 * so no JavaScript is needed to lay it out responsively.
 */
export const DESIGN_W = 1440;

/** Vertical gap (design px) inserted between stacked galleries (work → art). */
export const CANVAS_GAP = 120;

export type Fit = 'cover' | 'contain';

/** Default aspect (h/w) when a tile has no cover dimensions yet. */
const DEFAULT_AR = 5 / 4;

/** Rendered height (design px) of a tile of width `w` given its cover size. */
export function tileHeightPx(
  w: number,
  coverW?: number | null,
  coverH?: number | null,
): number {
  const ar = coverW && coverH ? coverH / coverW : DEFAULT_AR;
  return w * ar;
}

export interface CanvasTile {
  y: number;
  w: number;
  coverW?: number | null;
  coverH?: number | null;
}

/** Total height (design px) of a canvas: the lowest tile bottom edge. */
export function canvasHeight(tiles: CanvasTile[]): number {
  if (tiles.length === 0) return 0;
  return Math.max(
    0,
    ...tiles.map((t) => t.y + tileHeightPx(t.w, t.coverW, t.coverH)),
  );
}

/**
 * Absolute CSS placement for a tile inside a canvas of height `canvasH`. Left,
 * top and width are percentages of the canvas box (which itself carries
 * `aspect-ratio: DESIGN_W / canvasH`), so x/y/w scale together at any size.
 */
export function tileStyle(
  t: { x: number; y: number; w: number; z: number },
  canvasH: number,
): CSSProperties {
  return {
    position: 'absolute',
    left: `${(t.x / DESIGN_W) * 100}%`,
    top: canvasH > 0 ? `${(t.y / canvasH) * 100}%` : '0%',
    width: `${(t.w / DESIGN_W) * 100}%`,
    zIndex: t.z,
  };
}
