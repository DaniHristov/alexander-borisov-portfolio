import { describe, it, expect } from 'vitest';
import { DESIGN_W, tileHeightPx, canvasHeight, tileStyle } from '@/lib/grid';

describe('grid helpers', () => {
  it('DESIGN_W is the fixed canvas width', () => expect(DESIGN_W).toBe(1440));

  it('tileHeightPx derives height from the cover aspect ratio', () => {
    // A 800×1000 cover at width 400 → height 500 (keeps 4:5 aspect).
    expect(tileHeightPx(400, 800, 1000)).toBe(500);
    // Square cover keeps width.
    expect(tileHeightPx(300, 600, 600)).toBe(300);
  });

  it('tileHeightPx falls back to a 4:5 portrait when cover size is unknown', () => {
    expect(tileHeightPx(400)).toBe(500);
    expect(tileHeightPx(400, null, null)).toBe(500);
  });

  it('canvasHeight is the lowest tile bottom edge', () => {
    const tiles = [
      { y: 0, w: 400, coverW: 800, coverH: 1000 }, // bottom = 500
      { y: 300, w: 400, coverW: 800, coverH: 800 }, // bottom = 300 + 400 = 700
    ];
    expect(canvasHeight(tiles)).toBe(700);
    expect(canvasHeight([])).toBe(0);
  });

  it('tileStyle positions a tile as percentages of the canvas box', () => {
    const s = tileStyle({ x: 720, y: 350, w: 720, z: 3 }, 700);
    expect(s.position).toBe('absolute');
    expect(s.left).toBe('50%'); // 720 / 1440
    expect(s.top).toBe('50%'); // 350 / 700
    expect(s.width).toBe('50%'); // 720 / 1440
    expect(s.zIndex).toBe(3);
  });
});
