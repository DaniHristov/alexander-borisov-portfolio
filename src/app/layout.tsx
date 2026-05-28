import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import { Nav } from '@/components/Nav';
import { Cursor } from '@/components/Cursor';
import { site } from '@/content/site';
import './globals.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: site.seo.siteName,
    template: `%s — ${site.seo.siteName}`,
  },
  description: site.seo.description,
  openGraph: {
    title: site.seo.siteName,
    description: site.seo.description,
    type: 'website',
    siteName: site.seo.siteName,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceMono.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Cursor />
        <Nav />
        {/* Padding clears the fixed nav. Hero sections on the home page
            cancel it with a negative margin so the hero is edge-to-edge. */}
        <main id="main" className="pt-[84px] md:pt-[100px]">
          {children}
        </main>
      </body>
    </html>
  );
}
