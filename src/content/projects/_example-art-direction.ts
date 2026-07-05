import type { Project } from '../types';

// Fictional demo content. Replace with real work before launch.
const project: Project = {
  slug: '_example-art-direction',
  title: 'Atlas Records — Annual Report 2024',
  year: 2022,
  client: 'Atlas Records',
  role: 'Art Direction, Editorial Design',
  summary:
    'A 64-page annual report for an independent record label that lost money and wanted to talk honestly about why.',
  description:
    'Most annual reports want to look profitable. Atlas wanted theirs to look like a year of building. We treated it like a magazine — section openers in full-bleed color, financials set as plainly as we could make them, and an essay at the end about which records didn’t work, in the label’s own words. Printed on uncoated stock with a deep red flood on the cover.',
  cover: {
    src: '/projects/_example-art-direction/01.svg',
    alt: 'Cover of the Atlas Records 2024 annual report — gradient from deep blue to red with section header copy.',
    width: 1600,
    height: 900,
  },
  images: [
    {
      src: '/projects/_example-art-direction/01.svg',
      alt: 'Cover — “Eighteen records, two cities, one bad year.”',
      width: 1600,
      height: 900,
    },
    {
      src: '/projects/_example-art-direction/02.svg',
      alt: 'Section opener with a financial summary — revenue, costs, net loss — on a half-red half-navy spread.',
      width: 1600,
      height: 2133,
    },
    {
      src: '/projects/_example-art-direction/03.svg',
      alt: 'Closing essay opener — a large italic pull quote on a deep red field, attributed to K. Atlas, founder.',
      width: 1600,
      height: 2000,
    },
  ],
};

export default project;
