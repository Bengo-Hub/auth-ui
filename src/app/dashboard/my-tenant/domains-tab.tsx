'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Globe, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ── Domains ───────────────────────────────────────────────────────────────────
// A tenant's own hostname for one platform service (its online store, TruLoad, the ERP, ...).
// Adding one is all the tenant does: the platform creates the DNS record when the domain's DNS is
// in our Cloudflare account (otherwise it shows the one record to add), the routing and the
// security certificate, and switches the domain on when it is ready. Used by the organization
// itself (My organization) and by platform owners for any tenant.

type DomainStatus = 'pending_dns' | 'issuing' | 'active' | 'failed' | 'removing';

type Domain = {
  id: string;
  service: string;
  service_name: string;
  hostname: string;
  status: DomainStatus;
  dns_mode: 'cloudflare' | 'external';
  dns_record?: { type: string; name: string; value: string };
  last_error?: string;
  last_checked_at?: string;
  activated_at?: string;
  url: string;
};

type ServiceOption = { key: string; name: string };

const STATUS: Record<DomainStatus, { label: string; tone: string }> = {
  pending_dns: { label: 'Waiting for DNS', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
  issuing: { label: 'Getting certificate', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' },
  active: { label: 'Live', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' },
  failed: { label: 'Needs attention', tone: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300' },
  removing: { label: 'Removing', tone: 'bg-muted text-muted-foreground' },
};

function errorMessage(e: unknown, fallback: string): string {
  const data = (e as { response?: { data?: { message?: string; error_description?: string } } })?.response?.data;
  return data?.message || data?.error_description || fallback;
}

export function DomainsTab({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [hostname, setHostname] = useState('');
  const [service, setService] = useState('ordering');
  const key = ['tenant-domains', tenantId];

  const { data, isLoading, isError } = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<{ data: Domain[]; enabled: boolean }>(`/api/v1/admin/tenants/${tenantId}/domains`)).data,
    // Keep pending domains moving on screen while the platform connects them.
    refetchInterval: (q) => ((q.state.data?.data ?? []).some((d) => d.status !== 'active') ? 15000 : false),
  });
  const { data: services } = useQuery({
    queryKey: ['domain-services'],
    queryFn: async () => (await api.get<{ data: ServiceOption[] }>('/api/v1/domains/services')).data.data,
    staleTime: 10 * 60 * 1000,
  });

  const add = useMutation({
    mutationFn: async () => (await api.post<Domain>(`/api/v1/admin/tenants/${tenantId}/domains`, { hostname, service })).data,
    onSuccess: (d) => {
      setHostname('');
      qc.invalidateQueries({ queryKey: key });
      toast({ title: 'Domain added', description: d.status === 'pending_dns' && d.dns_mode === 'external'
        ? 'Add the DNS record shown below at your domain provider.'
        : 'We are connecting it now. This usually takes a minute or two.' });
    },
    onError: (e) => toast({ title: 'Could not add the domain', description: errorMessage(e, 'Try again.'), variant: 'destructive' }),
  });
  const recheck = useMutation({
    mutationFn: async (id: string) => (await api.post<Domain>(`/api/v1/admin/tenants/${tenantId}/domains/${id}/recheck`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e) => toast({ title: 'Check failed', description: errorMessage(e, 'Try again.'), variant: 'destructive' }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/v1/admin/tenants/${tenantId}/domains/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast({ title: 'Domain removed', description: 'Its routing, certificate and DNS record are being removed.' });
    },
    onError: (e) => toast({ title: 'Could not remove the domain', description: errorMessage(e, 'Try again.'), variant: 'destructive' }),
  });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied' });
    } catch {
      toast({ title: 'Copy failed', description: text });
    }
  };

  const enabled = data?.enabled ?? true;
  const list = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold">Use your own domain</h3>
            <p className="text-sm text-muted-foreground">
              Put your online store or another service on a web address you own, such as shop.yourbusiness.co.ke.
              We set up the secure connection for you.
            </p>
          </div>
        </div>
        {!enabled && (
          <p className="text-sm text-amber-700 dark:text-amber-300">Custom domains are not available on this platform yet.</p>
        )}
        <form
          className="grid gap-3 sm:grid-cols-[1fr_220px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (hostname.trim()) add.mutate();
          }}
        >
          <label className="sr-only" htmlFor="domain-hostname">Domain</label>
          <input
            id="domain-hostname"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="shop.yourbusiness.co.ke"
            autoComplete="off"
            spellCheck={false}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            disabled={!enabled}
          />
          <label className="sr-only" htmlFor="domain-service">Service</label>
          <select
            id="domain-service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            disabled={!enabled}
          >
            {(services ?? [{ key: 'ordering', name: 'Online store and ordering' }]).map((s) => (
              <option key={s.key} value={s.key}>{s.name}</option>
            ))}
          </select>
          <Button type="submit" disabled={!enabled || !hostname.trim() || add.isPending}>
            {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add domain'}
          </Button>
        </form>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading domains...</p>}
      {isError && <p className="text-sm text-destructive">Could not load your domains.</p>}
      {!isLoading && !isError && list.length === 0 && (
        <p className="text-sm text-muted-foreground">No domains yet. Add one above and it will appear here with its progress.</p>
      )}

      <ul className="space-y-3">
        {list.map((d) => {
          const st = STATUS[d.status];
          return (
            <li key={d.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="min-w-0">
                  <div className="font-medium break-all">{d.hostname}</div>
                  <div className="text-xs text-muted-foreground">{d.service_name || d.service}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.tone}`}>{st.label}</span>
                  {d.status === 'active' && (
                    <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {d.dns_record && (
                <div className="rounded-lg bg-muted/60 p-3 text-sm space-y-2">
                  <p>At the company where you bought the domain, add this DNS record. We check it every minute and finish the rest.</p>
                  <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 items-center font-mono text-xs">
                    <span className="text-muted-foreground">Type</span><span>{d.dns_record.type}</span><span />
                    <span className="text-muted-foreground">Name</span><span className="break-all">{d.dns_record.name}</span>
                    <button type="button" aria-label="Copy name" onClick={() => copy(d.dns_record!.name)} className="p-1 hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                    <span className="text-muted-foreground">Value</span><span>{d.dns_record.value}</span>
                    <button type="button" aria-label="Copy value" onClick={() => copy(d.dns_record!.value)} className="p-1 hover:text-primary"><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground">Remove any other A, AAAA or CNAME record for the same name first.</p>
                </div>
              )}

              {d.status !== 'active' && d.last_error && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {d.last_error}
                </p>
              )}
              {d.status === 'active' && (
                <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Secure and live{d.activated_at ? ` since ${new Date(d.activated_at).toLocaleDateString()}` : ''}.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {d.status !== 'active' && d.status !== 'removing' && (
                  <Button size="sm" variant="outline" onClick={() => recheck.mutate(d.id)} disabled={recheck.isPending}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Check again
                  </Button>
                )}
                {d.status !== 'removing' && (confirmId === d.id ? (
                  <>
                    <Button size="sm" variant="destructive" onClick={() => { remove.mutate(d.id); setConfirmId(null); }}>
                      Remove {d.hostname}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>Keep it</Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setConfirmId(d.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                  </Button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
