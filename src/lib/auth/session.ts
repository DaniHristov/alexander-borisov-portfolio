import { cookies } from 'next/headers';
import { signToken, verifyToken } from './tokens';

const COOKIE = 'db_admin_session';
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

export async function createSession(email: string): Promise<void> {
  const token = signToken({ email, purpose: 'session' }, SESSION_TTL);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });
}

export async function getSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token, 'session');
  return payload ? { email: payload.email } : null;
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
