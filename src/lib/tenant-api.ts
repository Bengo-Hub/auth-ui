/**
 * Public tenant API (no auth required).
 * Used for tenant auto-discovery and branding (name, slug, metadata.primary_color, logo_url, etc.).
 */

const AUTH_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexafrica.com';

export interface TenantBrandMetadata {
  logo_url?: string;
  logoUrl?: string;
  primary_color?: string;
  primaryColor?: string;
  secondary_color?: string;
  secondaryColor?: string;
  org_name?: string;
  orgName?: string;
}

export interface PublicTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  /** IANA timezone for day/shift/report boundaries (default Africa/Nairobi). */
  timezone?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}

export interface TenantBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  orgName: string;
}

export function parseBrandFromTenant(t: PublicTenant): TenantBrand {
  const meta = (t.metadata || {}) as TenantBrandMetadata;
  const logoUrl = meta.logo_url ?? meta.logoUrl ?? null;
  const primaryColor = (meta.primary_color ?? meta.primaryColor) ?? null;
  const secondaryColor = (meta.secondary_color ?? meta.secondaryColor) ?? null;
  const orgName = (meta.org_name ?? meta.orgName) ?? t.name ?? '';

  return {
    id: t.id,
    name: t.name ?? '',
    slug: t.slug ?? '',
    logoUrl: typeof logoUrl === 'string' ? logoUrl : null,
    primaryColor: typeof primaryColor === 'string' ? primaryColor : null,
    secondaryColor: typeof secondaryColor === 'string' ? secondaryColor : null,
    orgName: typeof orgName === 'string' ? orgName : (t.name ?? ''),
  };
}

export async function getTenantBySlug(slug: string): Promise<TenantBrand | null> {
  if (!slug) return null;
  try {
    const res = await fetch(`${AUTH_API_BASE}/api/v1/tenants/by-slug/${encodeURIComponent(slug)}`, {
      credentials: 'omit',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PublicTenant;
    return parseBrandFromTenant(data);
  } catch {
    return null;
  }
}

/**
 * Per-service app name and icon a tenant can set (tenant metadata
 * `service_branding`, validated by auth-api). Frontends fall back to the
 * platform default when a service has no entry.
 */
export interface ServiceBrandingEntry {
  name?: string;
  short_name?: string;
  tagline?: string;
  theme_color?: string;
  icon_url?: string;
}

export interface BrandableService {
  key: string;
  label: string;
  defaultName: string;
  description: string;
  clientId: string;
}

export const BRANDABLE_SERVICES: BrandableService[] = [
  {
    key: 'ordering',
    label: 'Online ordering app',
    defaultName: 'Codevertex Ordering',
    description: 'The storefront your customers order from and install on their phones.',
    clientId: 'ordering-ui',
  },
  {
    key: 'rider',
    label: 'Rider app',
    defaultName: 'Codevertex Rider',
    description: 'The delivery app your riders install.',
    clientId: 'rider-app',
  },
  {
    key: 'pos',
    label: 'Point of sale',
    defaultName: 'Codevertex POS',
    description: 'The till and kitchen screens your staff use.',
    clientId: 'pos-ui',
  },
  {
    key: 'logistics',
    label: 'Dispatch and logistics',
    defaultName: 'Codevertex Logistics',
    description: 'The dispatch console for assigning deliveries.',
    clientId: 'logistics-ui',
  },
];

export function getServiceBranding(
  metadata: Record<string, unknown> | undefined,
  service: string,
): ServiceBrandingEntry | null {
  const all = metadata?.service_branding;
  if (!all || typeof all !== 'object') return null;
  const entry = (all as Record<string, unknown>)[service];
  return entry && typeof entry === 'object' ? (entry as ServiceBrandingEntry) : null;
}

/** Public tenant record (metadata included) for pages that need more than the brand. */
export async function getPublicTenant(slug: string): Promise<PublicTenant | null> {
  if (!slug) return null;
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
  const m = (metadata || {}) as TenantBrandMetadata;
  return {
    logoUrl: m.logo_url ?? m.logoUrl ?? '',
    primaryColor: m.primary_color ?? m.primaryColor ?? '#0ea5e9',
    secondaryColor: m.secondary_color ?? m.secondaryColor ?? '#6366f1',
  };
}
