# Cron Schedule Explainer

A free browser tool from PromoHive Venture. One static page; nothing the visitor enters leaves the browser.

```bash
npm install
npm run dev
npm run build
npm test
```

Set these on the host:

| Variable | Meaning |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | This deployment's public URL, for canonical links, the sitemap and share images |
| `NEXT_PUBLIC_INDEXABLE` | `true` to allow search engines. Anything else keeps the page `noindex` |

Links to the company site and the other tools are in `lib/site.ts`.
