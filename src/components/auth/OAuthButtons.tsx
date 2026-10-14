'use client';

/**
 * Social sign-in buttons (Google, GitHub, Microsoft...) for the login and sign-up cards. Only
 * providers that are both in the catalogue and active in auth-api render. The start request
 * carries the flow's tenant and client so a customer arriving from a tenant's ordering app
 * joins that tenant as its customer, not the platform as a "member".
 */

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { useAuthBrand } from '@/components/auth/AuthBrand';
import { ProviderLogo } from '@/components/oauth/provider-logo';
import apiClient from '@/lib/api-client';
import { oauthProviders, type OAuthProviderDef } from '@/lib/oauth/catalog';
import { getSafeReturnUrl } from '@/lib/utils';

type ActiveIntegration = { name: string };

/**
 * Providers are central: auth-api serves the same Google, Microsoft and GitHub apps to every tenant
 * (GET /auth/integrations/active ignores tenant_slug for the oauth category). Nothing here depends on
 * the tenant, so a tenant's branding never changes which sign-in methods exist.
 */
function useActiveOAuthProviders(): OAuthProviderDef[] {
  const { data } = useQuery<ActiveIntegration[]>({
    queryKey: ['active_integrations', 'oauth'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/auth/integrations/active?category=oauth');
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const enabled = new Set((data ?? []).map((i) => i.name));
  return oauthProviders.filter((p) => enabled.has(p.id));
}

function OAuthButton({ provider, label }: { provider: OAuthProviderDef; label: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const searchParams = useSearchParams();
  const { flow } = useAuthBrand();

  const start = async () => {
    setIsLoading(true);
    setFailed(false);
    try {
      const response = await apiClient.post(`/api/v1/auth/oauth/${provider.id}/start`, {
        return_to: getSafeReturnUrl(searchParams.get('return_to'), '/dashboard'),
        // The explicit tenant param only, as before: tenant context rides in the signed OAuth state.
        tenant_slug: flow.loginTenant,
        client_id: flow.clientId || undefined,
      });
      const url = response.data?.authorization_url;
      if (!url) throw new Error('no authorization_url');
      window.location.href = url;
    } catch {
      setFailed(true);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ProviderLogo
            providerId={provider.id}
            slug={provider.logoSlug}
            color={provider.logoColor}
            brandColor={provider.brandColor}
            name={provider.name}
            size={18}
            className="!bg-transparent !p-0 !ring-0"
          />
        )}
        {label ? `${label} ${provider.name}` : provider.name}
      </button>
      {failed && <p className="mt-1.5 text-center text-xs text-red-600 dark:text-red-400">Could not reach {provider.name}. Try again.</p>}
    </div>
  );
}

/** Renders nothing when no provider is active, so the divider passed in `after` goes too. */
export function OAuthButtonGroup({ label = 'Continue with', after }: { label?: string; after?: ReactNode }) {
  const providers = useActiveOAuthProviders();
  if (providers.length === 0) return null;
  return (
    <>
      <div className={providers.length === 1 ? 'grid gap-3' : providers.length === 2 ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3 sm:grid-cols-3'}>
        {providers.map((p) => <OAuthButton key={p.id} provider={p} label={providers.length === 1 ? label : ''} />)}
      </div>
      {after}
    </>
  );
}
