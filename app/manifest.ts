import type { MetadataRoute } from 'next';
import { tool } from '@/lib/tool';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: tool.name,
    short_name: tool.name,
    description: tool.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: tool.themeColor,
    theme_color: tool.themeColor,
    categories: [tool.category.toLowerCase(), 'utilities'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
