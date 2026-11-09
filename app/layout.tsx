import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { ToolJsonLd } from '@/components/Shell';
import { company, indexable, siteUrl } from '@/lib/site';
import { tool } from '@/lib/tool';
import './kit.css';

// The whole site is one prerendered page; the build fails if a change would make it render per request.
export const ensureStatic = 'navigation';

// Latin subsets only; Bangla falls back to the system font.
// adjustFontFallback is off because kit.css has a stand-in measured against this font's headline weight.
const display = localFont({ src: './fonts/bricolage-normal-latin.woff2', weight: '500 800', adjustFontFallback: false, variable: '--font-display', fallback: ['PH Display Fallback', 'Arial Narrow', 'system-ui', 'sans-serif'] });
const body = localFont({ src: './fonts/schibsted-normal-latin.woff2', weight: '400 700', variable: '--font-body', fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] });

const title = `${tool.name}: Free Online Tool | ${company.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: tool.summary,
  applicationName: tool.name,
  authors: [{ name: company.name, url: company.url }],
  creator: company.name,
  publisher: company.name,
  alternates: { canonical: '/' },
  formatDetection: { telephone: false, email: false, address: false },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: 'website', url: '/', title, description: tool.summary, siteName: company.name, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description: tool.summary },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body id="top">
        {children}
        <ToolJsonLd />
      </body>
    </html>
  );
}
