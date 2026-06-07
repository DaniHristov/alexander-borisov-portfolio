import { describe, it, expect, beforeAll } from 'vitest';
import { signToken, verifyToken } from '@/lib/auth/tokens';

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-please-change';
});

describe('signToken / verifyToken', () => {
  it('round-trips a payload', () => {
    const token = signToken({ email: 'a@b.com', purpose: 'login' }, 60);
    expect(verifyToken(token, 'login')).toMatchObject({ email: 'a@b.com', purpose: 'login' });
  });

  it('rejects a tampered token', () => {
    const token = signToken({ email: 'a@b.com', purpose: 'login' }, 60);
    const tampered = token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa');
    expect(verifyToken(tampered, 'login')).toBeNull();
  });

  it('rejects an expired token', () => {
    const token = signToken({ email: 'a@b.com', purpose: 'login' }, -1); // already expired
    expect(verifyToken(token, 'login')).toBeNull();
  });

  it('rejects a purpose mismatch', () => {
    const token = signToken({ email: 'a@b.com', purpose: 'login' }, 60);
    expect(verifyToken(token, 'session')).toBeNull();
  });
});
