import { ogImage, oneLine } from '@/lib/og';
import { company } from '@/lib/site';
import { tool } from '@/lib/tool';

export const alt = `${tool.name}, a free browser tool from ${company.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return ogImage({ kicker: `Free ${tool.category.toLowerCase()} tool`, title: tool.name, text: oneLine(tool.summary) });
}
