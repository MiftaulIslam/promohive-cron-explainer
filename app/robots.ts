import type { MetadataRoute } from 'next';
import { indexable, siteUrl } from '@/lib/site';

// AI search and assistant crawlers, named so the page stays citable even if a host adds a stricter rule for `*`.
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'meta-externalagent', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: [{ userAgent: '*', allow: '/' }, { userAgent: AI_CRAWLERS, allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
