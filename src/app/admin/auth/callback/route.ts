import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/tokens';
import { isAllowedEmail } from '@/lib/auth/allowlist';
import { createSession } from '@/lib/auth/session';

export const runtime = 'nodejs'; // crypto + cookie signing

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const payload = token ? verifyToken(token, 'login') : null;
  if (!payload || !isAllowedEmail(payload.email)) {
    return NextResponse.redirect(new URL('/admin/login?error=1', req.url));
  }
  await createSession(payload.email);
  return NextResponse.redirect(new URL('/admin', req.url));
}
