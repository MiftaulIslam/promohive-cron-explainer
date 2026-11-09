import { company, links, otherTools, siteUrl } from '@/lib/site';
import { tool } from '@/lib/tool';

export function ToolBar({ className = 'wrap ph-bar' }: { className?: string }) {
  return (
    <header className={className}>
      <a className="ph-brand" href={links.home} aria-label={`${company.name} home`}>
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8.6 3h14.8l7.4 13-7.4 13H8.6L1.2 16z" fill="#f2a516" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /><path d={tool.glyph} transform="translate(7 7) scale(.75)" fill="none" stroke="#141311" strokeWidth="2.4" strokeLinecap="square" /></svg>
        {company.name}
      </a>
      <nav className="ph-nav" aria-label="Main">
        <a className="ph-hide-s" href={links.tools}>All tools</a>
        <a className="ph-btn" href={links.start}>Start a brief</a>
      </nav>
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
            <p>{company.name} designs, builds and runs software for companies in Bangladesh and abroad, and publishes the tools it works with.</p>
            <a className="ph-btn" href={links.start}>Start a brief</a>
          </div>
          <ul className="ph-foot__tools">
            {otherTools.map((t) => (
              <li key={t.slug}><a href={t.href}>{t.name} <span>{t.category}</span></a></li>
            ))}
          </ul>
        </div>
        <div className="ph-foot__base">
          <span>© 2026 {company.name}. Dhaka, Bangladesh</span>
          <span>Runs in your browser. Nothing you enter is sent anywhere.</span>
        </div>
      </div>
    </footer>
  );
}

/** Structured data for the page. `<` is escaped so content can never close the script tag. */
export function ToolJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.summary,
    url: siteUrl,
    applicationCategory: ({ Marketing: 'BusinessApplication', Design: 'DesignApplication', Engineering: 'DeveloperApplication' })[tool.category],
    operatingSystem: 'Any (runs in a web browser)',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: company.name, url: company.url, email: company.email },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
