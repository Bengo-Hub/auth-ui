/**
 * Public tenant API (no auth required).
 * Used for tenant auto-discovery and branding (name, slug, metadata.primary_color, logo_url, etc.).
 */

const AUTH_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexitsolutions.com';

export interface PublicTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export async function getTenantBySlug(slug: string): Promise<PublicTenant | null> {
  try {
    const res = await fetch(`${AUTH_API_BASE}/api/v1/tenants/by-slug/${encodeURIComponent(slug)}`, {
      credentials: 'omit',
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicTenant;
  } catch {
    return null;
  }
}

/** Brand-related keys in tenant metadata (align with notifications branding). */
export function getBrandFromMetadata(metadata?: Record<string, unknown>) {
  const m = metadata || {};
  return {
    logoUrl: (m.logo_url as string) || (m.logo as string) || '',
    primaryColor: (m.primary_color as string) || '#0ea5e9',
    secondaryColor: (m.secondary_color as string) || '#6366f1',
  };
}
