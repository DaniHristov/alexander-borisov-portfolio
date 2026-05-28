import { site } from '@/content/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-rule bg-black px-6 py-8 md:px-10">
      <div className="flex flex-col items-start justify-between gap-4 text-xs uppercase tracking-wide text-muted md:flex-row md:items-center">
        <span>
          © {year} {site.designer.name}
        </span>
        <ul className="flex gap-2">
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
    </footer>
  );
}
