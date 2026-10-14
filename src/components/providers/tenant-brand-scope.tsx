'use client';

/**
 * Applies a tenant's brand (logo, name and a full colour theme) to whatever it wraps. The brand
 * comes from the public tenant record (GET /api/v1/tenants/by-slug/{slug}) through the shared
 * shared-ui-lib TenantBrandingProvider, which also handles caching and the service_branding names.
 * Colours are NOT left to that provider's partial variable set: lib/tenant-theme.ts derives every
 * token (tinted neutrals, accent, ring, dark mode, readable text) from the tenant's primary and
 * secondary colours, so the whole surface follows the tenant, in light and dark.
 *
 * The platform tenant, or a tenant with no brand colour, keeps auth-ui's own Maskani-style theme.
 * The last theme seen for each slug is kept in localStorage so a returning visitor sees the
 * tenant's colours on first paint instead of after the network call.
 */

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { TenantBrandingProvider, useTenantBranding, type TenantBrand } from '@bengo-hub/shared-ui-lib/tenant';
import { PLATFORM_TENANT_SLUG } from '@/lib/auth-context';
import { buildTenantThemeCss, hasTenantTheme } from '@/lib/tenant-theme';

const AUTH_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sso.codevertexafrica.com';

export const PLATFORM_LOGO = '/images/logo/codevertex.png';

const STYLE_ID = 'tenant-theme';
const CACHE_PREFIX = 'cv-tenant-theme:';

// Layout effects warn during server rendering; the theme only exists in the browser.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

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

function setThemeCss(css: string) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!css) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
}

/** Paints the cached theme for a slug as early as possible, and removes it with the scope. */
function useCachedTheme(slug: string) {
  useBrowserLayoutEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + slug);
      if (cached) setThemeCss(buildTenantThemeCss(JSON.parse(cached)));
    } catch {
      // Private mode or corrupt entry: the network result still applies.
    }
    return () => setThemeCss('');
  }, [slug]);
}

function TenantBridge({ slug, children }: { slug: string; children: ReactNode }) {
  const { tenant, isLoading } = useTenantBranding();
  useCachedTheme(slug);

  // The provider echoes the slug as the brand name and a placeholder colour when the lookup fails,
  // so only a real record (with its own colour) replaces the cached or platform theme.
  const primary = tenant?.primaryColor ?? null;
  const secondary = tenant?.secondaryColor ?? null;
  useBrowserLayoutEffect(() => {
    if (isLoading || !tenant || tenant.name === slug || !hasTenantTheme({ primary })) return;
    setThemeCss(buildTenantThemeCss({ primary, secondary }));
    try {
      localStorage.setItem(CACHE_PREFIX + slug, JSON.stringify({ primary, secondary }));
    } catch {
      // Cache is an optimisation only.
    }
  }, [isLoading, tenant, slug, primary, secondary]);

  const value = useMemo<ShellBrand>(() => ({
    isPlatform: false,
    isLoading,
    slug,
    name: (tenant?.orgName && tenant.orgName !== slug ? tenant.orgName : '') || (tenant?.name && tenant.name !== slug ? tenant.name : '') || slugToName(slug),
    logoUrl: tenant?.logoUrl ?? null,
    tenant: tenant ?? null,
  }), [tenant, isLoading, slug]);
  return <ShellBrandContext.Provider value={value}>{children}</ShellBrandContext.Provider>;
}

export function TenantBrandScope({ slug, children }: { slug: string | null | undefined; children: ReactNode }) {
  const tenantSlug = slug && slug !== PLATFORM_TENANT_SLUG ? slug : '';

  if (!tenantSlug) {
    return <ShellBrandContext.Provider value={PLATFORM_BRAND}>{children}</ShellBrandContext.Provider>;
  }
  return (
    <TenantBrandingProvider slug={tenantSlug} authApiBase={AUTH_API_BASE} applyCssVariables={false}>
      <TenantBridge slug={tenantSlug}>{children}</TenantBridge>
    </TenantBrandingProvider>
  );
}
