import type { MetadataRoute } from 'next';

const BASE = 'https://accounts.codevertexafrica.com';
const PATHS = ['/', '/pricing', '/about', '/privacy', '/terms-of-service', '/cookies', '/refund-policy', '/data-requests', '/status'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({ url: BASE + p, lastModified: new Date(), changeFrequency: p === '/status' ? 'daily' : 'monthly', priority: p === '/' ? 1 : 0.6 }));
}
