import { describe, it, expect } from 'vitest';
import { tileOrderUpdates } from '@/db/queries';

describe('tileOrderUpdates', () => {
  it('assigns sortOrder by array position', () => {
    expect(tileOrderUpdates(['c', 'a', 'b'])).toEqual([
      { id: 'c', sortOrder: 0 },
      { id: 'a', sortOrder: 1 },
      { id: 'b', sortOrder: 2 },
    ]);
  });
  it('returns an empty array for no ids', () => {
    expect(tileOrderUpdates([])).toEqual([]);
  });
});
