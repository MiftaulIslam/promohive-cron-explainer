import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { company } from './site';
import { tool } from './tool';

// Share card, drawn at build time. Static TTF fonts, because the image renderer cannot read woff2 or variable fonts.
const font = (file: string) => readFile(join(process.cwd(), 'assets/og-fonts', file));
const [display, body, serif] = await Promise.all([font('bricolage-800.ttf'), font('schibsted-500.ttf'), font('fraunces-italic-500.ttf')]);

const C = { bg: '#12110f', line: '#2e2b25', ink: '#f4f1ea', soft: '#b6b0a4', honey: '#f5b13a', ember: '#f0713f' };
const HEX = 'M8.6 3h14.8l7.4 13-7.4 13H8.6L1.2 16z';

export function ogImage({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  const titleSize = title.length > 62 ? 58 : title.length > 40 ? 70 : 84;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: C.bg, color: C.ink, fontFamily: 'Schibsted', position: 'relative' }}>
        <svg width="560" height="560" viewBox="0 0 32 32" style={{ position: 'absolute', right: -150, top: 60, opacity: 0.9 }}>
          <path d={HEX} fill="none" stroke={C.line} strokeWidth="0.5" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="54" height="54" viewBox="0 0 32 32"><path d={HEX} fill={C.honey} stroke={C.ink} strokeWidth="2.2" strokeLinejoin="round" /><path d={tool.glyph} transform="translate(7 7) scale(.75)" fill="none" stroke="#141311" strokeWidth="2.4" strokeLinecap="square" /></svg>
          <span style={{ fontFamily: 'Bricolage', fontSize: 40, letterSpacing: -1.6 }}>{company.name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 920 }}>
          <span style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 38, color: C.honey }}>{kicker}</span>
          <span style={{ fontFamily: 'Bricolage', fontSize: titleSize, lineHeight: 1.02, letterSpacing: -titleSize * 0.035 }}>{title}</span>
          <span style={{ fontSize: 28, lineHeight: 1.35, color: C.soft, maxWidth: 860 }}>{text}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, color: C.soft }}>
          <span>{new URL(company.url).host}</span>
          <span>Runs in your browser</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Bricolage', data: display, weight: 800, style: 'normal' },
        { name: 'Schibsted', data: body, weight: 500, style: 'normal' },
        { name: 'Fraunces', data: serif, weight: 500, style: 'italic' },
      ],
    },
  );
}

/** Trims a description to one share-card line without cutting a word. */
export function oneLine(s: string, max = 120) {
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(' ', max);
  return `${s.slice(0, cut > 0 ? cut : max)}…`;
}
