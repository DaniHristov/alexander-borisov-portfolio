import { describe, it, expect } from 'vitest';
import { snapshotsDiffer } from '@/db/queries';

describe('snapshotsDiffer', () => {
  it('is false for structurally identical snapshots', () => {
    const a = { work: [{ slug: 'x', grid: { col: 0 } }], art: [], site: { email: 'a@b.com' } };
    const b = { work: [{ slug: 'x', grid: { col: 0 } }], art: [], site: { email: 'a@b.com' } };
    expect(snapshotsDiffer(a, b)).toBe(false);
  });

  it('is true when a field changes', () => {
    const a = { work: [], art: [], site: { email: 'a@b.com' } };
    const b = { work: [], art: [], site: { email: 'changed@b.com' } };
    expect(snapshotsDiffer(a, b)).toBe(true);
  });

  it('is true when an item is added', () => {
    const a = { work: [], art: [], site: {} };
    const b = { work: [{ slug: 'new' }], art: [], site: {} };
    expect(snapshotsDiffer(a, b)).toBe(true);
  });

  it('is true when comparing against a null/absent published snapshot', () => {
    expect(snapshotsDiffer({ work: [], art: [], site: {} }, null)).toBe(true);
  });

  it('is false when only key order differs (JSONB does not preserve order)', () => {
    const built = { work: [{ slug: 'x', title: 'A', year: 2024 }], art: [], site: { email: 'a@b.com' } };
    const fromJsonb = { site: { email: 'a@b.com' }, art: [], work: [{ year: 2024, title: 'A', slug: 'x' }] };
    expect(snapshotsDiffer(built, fromJsonb)).toBe(false);
  });
});
