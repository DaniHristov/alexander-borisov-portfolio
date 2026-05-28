import type { Project } from '../types';

// Fictional demo content. Replace with real work before launch.
const project: Project = {
  slug: '_example-poster',
  title: 'Nine Volt — Autumn Tour',
  year: 2024,
  categories: ['poster', 'art-direction'],
  client: 'Nine Volt (record label)',
  role: 'Art Direction, Poster Design',
  summary:
    'A campaign of twelve concert posters for Nine Volt’s autumn tour across Europe — one per city, all built on a shared typographic system.',
  description:
    'The brief was to give the tour a single voice without making every poster identical. The campaign settled on a strict typographic grid, three city-specific palettes, and a recurring numeric anchor — the tour year, set as loudly as the band name. Posters were screen-printed in editions of 250 and sold from the merch table.',
  cover: {
    src: '/projects/_example-poster/01.svg',
    alt: 'Nine Volt tour poster — large condensed typography on a deep teal field.',
    width: 1600,
    height: 2133,
  },
  images: [
    {
      src: '/projects/_example-poster/01.svg',
      alt: 'Nine Volt tour poster — “NINE VOLT” in stacked condensed type on teal.',
      width: 1600,
      height: 2133,
    },
    {
      src: '/projects/_example-poster/02.svg',
      alt: 'Nine Volt tour poster — oversized numeral “24” centered on a vermillion field.',
      width: 1600,
      height: 2133,
    },
    {
      src: '/projects/_example-poster/03.svg',
      alt: 'Set-list poster — three color-blocked panels with track listing in black.',
      width: 1600,
      height: 2133,
    },
  ],
  featured: true,
};

export default project;
