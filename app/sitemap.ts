import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
import { tool } from '@/lib/tool';

export default function sitemap(): MetadataRoute.Sitemap {
  // A fixed date: the day the page's content last changed, not the day it was built.
  return [{ url: siteUrl, lastModified: tool.updated, changeFrequency: 'monthly', priority: 1 }];
}
