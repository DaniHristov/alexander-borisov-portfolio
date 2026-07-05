import type { Project } from '../types';

// Fictional demo content. Replace with real work before launch.
const project: Project = {
  slug: '_example-editorial',
  title: 'Ferrous Quarterly, Nº 12',
  year: 2024,
  client: 'Ferrous Quarterly',
  role: 'Art Direction, Design',
  summary:
    'The Spring ’24 issue of Ferrous Quarterly — a 132-page magazine about architecture, weather, and the materials in between.',
  description:
    'The twelfth issue marked the magazine’s third anniversary. We redrew the masthead, retired the original grotesk in favor of a slightly warmer serif, and introduced a recurring photographic essay format — three plates per piece, captioned only by location and year. Printed in Hamburg on Holmen Book Cream 80gsm; cover stock Munken Pure 240gsm.',
  cover: {
    src: '/projects/_example-editorial/01.svg',
    alt: 'Cover of Ferrous Quarterly Issue 12 — large serif title “After Concrete” on a warm cream stock.',
    width: 1600,
    height: 2133,
  },
  images: [
    {
      src: '/projects/_example-editorial/01.svg',
      alt: 'Issue 12 cover with the cover line “After Concrete”.',
      width: 1600,
      height: 2133,
    },
    {
      src: '/projects/_example-editorial/02.svg',
      alt: 'A two-column editorial spread: dense body copy on either side, a deep ochre photo well centered.',
      width: 1600,
      height: 1000,
    },
    {
      src: '/projects/_example-editorial/03.svg',
      alt: 'Pull-quote page set in a large italic serif — “The patina is the building’s second drawing.”',
      width: 1600,
      height: 2133,
    },
  ],
  featured: true,
};

export default project;
