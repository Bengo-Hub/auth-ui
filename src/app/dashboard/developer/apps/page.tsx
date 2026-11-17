'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useDeveloperOnly } from '@/hooks/use-developer-only';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, ClipboardCopy, Plus } from 'lucide-react';
import { appTokenServiceTag, buildAppColumns, type App } from './apps-columns';
import { CreateAppForm, type CreateAppPayload } from './create-app-form';

/** Shape of the create / rotate / rotate-secret responses (secrets present only once). */
interface IssuedResponse {
  client_id: string;
  token?: string;
  client_secret?: string;
}

interface IssuedCredentials {
  clientId: string;
  apiKey?: string;
  clientSecret?: string;
}

function toIssued(r: IssuedResponse): IssuedCredentials {
  return { clientId: r.client_id, apiKey: r.token || undefined, clientSecret: r.client_secret || undefined };
}

function credentialRows(c: IssuedCredentials) {
  const rows: { field: string; label: string; value: string }[] = [
    { field: 'client_id', label: 'Consumer key (client ID)', value: c.clientId },
  ];
  if (c.clientSecret) rows.push({ field: 'client_secret', label: 'Consumer secret', value: c.clientSecret });
  if (c.apiKey) rows.push({ field: 'api_key', label: 'API key (X-API-Key, legacy)', value: c.apiKey });
  return rows;
}

