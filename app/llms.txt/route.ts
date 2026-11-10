import { FAQ } from '@/components/Guide';
import { company, links, siteUrl } from '@/lib/site';
import { tool } from '@/lib/tool';

// A plain Markdown copy of the page for language models and agents (llmstxt.org). It reads nothing per request, so it is prerendered.
export function GET() {
  const body = [
    `# ${tool.name}`,
    `> ${tool.description}`,
    `${tool.summary} It is free, needs no sign-up and runs entirely in the browser, so nothing you type or upload is sent to a server. Made by ${company.name}, a software and marketing studio in Dhaka, Bangladesh.`,
    `## Features\n\n${tool.featureList.map((f) => `- ${f}`).join('\n')}`,
    `## Questions\n\n${FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}`,
    [
      '## Links',
      '',
      `- [${tool.name}](${siteUrl}): the tool itself`,
      `- [${company.name}](${company.url}): the company that builds and runs it`,
      `- [Free tools](${links.tools}): every free tool from ${company.name}`,
      `- [Services](${links.services}): software, design and marketing work ${company.name} takes on`,
    ].join('\n'),
  ].join('\n\n');
  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
