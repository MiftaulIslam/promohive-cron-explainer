import { ogImage, oneLine } from '@/lib/og';
import { company } from '@/lib/site';
import { tool } from '@/lib/tool';

// The same card as opengraph-image.tsx, declared again so X gets twitter:image tags too.
export const alt = `${tool.name}, a free browser tool from ${company.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ kicker: `Free ${tool.category.toLowerCase()} tool`, title: tool.name, text: oneLine(tool.summary) });
}
