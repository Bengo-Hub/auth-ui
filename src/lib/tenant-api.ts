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
 * Per-service app name and icon a tenant can set (tenant metadata `service_branding`, validated
 * by auth-api). The type and parser are shared-ui-lib's (branding), the same ones every app uses
 * to read the entry; without one an app is "<brand word> <appLabel>" ("The Urban POS").
 */
export type { ServiceBrandingEntry } from '@bengo-hub/shared-ui-lib/branding';
export { serviceBrandingEntry as getServiceBranding } from '@bengo-hub/shared-ui-lib/branding';

export interface BrandableService {
  /** Key in metadata service_branding; the app-switcher registry key the app reads. */
  key: string;
  label: string;
  /** Word the app appends to the tenant's brand word by default ("POS" gives "The Urban POS"). */
  appLabel: string;
  description: string;
  /** SSO client id, so the sign-in page can say "Continue to <app name>". */
  clientId?: string;
}

/** Every app that shows the tenant's own name for it (header, install prompt, manifest). */
export const BRANDABLE_SERVICES: BrandableService[] = [
  { key: 'ordering', label: 'Online ordering app', appLabel: 'Ordering', clientId: 'ordering-ui',
    description: 'The storefront your customers order from and install on their phones.' },
  { key: 'rider', label: 'Rider app', appLabel: 'Rider', clientId: 'rider-app',
    description: 'The delivery app your riders install.' },
  { key: 'pos', label: 'Point of sale', appLabel: 'POS', clientId: 'pos-ui',
    description: 'The till and kitchen screens your staff use.' },
  { key: 'logistics', label: 'Dispatch and logistics', appLabel: 'Logistics', clientId: 'logistics-ui',
    description: 'The dispatch console for assigning deliveries.' },
  { key: 'inventory', label: 'Inventory', appLabel: 'Inventory', clientId: 'inventory-ui',
    description: 'Stock, purchasing and stock counts.' },
  { key: 'treasury', label: 'Treasury (books)', appLabel: 'Treasury', clientId: 'treasury-ui',
    description: 'Invoices, payments, expenses and accounts.' },
  { key: 'erp', label: 'HR and payroll', appLabel: 'HR', clientId: 'erp-ui',
    description: 'Staff records, leave and payroll.' },
  { key: 'subscriptions', label: 'Subscriptions', appLabel: 'Subscriptions', clientId: 'subscriptions-ui',
    description: 'Your plan, billing and add-ons.' },
  { key: 'ticketing', label: 'Ticketing', appLabel: 'Ticketing', clientId: 'ticketing-ui',
    description: 'Events and ticket sales.' },
  { key: 'afya', label: 'Afya (clinic)', appLabel: 'Afya', clientId: 'hospital-ui',
    description: 'Patients, visits and the clinic front desk.' },
  { key: 'maskani', label: 'Maskani (property)', appLabel: 'Maskani', clientId: 'maskani-ui',
    description: 'Estate bills, payments, visitors and requests.' },
  { key: 'library', label: 'Library', appLabel: 'Library',
    description: 'Catalogue, loans, holds and fines.' },
];

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
