/**
 * Sends the one-time admin login link. In production (RESEND_API_KEY set) it
 * emails via Resend. In local dev (no key) it logs the link to the server
 * console so the flow is testable without provisioning email.
 */
export async function sendMagicLink(email: string, url: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[magic-link] Dev mode — open this link to sign in as ${email}:\n${url}\n`);
    return;
  }
  // Defense-in-depth: the URL is a server-built signed-token link, but escape
  // quotes/angle brackets before inlining so it can never break out of the href.
  const safeUrl = url.replace(/"/g, '%22').replace(/</g, '%3C').replace(/>/g, '%3E');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Verified sender. `onboarding@resend.dev` (Resend's test sender) only
      // delivers to the Resend account owner's address — set RESEND_FROM to a
      // sender on a domain you've verified in Resend to email anyone.
      from: process.env.RESEND_FROM ?? 'Portfolio Admin <onboarding@resend.dev>',
      to: [email],
      subject: 'Your sign-in link',
      html: `<p>Click to sign in to the portfolio admin:</p><p><a href="${safeUrl}">${safeUrl}</a></p><p>This link expires in 15 minutes.</p>`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
}
