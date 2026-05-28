import type { Metadata } from 'next';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-[760px] px-6 pb-20 pt-4 md:px-10">
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
        Contact
      </h1>
      <div className="mt-10 space-y-6 text-base">
        <p>
          For project enquiries, press, or anything else, reach out by email.
        </p>
        <p>
          <a
            href={`mailto:${site.contact.email}`}
            className="inline-flex min-h-[44px] items-center text-lg font-medium underline underline-offset-4"
          >
            {site.contact.email}
          </a>
        </p>
        <ul className="flex flex-wrap gap-x-2 gap-y-1 pt-2 text-xs uppercase tracking-wide">
          {site.contact.socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center px-2"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
