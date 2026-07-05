import type { Project } from '../types';

// Fictional demo content. Replace with real work before launch.
const project: Project = {
  slug: '_example-branding',
  title: 'Manuscript Press — Series Identity',
  year: 2023,
  client: 'Manuscript Press',
  role: 'Art Direction, Identity, Series Design',
  summary:
    'A reissue program for Manuscript Press — twenty-five years of independent fiction reset under a single visual system.',
  description:
    'Manuscript Press had drifted into a different cover style for each editor, each decade. The new system gives every book a numbered spine, a hand-stamped colophon, and a typographic cover where the title is allowed to be the entire design. The first five reissues shipped in autumn 2023; the program continues through 2026.',
  cover: {
    src: '/projects/_example-branding/01.svg',
    alt: 'Five book spines in different colors side by side, each titled and numbered.',
    width: 1600,
    height: 900,
  },
  images: [
    {
      src: '/projects/_example-branding/01.svg',
      alt: 'Series spread — five spines: North Wind, The Quiet Clock, Twelve Fathoms, Black Milk, Wild Estate.',
      width: 1600,
      height: 900,
    },
    {
      src: '/projects/_example-branding/02.svg',
      alt: 'Manuscript Press monogram — “MP” centered on cream with the full wordmark beneath.',
      width: 1600,
      height: 1200,
    },
    {
      src: '/projects/_example-branding/03.svg',
      alt: 'Cover of “North Wind” by Holland Vex — large serif title on cream within a deep blue field.',
      width: 1600,
      height: 1600,
    },
  ],
  featured: true,
};

export default project;
