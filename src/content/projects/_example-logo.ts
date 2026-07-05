import type { Project } from '../types';

// Fictional demo content. Replace with real work before launch.
const project: Project = {
  slug: '_example-logo',
  title: 'Helios Coffee Identity',
  year: 2023,
  client: 'Helios Coffee Roasters',
  role: 'Identity, Logotype, Brand System',
  summary:
    'A wordmark and brand system for a single-origin coffee roaster opening its first café in Lisbon.',
  description:
    'Helios wanted a mark that could live happily on a kraft bag, a porcelain mug, and an Instagram avatar without losing its weight. The solution was a single bold wordmark paired with a small set of solar-themed icons and a four-color palette pulled from roast levels — Oat, Sunset, Ember, Obsidian.',
  cover: {
    src: '/projects/_example-logo/01.svg',
    alt: 'Helios Coffee logo mark — a cream sun disc on a warm coral square.',
    width: 1600,
    height: 1600,
  },
  images: [
    {
      src: '/projects/_example-logo/01.svg',
      alt: 'Primary mark — “HELIOS” wordmark inside a sun disc on coral.',
      width: 1600,
      height: 1600,
    },
    {
      src: '/projects/_example-logo/02.svg',
      alt: 'Wordmark lockup with the tagline “Slow · Roast · Solar” on a cream background.',
      width: 1600,
      height: 900,
    },
    {
      src: '/projects/_example-logo/03.svg',
      alt: 'Brand palette — four color swatches labeled Sunset, Ember, Obsidian, Oat.',
      width: 1600,
      height: 1200,
    },
  ],
  featured: true,
};

export default project;
