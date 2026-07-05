import Image from 'next/image';
import { HeroScrollFrames } from '@/components/HeroScrollFrames';
import { Collage } from '@/components/Collage';
import { Reveal } from '@/components/Reveal';
import { getAllProjects, getSiteContent } from '@/content/live';

export default async function Home() {
  // One unified collage — work and art are no longer separate galleries.
  const [projects, site] = await Promise.all([getAllProjects(), getSiteContent()]);

  return (
    <>
      {/* Single h1 for a11y/SEO — visually hidden. The hero ends on the
          fade-to-black and hands off straight to the collage below; the top
          nav (Work / About / Connect anchors) is the only menu. */}
      <HeroScrollFrames tagline={<h1 className="sr-only">{site.designer.name}</h1>} />

      {/* Work — the free-canvas collage starts right after the hero's scroll
          distance; the fixed hero stage fades out on top of it (stage sits at
          z-10, above this in-flow content). */}
      {/* The top margin pushes the section's start (the anchor target) a bit
          PAST the hero's scroll length, so clicking "Work" lands after the
          fixed hero stage has faded out (no black flash / no extra scroll).
          scroll-mt then offsets the landing so the first row clears the fixed
          nav. The gap is body-black, so it reads as a seamless transition. */}
      <section id="work" className="mt-[160px] scroll-mt-[110px] pb-24">
        <h2 className="sr-only">Work</h2>
        <Collage projects={projects} />
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-[110px] px-6 pb-24 pt-8 md:px-10">
        <div className="mx-auto w-full max-w-[760px]">
          <Reveal as="h2" className="text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
            About
          </Reveal>

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

          <Reveal className="mt-10 space-y-5 text-base leading-relaxed" delay={120}>
            {site.about.bio.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Connect */}
      <section id="connect" className="scroll-mt-[110px] px-6 pb-24 pt-8 md:px-10">
        <div className="mx-auto w-full max-w-[760px]">
          <Reveal as="h2" className="text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
            Connect
          </Reveal>

          <Reveal className="mt-10 space-y-6 text-base leading-relaxed" delay={120}>
            <p>
              For new projects, collaborations— I read every message and reply to
              most within a few days.
            </p>
            <p>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex min-h-[44px] items-center text-lg font-medium underline underline-offset-4"
              >
                {site.contact.email}
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Colophon */}
      <footer className="flex flex-col items-start justify-between gap-3 px-6 pb-10 pt-4 text-xs uppercase tracking-wide text-muted md:flex-row md:items-center md:px-10">
        <span>
          © {new Date().getFullYear()} {site.designer.name}
        </span>
        <ul className="flex flex-wrap gap-2">
          {site.contact.socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                className="inline-flex min-h-[44px] items-center px-2"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </>
  );
}
