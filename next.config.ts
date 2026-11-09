import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Any page that stops being fully static fails the build (see ensureStatic in app/layout.tsx).
  cacheComponents: true,
  partialPrefetching: false, // one page, so there is nothing to prefetch
  poweredByHeader: false,
  // One small page: inlining its CSS saves the render-blocking stylesheet requests.
  experimental: { inlineCss: true },
  images: { formats: ['image/avif', 'image/webp'] },
};

export default nextConfig;
