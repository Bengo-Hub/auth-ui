'use client';

import { getBrandFromMetadata, getTenantBySlug, type PublicTenant } from '@/lib/tenant-api';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type TenantContextType = {
  tenant: PublicTenant | null;
  slug: string | null;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  isLoading: boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const DEFAULT_PRIMARY = '#ec4899';
const DEFAULT_SECONDARY = '#6366f1';

function getSlug(): string | null {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_TENANT_SLUG || null;
  const params = new URLSearchParams(window.location.search);
  return params.get('tenant') || process.env.NEXT_PUBLIC_TENANT_SLUG || null;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<PublicTenant | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const slugVal = getSlug();
    setSlug(slugVal);
    if (!slugVal) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    getTenantBySlug(slugVal).then((t) => {
      if (cancelled) return;
      setTenant(t || null);
      if (t) {
        const brand = getBrandFromMetadata(t.metadata);
        setLogoUrl(brand.logoUrl);
        setPrimaryColor(brand.primaryColor);
        setSecondaryColor(brand.secondaryColor);
        document.documentElement.style.setProperty('--tenant-primary', brand.primaryColor);
        document.documentElement.style.setProperty('--tenant-secondary', brand.secondaryColor);
        document.documentElement.style.setProperty('--tenant-logo-url', brand.logoUrl ? `url(${brand.logoUrl})` : 'none');
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value: TenantContextType = {
    tenant,
    slug,
    logoUrl,
    primaryColor,
    secondaryColor,
    isLoading,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (ctx === undefined) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
