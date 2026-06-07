import { describe, it, expect } from 'vitest';
import { GRID_COLS, clampSpan, clampCol } from '@/lib/grid';

describe('grid helpers', () => {
  it('GRID_COLS is 12', () => expect(GRID_COLS).toBe(12));
  it('clampSpan keeps span within 1..GRID_COLS', () => {
    expect(clampSpan(0)).toBe(1);
    expect(clampSpan(99)).toBe(12);
    expect(clampSpan(4)).toBe(4);
  });
  it('clampCol keeps a tile on-grid given its span', () => {
    expect(clampCol(10, 4)).toBe(8); // 8 + 4 = 12, fits
    expect(clampCol(-2, 4)).toBe(0);
  });
});
