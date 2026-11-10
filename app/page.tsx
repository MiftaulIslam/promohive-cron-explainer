import type { Viewport } from 'next';
import { CronStand } from '@/components/CronStand';
import { FAQ, Guide } from '@/components/Guide';
import { Clockwork, Poster, Reference, Who } from '@/components/Sections';
import { ToolBar, ToolFoot, ToolJsonLd } from '@/components/Shell';
import { tool } from '@/lib/tool';
import './page.css';

export const viewport: Viewport = { themeColor: tool.themeColor, colorScheme: 'light' };

export default function Page() {
  return (
    <>
      <ToolBar />
      <main>
        <CronStand />
        <Poster />
        <Clockwork />
        <Reference />
        <Who />
        <Guide />
      </main>
      <ToolFoot className="ph-foot below" />
      <ToolJsonLd faq={FAQ} />
    </>
  );
}
