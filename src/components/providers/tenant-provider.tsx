'use client';

import { getTenantBySlug, type TenantBrand } from '@/lib/tenant-api';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type TenantContextType = {
  tenant: TenantBrand | null;
  slug: string | null;
  isLoading: boolean;
  getServiceTitle: (appName: string) => string;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

function getSlug(): string | null {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_TENANT_SLUG || null;
  const params = new URLSearchParams(window.location.search);
  return params.get('tenant') || process.env.NEXT_PUBLIC_TENANT_SLUG || null;
}

const DEFAULT_BRAND: TenantBrand = {
  id: 'platform',
  name: 'Codevertex',
  slug: 'codevertex',
  logoUrl: '/images/logo/codevertex.png',
  primaryColor: '#5B1C4D',
  secondaryColor: '#ea8022',
  orgName: 'Codevertex IT Solutions',
};

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantBrand | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const slugVal = getSlug();
    setSlug(slugVal);
    
    // For core services like Auth, we always use Codevertex branding
    document.documentElement.style.setProperty('--tenant-primary', DEFAULT_BRAND.primaryColor!);
    document.documentElement.style.setProperty('--tenant-secondary', DEFAULT_BRAND.secondaryColor!);
    document.documentElement.style.setProperty('--tenant-logo-url', `url(${DEFAULT_BRAND.logoUrl})`);

    if (!slugVal) {
      setIsLoading(false);
      return;
    }
    
    let cancelled = false;
    getTenantBySlug(slugVal).then((t) => {
      if (cancelled) return;
      setTenant(t || null);
      // We don't override the properties here in core services
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveBrand = DEFAULT_BRAND;

  const getServiceTitle = (appName: string) => {
    return `Codevertex ${appName}`;
  };

  const value = useMemo(() => ({
    tenant: effectiveBrand,
    slug,
    isLoading,
    getServiceTitle,
  }), [effectiveBrand, slug, isLoading]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (ctx === undefined) {
    return {
      tenant: null,
      slug: null,
      isLoading: false,
      getServiceTitle: (s: string) => s,
    };
  }
  return ctx;
}
