import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { SmoothScroll } from '@/components/SmoothScroll';
import { company, indexable, siteUrl } from '@/lib/site';
import { tool } from '@/lib/tool';
import './kit.css';

// The whole site is one prerendered page; the build fails if a change would make it render per request.
export const ensureStatic = 'navigation';

// Latin subsets only; Bangla falls back to the system font.
// adjustFontFallback is off because kit.css has a stand-in measured against this font's headline weight.
const display = localFont({ src: './fonts/bricolage-normal-latin.woff2', weight: '500 800', adjustFontFallback: false, variable: '--font-display', fallback: ['PH Display Fallback', 'Arial Narrow', 'system-ui', 'sans-serif'] });
const body = localFont({ src: './fonts/schibsted-normal-latin.woff2', weight: '400 700', variable: '--font-body', fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] });

// The share image comes from opengraph-image.tsx and twitter-image.tsx, the icons from icon.svg and apple-icon.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: tool.title,
  description: tool.description,
  applicationName: tool.name,
  category: tool.category,
  authors: [{ name: company.name, url: company.url }],
  creator: company.name,
  publisher: company.name,
  alternates: { canonical: '/', types: { 'text/plain': '/llms.txt' } },
  formatDetection: { telephone: false, email: false, address: false },
  robots: indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
    : { index: false, follow: false },
  openGraph: { type: 'website', url: '/', title: tool.title, description: tool.description, siteName: company.name, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title: tool.title, description: tool.description },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body id="top">
        {children}
        <SmoothScroll />
      </body>
    </html>
  );
}
