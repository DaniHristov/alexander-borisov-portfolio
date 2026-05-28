import { site } from '@/content/site';

export function Hero() {
  return (
    <header className="px-6 pb-16 pt-8 md:px-10 md:pb-24 md:pt-12">
      <h1 className="max-w-5xl text-balance text-[clamp(3rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight">
        {site.designer.tagline}
      </h1>
    </header>
  );
}
