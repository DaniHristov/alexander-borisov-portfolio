'use server';

import { isAllowedEmail } from '@/lib/auth/allowlist';
import { signToken } from '@/lib/auth/tokens';
import { sendMagicLink } from '@/lib/email/magic-link';

const LINK_TTL = 60 * 15; // 15 minutes

export async function requestLink(
  _prev: { sent: boolean } | undefined,
  formData: FormData,
): Promise<{ sent: boolean }> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  // Always return { sent: true } to avoid leaking which emails are allowed.
  if (email && isAllowedEmail(email)) {
    const token = signToken({ email, purpose: 'login' }, LINK_TTL);
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const url = `${base}/admin/auth/callback?token=${encodeURIComponent(token)}`;
    try {
      await sendMagicLink(email, url);
    } catch (err) {
      // A send failure (e.g. Resend rejecting an unverified recipient) must not
      // crash the page. Log it server-side and still return the neutral response
      // below so we never reveal whether the address is allowed.
      console.error('[admin/login] failed to send magic link:', err);
    }
  }
  return { sent: true };
}
