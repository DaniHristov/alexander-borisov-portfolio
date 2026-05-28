import type { SiteContent } from './types';

// Demo-seed content. Designer name "Alexander Borisov" is real (per the
// project brief); all bio details, clients, projects, press, and contact
// handles below are fictional placeholders used to preview the layout.
// Replace bio/clients/press/contact with real content before launch.

export const site: SiteContent = {
  designer: {
    name: 'Alexander Borisov',
    tagline:
      'Independent graphic designer. Identity systems, editorial, and art direction for cultural institutions, independent labels, and small brands.',
  },
  about: {
    bio: [
      'Alexander Borisov is an independent graphic designer working between Sofia and the California coast. His practice spans identity systems, editorial design, and art direction — typically in close collaboration with founders and editors who care more about the long view than the launch.',
      'Before going independent in 2019 he spent six years at studios in Amsterdam and New York. He teaches type and editorial design as a visiting critic at the Werkplaats and is a founding editor of Ferrous Quarterly.',
    ],
    selectedClients: [
      'Atlas Records',
      'Ferrous Quarterly',
      'Helios Coffee',
      'Manuscript Press',
      'Nine Volt',
      'Vela & Linden',
      'Hand & Crane',
      'Werkplaats Typografie',
      'The Coastal Review',
    ],
    press: [
      {
        title: 'On Patience as a Design Strategy',
        outlet: 'Eye Magazine',
        year: 2024,
      },
      {
        title: 'Ten Independent Studios to Watch',
        outlet: 'It’s Nice That',
        year: 2023,
      },
      {
        title: 'Building Slowly: A Conversation with Alexander Borisov',
        outlet: 'Form & Type',
        year: 2022,
      },
    ],
  },
  contact: {
    email: 'hello@alexanderborisov.studio',
    socials: [
      { label: 'Instagram', href: 'https://instagram.com/alexanderborisov.studio' },
      { label: 'Are.na', href: 'https://are.na/alexander-borisov' },
      { label: 'Email', href: 'mailto:hello@alexanderborisov.studio' },
    ],
  },
  seo: {
    siteName: 'Alexander Borisov',
    description:
      'Portfolio of Alexander Borisov — independent graphic designer working in identity, editorial, and art direction.',
  },
};
