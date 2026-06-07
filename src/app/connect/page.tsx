import type { Metadata } from 'next';
import { getSiteContent } from '@/content/live';

export const metadata: Metadata = {
  title: 'Connect',
};

export default async function ConnectPage() {
  const site = await getSiteContent();
  const currently = site.contact.currently ?? [];
  return (
    <article className="mx-auto w-full max-w-[760px] px-6 pb-20 pt-4 md:px-10">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
        Connect
      </h1>

      <div className="mt-10 space-y-6 text-base leading-relaxed">
        <p>
          For new projects, collaborations, teaching, or press — I read every
          message and reply to most within a few days. The studio takes on a
          small number of engagements each season to keep the work close.
        </p>
        <p>
          <a
            href={`mailto:${site.contact.email}`}
            className="inline-flex min-h-[44px] items-center text-lg font-medium underline underline-offset-4"
          >
            {site.contact.email}
          </a>
        </p>
      </div>

      {currently.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xs uppercase tracking-wide text-muted">Currently</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule text-sm">
            {currently.map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-[1fr_auto] gap-4 py-3"
              >
                <span>{row.label}</span>
                <span className="text-right text-muted">{row.value}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-xs uppercase tracking-wide text-muted">Elsewhere</h2>
        <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-xs uppercase tracking-wide">
          {site.contact.socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={
                  s.href.startsWith('http') ? 'noreferrer noopener' : undefined
                }
                className="inline-flex min-h-[44px] items-center px-2"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
