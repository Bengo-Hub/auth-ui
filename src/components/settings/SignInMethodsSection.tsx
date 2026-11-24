'use client';

/**
 * Sign-in methods: the Google, GitHub, Microsoft and TikTok accounts linked to the signed-in
 * person. Linking goes through the provider and comes back here with ?linked= or ?link_error=.
 * After linking, "Login with <provider>" signs in to this same account. auth-api refuses to
 * unlink the last way to sign in (no password and no other linked account).
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link2, Loader2, Unlink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ProviderLogo } from '@/components/oauth/provider-logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { oauthProviders, type OAuthProviderDef } from '@/lib/oauth/catalog';
import { formatDate } from '@/lib/user-timezone';

export interface LinkedIdentity {
  id: string;
  provider: string;
  email: string;
  email_verified: boolean;
  name?: string;
  linked_at: string;
}

interface IdentitiesResponse {
  identities: LinkedIdentity[];
  has_password: boolean;
}

const IDENTITIES_KEY = ['me', 'identities'];

/** True when removing this identity would leave the account with no way to sign in. */
export function isLastSignInMethod(identities: LinkedIdentity[], hasPassword: boolean): boolean {
  return !hasPassword && identities.length <= 1;
}

/** A placeholder address (TikTok shares no email) is not worth showing. */
function shownEmail(email: string): string {
  return /\.local$/i.test(email) ? '' : email;
}

function errorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string; error?: string } } };
  return e?.response?.data?.message || e?.response?.data?.error || fallback;
}

function useActiveProviders(): OAuthProviderDef[] {
  const { data } = useQuery<{ name: string }[]>({
    queryKey: ['active_integrations', 'oauth'],
    queryFn: async () => (await apiClient.get('/api/v1/auth/integrations/active?category=oauth')).data ?? [],
    staleTime: 5 * 60 * 1000,
  });
  const enabled = new Set((data ?? []).map((i) => i.name));
  return oauthProviders.filter((p) => enabled.has(p.id));
}

export function SignInMethodsSection({ disabled = false }: { disabled?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const providers = useActiveProviders();
  const [busy, setBusy] = useState<string | null>(null);
  const reported = useRef(false);

  const { data, isLoading } = useQuery<IdentitiesResponse>({
    queryKey: IDENTITIES_KEY,
    queryFn: async () => (await apiClient.get('/api/v1/auth/me/identities')).data,
  });
  const identities = data?.identities ?? [];
  const hasPassword = data?.has_password ?? false;
  const nameOf = (id: string) => oauthProviders.find((p) => p.id === id)?.name ?? id;

  // The provider round trip lands back here with the outcome in the query string.
  useEffect(() => {
    if (reported.current) return;
    const linked = searchParams.get('linked');
    const linkError = searchParams.get('link_error');
    if (!linked && !linkError) return;
    reported.current = true;
    if (linked) {
      toast({ title: `${nameOf(linked)} linked`, description: `You can now sign in with ${nameOf(linked)}.` });
    } else if (linkError) {
      toast({ title: 'Could not link the account', description: linkError, variant: 'destructive' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const link = async (provider: OAuthProviderDef) => {
    setBusy(provider.id);
    try {
      const res = await apiClient.post(`/api/v1/auth/me/identities/${provider.id}/link`, {});
      const url = res.data?.authorization_url;
      if (!url) throw new Error('no authorization_url');
      window.location.href = url;
    } catch (err) {
      toast({ title: 'Could not start linking', description: errorMessage(err, `Could not reach ${provider.name}. Try again.`), variant: 'destructive' });
      setBusy(null);
    }
  };

  const unlink = async (identity: LinkedIdentity) => {
    setBusy(identity.id);
    try {
      await apiClient.delete(`/api/v1/auth/me/identities/${identity.id}`);
      toast({ title: `${nameOf(identity.provider)} unlinked` });
      await queryClient.invalidateQueries({ queryKey: IDENTITIES_KEY });
    } catch (err) {
      toast({ title: 'Could not unlink', description: errorMessage(err, 'Try again.'), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const lastMethod = isLastSignInMethod(identities, hasPassword);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Sign-in methods</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Link a Google, GitHub, Microsoft or TikTok account to sign in to this account with it.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-2">
          {identities.map((identity) => {
            const def = oauthProviders.find((p) => p.id === identity.provider);
            const email = shownEmail(identity.email);
            return (
              <div key={identity.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 min-w-0">
                  {def ? (
                    <ProviderLogo providerId={def.id} slug={def.logoSlug} color={def.logoColor} brandColor={def.brandColor} name={def.name} size={20} />
                  ) : (
                    <Link2 className="h-5 w-5 text-slate-400" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {nameOf(identity.provider)}
                      {identity.name ? <span className="font-normal text-slate-500"> · {identity.name}</span> : null}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {email ? `${email} · ` : ''}Linked {formatDate(identity.linked_at)}
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold rounded-xl shrink-0"
                    disabled={busy === identity.id || lastMethod}
                    title={lastMethod ? 'This is your only way to sign in. Set a password or link another account first.' : undefined}
                    onClick={() => unlink(identity)}
                  >
                    {busy === identity.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Unlink className="w-4 h-4 mr-1.5" />Unlink</>}
                  </Button>
                )}
              </div>
            );
          })}
          {identities.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
              No sign-in accounts linked yet.
            </div>
          )}
          {lastMethod && identities.length === 1 && !disabled && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This is your only way to sign in, so it cannot be unlinked until you set a password or link another account.
            </p>
          )}
        </div>
      )}

      {!disabled && providers.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {providers.map((p) => (
            <Button key={p.id} variant="outline" className="h-10 rounded-xl font-semibold dark:border-slate-700" disabled={busy === p.id} onClick={() => link(p)}>
              {busy === p.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ProviderLogo providerId={p.id} slug={p.logoSlug} color={p.logoColor} brandColor={p.brandColor} name={p.name} size={16} className="!bg-transparent !p-0 !ring-0 mr-2" />
              )}
              Link {p.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
