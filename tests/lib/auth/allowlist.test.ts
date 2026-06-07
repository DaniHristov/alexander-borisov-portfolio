import { describe, it, expect, afterEach } from 'vitest';
import { isAllowedEmail } from '@/lib/auth/allowlist';

afterEach(() => { delete process.env.ADMIN_EMAILS; });

describe('isAllowedEmail', () => {
  it('matches case-insensitively and trims whitespace', () => {
    process.env.ADMIN_EMAILS = ' Owner@Site.com , other@x.io ';
    expect(isAllowedEmail('owner@site.com')).toBe(true);
    expect(isAllowedEmail('OTHER@X.IO')).toBe(true);
  });
  it('rejects unlisted emails', () => {
    process.env.ADMIN_EMAILS = 'owner@site.com';
    expect(isAllowedEmail('stranger@evil.com')).toBe(false);
  });
  it('rejects everything when the list is empty/unset', () => {
    expect(isAllowedEmail('owner@site.com')).toBe(false);
  });
});
