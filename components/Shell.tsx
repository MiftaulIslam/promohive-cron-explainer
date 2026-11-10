import Image from 'next/image';
import logo from '@/assets/promohive-logo.svg';
import { company, links, otherTools, siteUrl } from '@/lib/site';
import { tool } from '@/lib/tool';

const NAV = [
  { label: 'Tools', href: links.tools, current: true },
  { label: 'Services', href: links.services },
  { label: 'Work', href: links.work },
  { label: 'Labs', href: links.labs },
  { label: 'Team', href: links.team },
];

function ToolMark() {
  return (
    <span className="ph-mark">
      <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d={tool.logo.soft} opacity=".3" /><path d={tool.logo.solid} /></svg>
    </span>
  );
}

/** The main site's floating bar, on one dark surface so it reads over every tool's own colors. */
export function ToolBar({ className = 'wrap ph-bar' }: { className?: string }) {
  const items = NAV.map((n) => <a key={n.label} href={n.href} aria-current={n.current ? 'true' : undefined}>{n.label}</a>);
  return (
    <header className={className}>
      <div className="ph-pill">
        <a className="ph-brand" href={links.home} aria-label={`${company.name} home`}><Image src={logo} alt="" loading="eager" /></a>
        <span className="ph-tool"><ToolMark /><span className="ph-tool__name">{tool.name}</span></span>
        <nav className="ph-links" aria-label="Main">{items}</nav>
        <a className="ph-cta" href={links.start}>Start a brief<i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><path d="M4 12h15M13 6l6 6-6 6" /></svg></i></a>
        <details className="ph-menu">
          <summary aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h11" /></svg></summary>
          <nav aria-label="Mobile">{items}<a href={links.start}>Start a brief</a></nav>
        </details>
      </div>
    </header>
  );
}

export function ToolFoot({ className = 'ph-foot' }: { className?: string }) {
  return (
    <footer className={className}>
      <div className="wrap">
        <div className="ph-foot__top">
          <div>
            <h2>A free tool from a team that builds software</h2>
            <p><a href={links.home}>{company.name}</a> designs, builds and runs software for companies in Bangladesh and abroad, and publishes the tools it works with. See its <a href={links.services}>software and marketing services</a> or the <a href={links.tools}>full list of free tools</a>.</p>
            <a className="ph-btn" href={links.start}>Start a brief</a>
          </div>
          <ul className="ph-foot__tools">
            {otherTools.map((t) => (
              <li key={t.slug}><a href={t.href}>{t.name} <span>{t.category}</span></a></li>
            ))}
          </ul>
        </div>
        <div className="ph-foot__base">
          <span>© 2026 <a href={links.home}>{company.name}</a>. Dhaka, Bangladesh</span>
          <span>Runs in your browser. Nothing you enter is sent anywhere.</span>
        </div>
      </div>
    </footer>
  );
}

export interface Faq { q: string; a: string }

/**
 * Structured data for the page, as one graph: the company, this site, the page, the tool, its breadcrumb and the FAQ
 * the page shows. `<` is escaped so content can never close the script tag.
 */
export function ToolJsonLd({ faq }: { faq: readonly Faq[] }) {
  const url = siteUrl;
  const image = `${siteUrl}/opengraph-image`;
  const org = { '@id': company.id };
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': company.id, name: company.name, url: company.url, email: company.email },
      { '@type': 'WebSite', '@id': `${url}/#website`, url, name: tool.name, inLanguage: 'en', publisher: org },
      {
        '@type': 'WebPage', '@id': `${url}/#webpage`, url, name: tool.title, description: tool.description, inLanguage: 'en',
        isPartOf: { '@id': `${url}/#website` }, mainEntity: { '@id': `${url}/#app` }, breadcrumb: { '@id': `${url}/#breadcrumb` },
        primaryImageOfPage: { '@type': 'ImageObject', url: image, width: 1200, height: 630 }, dateModified: tool.updated, publisher: org,
      },
      {
        '@type': 'WebApplication', '@id': `${url}/#app`, name: tool.name, url, description: tool.summary, image,
        applicationCategory: ({ Marketing: 'BusinessApplication', Design: 'DesignApplication', Engineering: 'DeveloperApplication' })[tool.category],
        operatingSystem: 'Any', browserRequirements: 'Requires JavaScript and a current web browser',
        isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: tool.featureList, inLanguage: 'en', dateModified: tool.updated, publisher: org, provider: org,
      },
      {
        '@type': 'BreadcrumbList', '@id': `${url}/#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'PromoHive', item: company.url },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: links.tools },
          { '@type': 'ListItem', position: 3, name: tool.name, item: url },
        ],
      },
      {
        '@type': 'FAQPage', '@id': `${url}/#faq`, url, isPartOf: { '@id': `${url}/#webpage` },
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
