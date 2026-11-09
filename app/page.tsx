import type { Viewport } from 'next';
import { CronStand } from '@/components/CronStand';
import { Clockwork, Poster, Reference, Who } from '@/components/Sections';
import { ToolBar, ToolFoot } from '@/components/Shell';
import './page.css';

export const viewport: Viewport = { themeColor: '#f3f1ec', colorScheme: 'light' };

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
      </main>
      <ToolFoot className="ph-foot below" />
    </>
  );
}
