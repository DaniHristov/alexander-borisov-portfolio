import type { CSSProperties } from 'react';

export const GRID_COLS = 12;

export function clampSpan(span: number): number {
  return Math.max(1, Math.min(GRID_COLS, Math.round(span)));
}

/** Keep a tile fully on-grid: 0 <= col and col + span <= GRID_COLS. */
export function clampCol(col: number, span: number): number {
  const s = clampSpan(span);
  return Math.max(0, Math.min(GRID_COLS - s, Math.round(col)));
}

/** CSS grid placement honoring explicit col/row (desktop). */
export function placementStyle(g: {
  col: number; row: number; colSpan: number; rowSpan: number; z: number;
}): CSSProperties {
  return {
    gridColumn: `${g.col + 1} / span ${clampSpan(g.colSpan)}`,
    gridRow: `${g.row + 1} / span ${Math.max(1, g.rowSpan)}`,
    zIndex: g.z,
  };
}
