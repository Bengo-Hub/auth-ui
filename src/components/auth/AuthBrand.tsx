'use client';

/**
 * Branding for the sign-in pages. A person arriving from Urban Loft's ordering app sees Urban
 * Loft's logo, name and colour, not Codevertex's. The tenant comes from the auth flow
 * (resolveAuthContext); TenantBrandScope applies it. Adds what only the auth pages need: the
 * app being signed in to, by the tenant's own name for it ("Urban Eats").
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { serviceAppName, serviceBrandingFor } from '@bengo-hub/shared-ui-lib/tenant';
import { TenantBrandScope, useShellBrand, type ShellBrand } from '@/components/providers/tenant-brand-scope';
import { resolveAuthContext, type AuthContext } from '@/lib/auth-context';
import { BRANDABLE_SERVICES } from '@/lib/tenant-api';

export interface AuthBrand extends ShellBrand {
  /** The app the person is signing in to, when known. */
  appName: string | null;
  flow: AuthContext;
}

const AuthBrandContext = createContext<AuthBrand | null>(null);

export function useAuthBrand(): AuthBrand {
  const ctx = useContext(AuthBrandContext);
  if (!ctx) throw new Error('useAuthBrand must be used inside <AuthBrandScope>');
  return ctx;
}

function AuthBrandValue({ flow, children }: { flow: AuthContext; children: ReactNode }) {
  const shell = useShellBrand();
  const value = useMemo<AuthBrand>(() => {
    const service = flow.clientId ? BRANDABLE_SERVICES.find((s) => s.clientId === flow.clientId) : undefined;
    let appName: string | null = null;
    if (shell.isPlatform) {
      appName = flow.clientId === 'codevertex-website' ? 'Digitika Academy' : service ? `Codevertex ${service.appLabel}` : null;
    } else if (service) {
      const custom = serviceBrandingFor(shell.tenant, service.key);
      appName = serviceAppName(shell.name, service.appLabel, shell.slug, custom) || null;
    }
    return { ...shell, appName, flow };
  }, [shell, flow]);
  return <AuthBrandContext.Provider value={value}>{children}</AuthBrandContext.Provider>;
}

export function AuthBrandScope({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const flow = useMemo(() => resolveAuthContext(searchParams), [searchParams]);
  return (
    <TenantBrandScope slug={flow.tenantSlug}>
      <AuthBrandValue flow={flow}>{children}</AuthBrandValue>
    </TenantBrandScope>
  );
}
