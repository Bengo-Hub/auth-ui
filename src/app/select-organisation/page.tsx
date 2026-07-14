'use client';

import { WrongOrganisationDialog, type TenantSuggestion } from '@/components/auth/WrongOrganisationDialog';
import apiClient from '@/lib/api-client';
import { rewriteTenantInUrl } from '@/lib/tenant-url';
import { isValidReturnUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

interface MembershipsResponse {
  tenants: TenantSuggestion[];
  is_platform_owner?: boolean;
  email?: string;
}

/**
 * Organisation picker for the SSO authorize flow. The auth-api redirects here
 * when a signed-in user requests a tenant they don't belong to (instead of
 * bouncing access_denied back to the service callback, which was a dead-end).
 *
 * On selection the requested tenant slug is rewritten EVERYWHERE in the
 * original authorize URL (tenant param + redirect_uri path) and the flow
 * resumes — the user lands on the service signed in to the right organisation.
 */
function SelectOrganisationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('return_to');
  const requestedTenant = searchParams.get('tenant') ?? '';
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const loginUrl = () => {
    const params = new URLSearchParams();
    if (returnTo) params.set('return_to', returnTo);
    if (requestedTenant) params.set('tenant', requestedTenant);
    const qs = params.toString();
    return qs ? `/login?${qs}` : '/login';
  };

  const { data, isLoading, isError } = useQuery<MembershipsResponse>({
    queryKey: ['my_memberships'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/auth/me/memberships');
      return data as MembershipsResponse;
    },
    retry: false,
  });

  const continueToTenant = (slug: string) => {
    setBusySlug(slug);
    if (returnTo && isValidReturnUrl(returnTo)) {
      // Resume the original authorize flow re-targeted at the chosen org.
      window.location.href = rewriteTenantInUrl(returnTo, slug, requestedTenant || undefined);
      return;
    }
    // No usable return URL — land on the account dashboard.
    router.replace('/dashboard');
  };

  const useDifferentAccount = async () => {
    setBusySlug('__logout__');
    try {
      await apiClient.post('/api/v1/auth/logout', {});
    } catch {
      // Session may already be gone — proceed to login regardless.
    }
    window.location.href = loginUrl();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your organisations…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    // Not signed in (or the session expired mid-flow) — go to login with the
    // full flow context preserved.
    if (typeof window !== 'undefined') window.location.replace(loginUrl());
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <WrongOrganisationDialog
        requestedTenant={requestedTenant || 'the requested organisation'}
        tenants={data?.tenants ?? []}
        onSelect={continueToTenant}
        busySlug={busySlug}
        onUseDifferentAccount={useDifferentAccount}
        hint="We'll take you straight into the organisation you select — no need to sign in again."
      />
    </div>
  );
}

export default function SelectOrganisationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <SelectOrganisationInner />
    </Suspense>
  );
}