/** Apps list for platform owners (every app) and tenant developers (their tenant's apps). */
export default function AppsPage() {
  const { user, isPlatformOwner } = useAuth();
  const developerOnly = useDeveloperOnly();
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  // Credentials returned once by create, key rotation or secret rotation. Never stored or
  // fetched again: the server keeps only hashes.
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [goLiveRequested, setGoLiveRequested] = useState<Set<string>>(new Set());
  const [tokenBalances, setTokenBalances] = useState<Record<string, number | undefined>>({});

  const fetchApps = useCallback(async () => {
    try {
      const res = await apiClient.get<App[]>('/api/v1/admin/apps');
      const list = Array.isArray(res.data) ? res.data : [];
      setApps(isPlatformOwner ? list : list.filter((a) => a.app_type === 'tenant'));
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [isPlatformOwner]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  // The overview's "Create your first app" opens the form straight away (?new=1).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('new') === '1') setShowCreate(true);
  }, []);

  const showUsageBalance = useMemo(() => apps.some((a) => appTokenServiceTag(a) !== null), [apps]);

  // Token wallet balance per app scoped to a metered API (etims:*), from subscriptions-api.
  useEffect(() => {
    const targets = apps
      .filter((a) => a.tenant_id && appTokenServiceTag(a))
      .map((a) => ({ appId: a.id, tenantId: a.tenant_id as string, serviceTag: appTokenServiceTag(a) as string }));
    if (targets.length === 0) return;

    let cancelled = false;
    targets.forEach(async ({ appId, tenantId, serviceTag }) => {
      try {
        const res = await fetch(`/api/tokens/balance?tenant_id=${tenantId}&service_tag=${serviceTag}`);
        const body = await res.json();
        if (!cancelled && res.ok && typeof body?.balance === 'number') {
          setTokenBalances((prev) => ({ ...prev, [appId]: body.balance }));
        }
      } catch {
        // Left undefined: the column shows a placeholder.
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps]);

  const handleCreate = async (payload: CreateAppPayload) => {
    setCreating(true);
    try {
      const res = await apiClient.post<IssuedResponse>('/api/v1/admin/apps', payload);
      setIssued(toIssued(res.data));
      setShowCreate(false);
      fetchApps();
      toast({ title: 'App created', description: 'Save the credentials now. They will not be shown again.' });
    } catch {
      toast({ title: 'Create failed', description: 'Could not create app.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleRotate = async (app: App) => {
    if (!confirm(`Rotate the API key for "${app.name}"? The current key stops working immediately.`)) return;
    try {
      const res = await apiClient.post<IssuedResponse>(`/api/v1/admin/apps/${app.id}/rotate`);
      setIssued(toIssued(res.data));
      fetchApps();
      toast({ title: 'API key rotated', description: 'Save the new key now. It will not be shown again.' });
    } catch {
      toast({ title: 'Rotate failed', variant: 'destructive' });
    }
  };

  const handleRotateSecret = async (app: App) => {
    if (app.has_client_secret && !confirm(`Issue a new consumer secret for "${app.name}"? The old secret and every access token made with it stop working immediately.`)) return;
    try {
      const res = await apiClient.post<IssuedResponse>(`/api/v1/admin/apps/${app.id}/rotate-secret`);
      setIssued(toIssued(res.data));
      fetchApps();
      toast({ title: 'Consumer secret issued', description: 'Save it now. It will not be shown again.' });
    } catch {
      toast({ title: 'Could not issue a secret', variant: 'destructive' });
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await apiClient.post(`/api/v1/admin/apps/${id}/revoke`);
      setRevokeTarget(null);
      fetchApps();
      toast({ title: 'App revoked' });
    } catch {
      toast({ title: 'Revoke failed', variant: 'destructive' });
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await apiClient.post(`/api/v1/admin/apps/${id}/suspend`);
      fetchApps();
      toast({ title: 'App suspended', description: 'Its credentials stop working until you resume it.' });
    } catch {
      toast({ title: 'Suspend failed', variant: 'destructive' });
    }
  };

  const handleResume = async (id: string) => {
    try {
      await apiClient.post(`/api/v1/admin/apps/${id}/resume`);
      fetchApps();
      toast({ title: 'App resumed' });
    } catch {
      toast({ title: 'Resume failed', variant: 'destructive' });
    }
  };

  const handlePromote = async (app: App) => {
    if (!confirm(`Promote "${app.name}" to production? This unlocks live API access and cannot be undone.`)) return;
    try {
      await apiClient.post(`/api/v1/admin/apps/${app.id}/promote`);
      fetchApps();
      toast({ title: 'App promoted to production' });
    } catch {
      toast({ title: 'Promote failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (app: App) => {
    try {
      await apiClient.delete(`/api/v1/admin/apps/${app.id}`);
      setRevokeTarget(null);
      fetchApps();
      toast({ title: 'App deleted' });
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  // Only a platform admin promotes an app; a developer files a go-live request for review.
  const handleRequestGoLive = async (app: App) => {
    if (!user?.email) return;
    try {
      await apiClient.post('/api/v1/integration-requests', {
        request_type: 'app_production_access',
        requester_name: user.name || user.email,
        requester_email: user.email,
        integration_mode: 'self_serve',
        notes: `Requesting production promotion for app "${app.name}" (id: ${app.id}).`,
      });
      setGoLiveRequested((prev) => new Set(prev).add(app.id));
    } catch {
      toast({ title: 'Request failed', variant: 'destructive' });
    }
  };

  const copyValue = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const columns = useMemo(
    () => buildAppColumns({
      isPlatformOwner,
      goLiveRequested,
      revokeTarget,
      tokenBalances,
      showUsageBalance,
      onSetRevokeTarget: setRevokeTarget,
      onRotate: handleRotate,
      onRotateSecret: handleRotateSecret,
      onRevoke: handleRevoke,
      onSuspend: handleSuspend,
      onResume: handleResume,
      onDelete: handleDelete,
      onPromote: handlePromote,
      onRequestGoLive: handleRequestGoLive,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPlatformOwner, goLiveRequested, revokeTarget, tokenBalances, showUsageBalance],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Apps</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isPlatformOwner
              ? 'Credentials for platform services and partner integrations.'
              : developerOnly
                ? 'One app per integration. Each gets its own consumer key and secret and starts in the sandbox.'
                : 'Credentials for your integrations.'}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 shrink-0">
          <Plus className="h-5 w-5 mr-2" /> New App
        </Button>
      </header>

      {issued && (
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">Save these credentials now. Secrets are not shown again.</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Store them in a secret manager or your server&apos;s environment, never in browser code or a public repo.</p>
            </div>
          </div>
          <div className="space-y-3">
            {credentialRows(issued).map((row) => (
              <div key={row.field}>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300 mb-1">{row.label}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-mono break-all border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-200">{row.value}</code>
                  <Button variant="outline" size="icon" aria-label={`Copy ${row.label}`} className="h-11 w-11 rounded-xl border-amber-300 shrink-0" onClick={() => copyValue(row.field, row.value)}>
                    {copiedField === row.field ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {issued.clientSecret && (
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-4">
              Get a 15 minute access token with <code className="font-mono">POST /api/v1/token</code>, sending <code className="font-mono">grant_type=client_credentials</code> and the consumer key and secret as HTTP Basic auth. Then call the API with <code className="font-mono">Authorization: Bearer &lt;access_token&gt;</code>.
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIssued(null)} className="mt-3 text-amber-600 dark:text-amber-400">I&apos;ve saved them</Button>
        </motion.div>
      )}

      {showCreate && (
        <CreateAppForm isPlatformOwner={isPlatformOwner} developerOnly={developerOnly} creating={creating} onCreate={handleCreate} onCancel={() => setShowCreate(false)} />
      )}

      <DataTable<App>
        columns={columns}
        rows={apps}
        rowKey={(a) => a.id}
        loading={loading}
        error={false}
        onRetry={fetchApps}
        emptyText={developerOnly ? 'No apps yet. Create one to get a sandbox consumer key.' : 'No apps yet.'}
        storageKey="developer-apps-col-prefs"
      />
    </div>
  );
}
