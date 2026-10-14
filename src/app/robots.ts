import type { MetadataRoute } from 'next';

const BASE = 'https://accounts.codevertexafrica.com';

/** Public pages are crawlable; signed-in areas and the API are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/', '/auth/', '/select-organisation'] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
