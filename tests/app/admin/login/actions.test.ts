import { describe, it, expect, vi, beforeAll } from 'vitest';

// Simulate the email provider failing (e.g. Resend 403 test-mode restriction).
vi.mock('@/lib/email/magic-link', () => ({
  sendMagicLink: vi.fn(async () => {
    throw new Error('Resend send failed: 403 test-mode restriction');
  }),
}));

import { requestLink } from '@/app/admin/login/actions';

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-please-change';
  process.env.ADMIN_EMAILS = 'admin@site.com';
});

function form(email: string): FormData {
  const f = new FormData();
  f.set('email', email);
  return f;
}

describe('requestLink', () => {
  it('does not crash when the email provider throws — returns neutral { sent: true }', async () => {
    await expect(requestLink(undefined, form('admin@site.com'))).resolves.toEqual({ sent: true });
  });

  it('returns { sent: true } for a non-allowed email without attempting a send', async () => {
    await expect(requestLink(undefined, form('stranger@evil.com'))).resolves.toEqual({ sent: true });
  });
});
