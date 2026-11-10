import { ImageResponse } from 'next/og';
import { tool } from '@/lib/tool';

// The tab icon (icon.svg) as an opaque PNG, for home screens that cannot use SVG.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4A51C' }}>
        <svg width="124" height="124" viewBox="0 0 256 256" fill="#17140F"><path d={tool.logo.soft} opacity=".3" /><path d={tool.logo.solid} /></svg>
      </div>
    ),
    size,
  );
}
