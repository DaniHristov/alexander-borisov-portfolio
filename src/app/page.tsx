import { HeroScrollFrames } from '@/components/HeroScrollFrames';
import { HeroHandoff } from '@/components/HeroHandoff';
import { MenuGlow } from '@/components/MenuGlow';
import { getSiteContent } from '@/content/live';

const links = [
  { href: '/work', label: 'Work' },
  { href: '/art', label: 'Art' },
  { href: '/connect', label: 'Connect' },
];

function MenuLinks({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <ul
      className={
        horizontal
          ? 'flex flex-row flex-wrap items-center justify-center gap-x-8 gap-y-2 md:gap-x-12'
          : 'flex flex-col items-center gap-2 md:gap-3'
      }
    >
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className={`heading-link inline-block font-bold leading-[1.05] tracking-tight ${
              horizontal
                ? 'text-[clamp(1.25rem,3vw,2rem)]'
                : 'text-[clamp(2.5rem,7vw,5rem)]'
            }`}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function Home() {
  const site = await getSiteContent();
  return (
    <>
      <HeroScrollFrames
        tagline={
          <>
            {/* Single h1 for a11y/SEO — visually hidden; the focal element
                is the menu, which lives both in the hero fade-in AND in the
                persistent section below. */}
            <h1 className="sr-only">{site.designer.name}</h1>
            <nav aria-label="Sections (intro)" className="mx-auto">
              <MenuLinks horizontal />
            </nav>
          </>
        }
      />
      {/* Persistent menu — picks up at exact viewport-center as the fixed
          hero stage fades out. Footer-style colophon (copyright + socials)
          sits at the bottom of the same section. */}
      <section
        aria-label="Sections"
        className="relative flex min-h-screen flex-col overflow-hidden bg-black px-6 pb-8 pt-10 text-center text-white"
      >
        {/* Ambient haze behind the menu — fades in on the intro handoff
            rather than scrolling up from below. */}
        <MenuGlow />
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <HeroHandoff>
            <nav aria-label="Sections" className="mx-auto">
              <MenuLinks horizontal />
            </nav>
          </HeroHandoff>
        </div>
        <div className="relative z-10 flex flex-col items-start justify-between gap-3 text-xs uppercase tracking-wide text-[var(--color-muted)] md:flex-row md:items-center">
          <span>
            © {new Date().getFullYear()} {site.designer.name}
          </span>
          <ul className="flex gap-2">
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
        </div>
      </section>
    </>
  );
}
