import type { Metadata } from 'next';
import Image from 'next/image';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-[760px] px-6 pb-20 pt-4 md:px-10">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
        About
      </h1>

      {site.about.portrait ? (
        <div className="my-10">
          <Image
            src={site.about.portrait.src}
            alt={site.about.portrait.alt}
            width={site.about.portrait.width}
            height={site.about.portrait.height}
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <div className="mt-10 space-y-5 text-base leading-relaxed">
        {site.about.bio.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {site.about.selectedClients && site.about.selectedClients.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-xs uppercase tracking-wide text-muted">
            Selected clients
          </h2>
          <ul className="mt-4 columns-2 gap-x-8 text-sm md:columns-3">
            {site.about.selectedClients.map((c) => (
              <li key={c} className="break-inside-avoid py-1">
                {c}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {site.about.press && site.about.press.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-xs uppercase tracking-wide text-muted">
            Press
          </h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule text-sm">
            {site.about.press.map((p, i) => (
              <li key={i} className="grid grid-cols-[1fr_auto] gap-4 py-3">
                <span>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noreferrer noopener">
                      {p.title}
                    </a>
                  ) : (
                    p.title
                  )}
                  <span className="text-muted"> — {p.outlet}</span>
                </span>
                <span className="tabular-nums text-muted">{p.year}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
