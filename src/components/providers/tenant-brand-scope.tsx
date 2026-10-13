'use client';

/**
 * Applies a tenant's branding (logo, name, colour tokens) to whatever it wraps, through the
 * shared shared-ui-lib TenantBrandingProvider so the colour maths and caching match every other
 * app (ordering-frontend, pos-ui, notifications-ui). The platform tenant, or no tenant, keeps
 * auth-ui's own Codevertex tokens. Used by the sign-in pages (tenant from the auth flow) and the
 * dashboard (the signed-in person's active organisation).
 */

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { TenantBrandingProvider, useTenantBranding, type TenantBrand } from '@bengo-hub/shared-ui-lib/tenant';
import { PLATFORM_TENANT_SLUG } from '@/lib/auth-context';

const AUTH_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexafrica.com';

// Fallbacks while a tenant without its own colours resolves: auth-ui's own primary
// (globals.css 291 100% 35%) and the Codevertex accent, so nothing flashes indigo.
const PLATFORM_PRIMARY = '#9800B3';
const PLATFORM_SECONDARY = '#ea8022';
export const PLATFORM_LOGO = '/images/logo/codevertex.png';

// Inline tokens the shared provider writes on <html>. Cleared when the scope unmounts so one
// tenant's colour never leaks onto a platform page or another tenant.
const BRAND_VARS = [
  '--tenant-primary', '--tenant-secondary', '--tenant-logo-url', '--primary', '--primary-foreground',
  '--ring', '--brand-primary', '--brand-emphasis', '--brand-dark', '--primary-dark',
];

export interface ShellBrand {
  isPlatform: boolean;
  isLoading: boolean;
  slug: string;
  name: string;
  logoUrl: string | null;
  /** The shared brand record (service_branding etc.); null on the platform. */
  tenant: TenantBrand | null;
}

const PLATFORM_BRAND: ShellBrand = {
  isPlatform: true,
  isLoading: false,
  slug: PLATFORM_TENANT_SLUG,
  name: 'Codevertex',
  logoUrl: PLATFORM_LOGO,
  tenant: null,
};

const ShellBrandContext = createContext<ShellBrand>(PLATFORM_BRAND);

/** Branding of the nearest TenantBrandScope; the platform brand outside one. */
export function useShellBrand(): ShellBrand {
  return useContext(ShellBrandContext);
}

/** "urban-loft" -> "Urban Loft", shown until (or if never) the tenant's own name loads. */
function slugToName(slug: string): string {
  return slug.split(/[-_]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function TenantBridge({ slug, children }: { slug: string; children: ReactNode }) {
  const { tenant, isLoading } = useTenantBranding();
  const value = useMemo<ShellBrand>(() => ({
    isPlatform: false,
    isLoading,
    slug,
    // The shared provider echoes the slug as the name when the lookup fails.
    name: (tenant?.orgName && tenant.orgName !== slug ? tenant.orgName : '') || (tenant?.name && tenant.name !== slug ? tenant.name : '') || slugToName(slug),
    logoUrl: tenant?.logoUrl ?? null,
    tenant: tenant ?? null,
  }), [tenant, isLoading, slug]);
  return <ShellBrandContext.Provider value={value}>{children}</ShellBrandContext.Provider>;
}

export function TenantBrandScope({ slug, children }: { slug: string | null | undefined; children: ReactNode }) {
  const tenantSlug = slug && slug !== PLATFORM_TENANT_SLUG ? slug : '';

  useEffect(() => {
    if (!tenantSlug) return;
    return () => {
      const root = document.documentElement;
      for (const v of BRAND_VARS) root.style.removeProperty(v);
    };
  }, [tenantSlug]);

  if (!tenantSlug) {
    return <ShellBrandContext.Provider value={PLATFORM_BRAND}>{children}</ShellBrandContext.Provider>;
  }
  return (
    <TenantBrandingProvider
      slug={tenantSlug}
      authApiBase={AUTH_API_BASE}
      defaultPrimaryColor={PLATFORM_PRIMARY}
      defaultSecondaryColor={PLATFORM_SECONDARY}
    >
      <TenantBridge slug={tenantSlug}>{children}</TenantBridge>
    </TenantBrandingProvider>
  );
}
