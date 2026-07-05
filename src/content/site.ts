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
      'A multidisciplinary visual designer and curator bringing ideas to life through bold visuals. Working across motion design, 3D, and generative art, I’m always exploring new creative directions. Passionate about branding, experimental design, and post-human studies',
    ],
  },
  contact: {
    email: 'alexanderborisow.work@gmail.com',
    socials: [
      { label: 'Instagram', href: 'https://www.instagram.com/unachible/' },
    ],
    currently: [],
  },
  seo: {
    siteName: 'Alexander Borisov',
    description:
      'Portfolio of Alexander Borisov — independent graphic designer working in identity, editorial, and art direction.',
  },
};
