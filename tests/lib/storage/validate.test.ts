import { describe, it, expect } from 'vitest';
import { validateUpload, MAX_BYTES } from '@/lib/storage/upload';

describe('validateUpload', () => {
  it('accepts a jpeg under the cap', () => {
    expect(validateUpload('image/jpeg', 1000)).toBeNull();
  });
  it('accepts an animated gif', () => {
    expect(validateUpload('image/gif', 1000)).toBeNull();
  });
  it('rejects a non-image MIME', () => {
    expect(validateUpload('application/pdf', 1000)).toMatch(/image/i);
  });
  it('rejects oversize files', () => {
    expect(validateUpload('image/png', MAX_BYTES + 1)).toMatch(/large/i);
  });
});
