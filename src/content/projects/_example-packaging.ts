import type { Project } from '../types';

// Fictional demo content. Replace with real work before launch.
const project: Project = {
  slug: '_example-packaging',
  title: 'Vela & Linden — Solstice 2023',
  year: 2022,
  client: 'Vela & Linden Wines',
  role: 'Identity, Label Design',
  summary:
    'A wordmark, label, and case-end identity for a small Sonoma Coast winery’s flagship pinot noir.',
  description:
    'Vela & Linden makes about 1,400 cases a year. They wanted a label that would look at home in a wine-shop window and a stack of restaurant cases without ever feeling like it was trying too hard. The result is a quiet, mostly-cream label, a single italic wordmark, and a small set of tasting notes printed on the back as if torn from a notebook.',
  cover: {
    src: '/projects/_example-packaging/01.svg',
    alt: 'Wine label — “Solstice — Pinot Noir 2023” centered on cream, set inside a deep oxblood field.',
    width: 1600,
    height: 2133,
  },
  images: [
    {
      src: '/projects/_example-packaging/01.svg',
      alt: 'Front label of Solstice 2023 Pinot Noir.',
      width: 1600,
      height: 2133,
    },
    {
      src: '/projects/_example-packaging/02.svg',
      alt: 'Wordmark — “Vela & Linden” in a single italic line on cream.',
      width: 1600,
      height: 1600,
    },
    {
      src: '/projects/_example-packaging/03.svg',
      alt: 'Back label — tasting notes: cherry, cedar, violet, forest floor, cocoa.',
      width: 1600,
      height: 2000,
    },
  ],
};

export default project;
