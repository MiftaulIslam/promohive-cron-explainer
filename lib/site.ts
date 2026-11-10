import { tool } from './tool';

/** Search engines stay out until NEXT_PUBLIC_INDEXABLE is 'true', so a preview deployment is never indexed. */
export const indexable = process.env.NEXT_PUBLIC_INDEXABLE === 'true';

export const company = { name: 'PromoHive Venture', url: 'https://promohive.org', email: 'hello@promohive.org', id: 'https://promohive.org/#organization' };
export const links = { home: company.url, tools: `${company.url}/tools`, start: `${company.url}/start`, services: `${company.url}/services`, work: `${company.url}/work`, labs: `${company.url}/labs`, team: `${company.url}/team` };

/** A service page on the company site. */
export const service = (slug: 'web-development' | 'mobile-app-development' | 'desktop-app-development' | 'api-backend' | 'saas-development' | 'cloud-devops' | 'database-infrastructure' | 'product-design' | 'ai-automation' | 'seo' | 'search-ads' | 'social-media-marketing') => `${links.services}/${slug}`;

const allTools = [
  { slug: 'uptime-calculator', name: 'Uptime Budget Calculator', category: 'Engineering', host: 'uptime' },
  { slug: 'cron-explainer', name: 'Cron Schedule Explainer', category: 'Engineering', host: 'cron' },
  { slug: 'palette-extractor', name: 'Brand Palette Extractor', category: 'Design', host: 'palette' },
  { slug: 'utm-builder', name: 'UTM Link Builder', category: 'Marketing', host: 'utm' },
  { slug: 'ad-copy-checker', name: 'Ad Copy Length Checker', category: 'Marketing', host: 'adcopy' },
];

const hrefOf = (host: string) => `https://${host}.promohive.org`;

/** This deployment's public URL, without a trailing slash. NEXT_PUBLIC_SITE_URL overrides the production address. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? hrefOf(allTools.find((t) => t.slug === tool.slug)!.host)).replace(/\/+$/, '');

/** The other tools, for the footer. Each one is its own deployment on a subdomain of the company domain. */
export const otherTools = allTools.filter((t) => t.slug !== tool.slug).map((t) => ({ ...t, href: hrefOf(t.host) }));
