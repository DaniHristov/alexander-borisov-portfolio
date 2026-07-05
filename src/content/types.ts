export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface Project {
  slug: string;
  title: string;
  year: number;
  client?: string;
  role?: string;
  summary: string;
  description?: string;
  cover: ProjectImage;
  images: ProjectImage[];
  featured?: boolean;
  order?: number;
}

export interface PressItem {
  title: string;
  outlet: string;
  url?: string;
  year: number;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface CurrentlyRow {
  label: string;
  value: string;
}

export interface SiteContent {
  designer: {
    name: string;
    tagline: string;
  };
  about: {
    bio: string[];
    selectedClients?: string[];
    press?: PressItem[];
    portrait?: ProjectImage;
  };
  contact: {
    email: string;
    socials: SocialLink[];
    currently: CurrentlyRow[];
  };
  seo: {
    siteName: string;
    description: string;
    ogImage?: string;
  };
}
