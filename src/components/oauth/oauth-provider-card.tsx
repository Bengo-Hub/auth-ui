'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ProviderLogo } from './provider-logo';
import type { OAuthProviderDef } from '@/lib/oauth/catalog';
import { CheckCircle2, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

type IntegrationRow = {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  status: string;
  tenant_id?: string;
};

/**
 * Metadata-driven config card for one OAuth provider. Renders a form from the
 * catalog definition, round-trips credentials through
 * POST /api/v1/admin/integrations, and toggles active state via
 * PUT /api/v1/admin/integrations/{id}/status. Mirrors the marketflow
 * ProviderCard layout — logo on the left, fields on the right, docs link,
 * connected badge.
 */
export function OAuthProviderCard({
  provider,
  existing,
}: {
  provider: OAuthProviderDef;
  existing?: IntegrationRow;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const configured = !!existing;
  const active = !!existing?.is_active;

  const initial = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of provider.fields) {
      if (f.default !== undefined) out[f.key] = f.default;
      else out[f.key] = '';
    }
    return out;
  }, [provider.fields]);

  const [values, setValues] = useState<Record<string, string>>(initial);
  useEffect(() => setValues(initial), [initial]);

  const save = useMutation({
    mutationFn: async () => {
      // Strip empty secret fields so a blank input doesn't overwrite an
      // existing stored secret — lets the admin rotate a single field.
      const credentials: Record<string, string> = {};
      for (const f of provider.fields) {
        const v = values[f.key] ?? '';
        if (v === '' && f.secret && configured) continue;
        if (v !== '') credentials[f.key] = v;
      }
      await apiClient.post('/api/v1/admin/integrations', {
        name: provider.id,
        display_name: provider.name,
        description: provider.description,
        credentials,
        is_active: true,
      });
    },
    onSuccess: () => {
      toast({ title: 'Saved', description: `${provider.name} credentials encrypted and stored.` });
      qc.invalidateQueries({ queryKey: ['admin_integrations'] });
      qc.invalidateQueries({ queryKey: ['active_integrations'] });
    },
    onError: () =>
      toast({
        title: 'Error',
        description: `Failed to save ${provider.name} credentials`,
        variant: 'destructive',
      }),
  });

  const toggle = useMutation({
    mutationFn: async (next: boolean) => {
      if (!existing) throw new Error('not configured');
      return apiClient.put(`/api/v1/admin/integrations/${existing.id}/status`, {
        is_active: next,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin_integrations'] });
      qc.invalidateQueries({ queryKey: ['active_integrations'] });
    },
  });

  const set = (key: string, v: string) => setValues((s) => ({ ...s, [key]: v }));

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ProviderLogo
            providerId={provider.id}
            slug={provider.logoSlug}
            color={provider.logoColor}
            brandColor={provider.brandColor}
            name={provider.name}
            size={48}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-none">{provider.name}</h3>
              {configured ? (
                active ? (
                  <Badge className="!bg-emerald-100 !text-emerald-800 !px-2 !py-0.5">
                    <CheckCircle2 className="mr-1 inline h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="!px-2 !py-0.5">Inactive</Badge>
                )
              ) : (
                <Badge variant="outline" className="!px-2 !py-0.5">Not configured</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{provider.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {configured && (
            <Switch
              checked={active}
              onCheckedChange={(v) => toggle.mutate(v)}
              disabled={toggle.isPending}
              aria-label={`Toggle ${provider.name}`}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {provider.fields.map((f) => (
          <div key={f.key} className={f.type === 'url' ? 'md:col-span-2' : undefined}>
            <Label htmlFor={`${provider.id}-${f.key}`} className="text-xs font-medium text-muted-foreground">
              {f.label}
              {f.required && <span className="ml-1 text-rose-500">*</span>}
            </Label>
            <Input
              id={`${provider.id}-${f.key}`}
              type={f.type === 'password' ? 'password' : 'text'}
              value={values[f.key] ?? ''}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={
                f.secret && configured
                  ? '•••••••• (leave blank to keep existing)'
                  : f.placeholder
              }
              autoComplete="off"
              spellCheck={false}
              className="mt-1"
            />
            {f.help && (
              <p className="mt-1 text-[11px] text-muted-foreground">{f.help}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            AES-256-GCM at rest
          </span>
          <a
            className="inline-flex items-center gap-1 hover:text-foreground"
            href={provider.docsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Console
            <ExternalLink className="h-3 w-3" />
          </a>
          {provider.setupGuideUrl && (
            <a
              className="inline-flex items-center gap-1 hover:text-foreground"
              href={provider.setupGuideUrl}
              target="_blank"
              rel="noreferrer"
            >
              Setup guide
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          style={configured ? undefined : { background: provider.brandColor, color: '#fff' }}
        >
          {save.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {save.isPending ? 'Saving…' : configured ? 'Update credentials' : 'Configure'}
        </Button>
      </div>
    </div>
  );
}
