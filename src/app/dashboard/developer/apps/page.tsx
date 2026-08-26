'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, ClipboardCopy, Plus } from 'lucide-react';
import { appTokenServiceTag, buildAppColumns, type App } from './apps-columns';
import { CreateAppForm, type CreateAppPayload } from './create-app-form';

/**
 * Unified Apps page (Phase 11) — replaces the two near-duplicate
 * implementations that used to live at /dashboard/developer (tenant-scoped,
 * app_type==='tenant' only) and /dashboard/platform/apps (platform-scoped,
 * all app_types, suspend/resume, hard delete). Same GET /api/v1/admin/apps
 * endpoint, same client-side filter for non-platform-owners preserving
 * exactly what each role could already do — now on one DataTable instead of
 * two hand-rolled card lists.
 */
export default function AppsPage() {
  const { user, isPlatformOwner } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
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

  // Token wallet balances, for Apps scoped to a metered external API (e.g. etims:*). Fetched
  // separately from the App list itself, since auth-api has no notion of subscriptions-api's
  // wallet — one request per (tenant, service_tag) pair actually present among loaded apps.
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
        // leave undefined — the column shows a placeholder, not an error, since a missing
        // balance for one app must never block the rest of the table from rendering
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps]);

  const handleCreate = async (payload: CreateAppPayload) => {
    setCreating(true);
    try {
      const res = await apiClient.post<{ token: string }>('/api/v1/admin/apps', payload);
      setNewToken(res.data.token);
      setShowCreate(false);
      fetchApps();
      toast({ title: 'App created', description: 'Save the token — it will not be shown again.' });
    } catch {
      toast({ title: 'Create failed', description: 'Could not create app.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleRotate = async (app: App) => {
    if (!confirm(`Rotate token for "${app.name}"? The current token will stop working immediately.`)) return;
    try {
      const res = await apiClient.post<{ token: string }>(`/api/v1/admin/apps/${app.id}/rotate`);
      setNewToken(res.data.token);
      fetchApps();
      toast({ title: 'Token rotated', description: 'Save the new token — it will not be shown again.' });
    } catch {
      toast({ title: 'Rotate failed', variant: 'destructive' });
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
      toast({ title: 'App suspended', description: 'Its token is paused — resume it to reactivate.' });
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

  // Tenant admins can't self-promote (see AppHandler.PromoteToProduction) — this reuses
  // the same integration-request workflow already built for eTIMS go-live.
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

  const copyToken = () => {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const columns = useMemo(
    () => buildAppColumns({
      isPlatformOwner,
      goLiveRequested,
      revokeTarget,
      tokenBalances,
      onSetRevokeTarget: setRevokeTarget,
      onRotate: handleRotate,
      onRevoke: handleRevoke,
      onSuspend: handleSuspend,
      onResume: handleResume,
      onDelete: handleDelete,
      onPromote: handlePromote,
      onRequestGoLive: handleRequestGoLive,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPlatformOwner, goLiveRequested, revokeTarget, tokenBalances],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">Apps</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isPlatformOwner ? 'GitHub-style service-to-service app tokens for platform integrations.' : 'App tokens for your own integrations.'}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 shrink-0">
          <Plus className="h-5 w-5 mr-2" /> New App
        </Button>
      </header>

      {newToken && (
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">Save this token now — it won&apos;t be shown again</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Copy it and store it securely (e.g. K8s secret, vault).</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-xl text-sm font-mono break-all border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-200">{newToken}</code>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-amber-300 shrink-0" onClick={copyToken}>
              {tokenCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setNewToken(null)} className="mt-3 text-amber-600 dark:text-amber-400">I&apos;ve saved the token</Button>
        </motion.div>
      )}

      {showCreate && (
        <CreateAppForm isPlatformOwner={isPlatformOwner} creating={creating} onCreate={handleCreate} onCancel={() => setShowCreate(false)} />
      )}

      <DataTable<App>
        columns={columns}
        rows={apps}
        rowKey={(a) => a.id}
        loading={loading}
        error={false}
        onRetry={fetchApps}
        emptyText="No apps yet."
        storageKey="developer-apps-col-prefs"
      />
    </div>
  );
}
