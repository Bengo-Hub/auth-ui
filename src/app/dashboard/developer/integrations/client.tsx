'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { oauthProviders } from '@/lib/oauth/catalog';
import { OAuthProviderCard } from '@/components/oauth/oauth-provider-card';
import { ShieldCheck } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  status: string;
  tenant_id?: string;
}

export default function IntegrationsClient() {
  const { data: configs, isLoading } = useQuery<Integration[]>({
    queryKey: ['admin_integrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/admin/integrations');
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Identity Providers</h1>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Enable SSO via Google, Microsoft, or GitHub. Credentials are encrypted with
          AES-256-GCM and distributed centrally — no <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> files
          in downstream services. Only enabled providers appear on the login and
          signup pages.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Platform-scope configuration — applies to every tenant unless overridden.</span>
        </div>
      </header>

      <section className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          OAuth Providers
        </h2>
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
          {oauthProviders.map((provider) => {
            const existing = configs?.find((i) => i.name === provider.id);
            return (
              <OAuthProviderCard
                key={provider.id}
                provider={provider}
                existing={existing}
              />
            );
          })}
        </div>
        {isLoading && (
          <p className="mt-4 text-xs text-muted-foreground">Loading current configuration…</p>
        )}
      </section>
    </div>
  );
}
