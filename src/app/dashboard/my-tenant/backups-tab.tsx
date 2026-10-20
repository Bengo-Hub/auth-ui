'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, DatabaseBackup, Download, Loader2, MinusCircle } from 'lucide-react';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ── Backups ───────────────────────────────────────────────────────────────────
// A tenant backup collects this organization's data from the services its plan covers into one
// archive (one gzipped JSON Lines file per service). The organization picks which of those
// services to include. Backups run on demand; only the newest is kept, and the platform's own
// daily database backup covers disaster recovery.

type ResultStatus = 'ok' | 'empty' | 'not_in_plan' | 'unavailable' | 'failed';

type ServiceResult = { service: string; status: ResultStatus; bytes?: number; rows?: number; error?: string };

type BackupState = {
  status: 'none' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  size?: number;
  error?: string;
  can_download?: boolean;
  partial?: boolean;
  selected?: string[];
  services?: ServiceResult[];
};

type CatalogEntry = { service: string; name: string; entitled: boolean };

function formatBytes(n?: number): string {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(s?: string): string {
  return s ? new Date(s).toLocaleString() : '';
}

const resultLabel: Record<ResultStatus, string> = {
  ok: 'Included',
  empty: 'No data',
  not_in_plan: 'Not in your plan',
  unavailable: 'Not available',
  failed: 'Failed',
};

export function BackupsTab({ tenantId }: { tenantId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const key = ['tenant-backup', tenantId];

  const backup = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<BackupState>(`/api/v1/admin/tenants/${tenantId}/backup`)).data,
    refetchInterval: (q) => (q.state.data?.status === 'running' ? 3000 : false),
  });

  // The services this organization's plan covers, from subscriptions via auth-api.
  const catalog = useQuery({
    queryKey: ['tenant-backup-services', tenantId],
    queryFn: async () =>
      (await api.get<{ services: CatalogEntry[] }>(`/api/v1/admin/tenants/${tenantId}/backup/services`)).data.services,
    staleTime: 60_000,
  });

  const entitled = useMemo(() => (catalog.data ?? []).filter((c) => c.entitled), [catalog.data]);
  const names = useMemo(() => new Map((catalog.data ?? []).map((c) => [c.service, c.name])), [catalog.data]);

  // Every covered service starts selected; the organization can narrow it down to one.
  const [picked, setPicked] = useState<Set<string> | null>(null);
  useEffect(() => {
    if (catalog.data && picked === null) setPicked(new Set(entitled.map((c) => c.service)));
  }, [catalog.data, entitled, picked]);
  const selected = picked ?? new Set<string>();

  const toggle = (service: string) => {
    const next = new Set(selected);
    if (next.has(service)) next.delete(service);
    else next.add(service);
    setPicked(next);
  };

  const start = useMutation({
    mutationFn: async () => {
      // An empty list means "every service in the plan", so a full selection sends none.
      const services = selected.size === entitled.length ? [] : Array.from(selected);
      return (await api.post<BackupState>(`/api/v1/admin/tenants/${tenantId}/backup`, { services })).data;
    },
    onSuccess: (data) => {
      qc.setQueryData(key, data);
      toast({ title: 'Backup started', description: 'This can take a few minutes. You can leave this page.' });
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast({ title: 'A backup is already running', description: 'Wait for it to finish.' });
        qc.invalidateQueries({ queryKey: key });
        return;
      }
      toast({
        title: 'Could not start the backup',
        description: err?.response?.data?.error_description || err?.response?.data?.message || 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  // The download link is short-lived, so it is requested when the button is pressed.
  const download = useMutation({
    mutationFn: async () =>
      (await api.get<{ download_url: string }>(`/api/v1/admin/tenants/${tenantId}/backup/download`)).data.download_url,
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: () =>
      toast({ title: 'Could not prepare the download', description: 'Try again in a moment.', variant: 'destructive' }),
  });

  const state = backup.data;
  const running = state?.status === 'running';
  const shownServices = (state?.services ?? []).filter((s) => s.status !== 'not_in_plan');

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
              <DatabaseBackup className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Data backup</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl text-sm mt-1">
                Download a copy of your organization&apos;s data from the Codevertex services your plan includes.
                Choose which services to include. Only the newest backup is kept; making a new one replaces it.
              </p>
            </div>
          </div>
          <Button
            onClick={() => start.mutate()}
            disabled={running || start.isPending || backup.isLoading || catalog.isLoading || selected.size === 0}
          >
            {running || start.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {running ? 'Backing up...' : 'Back up now'}
          </Button>
        </div>

        {catalog.isError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" /> Your services could not be loaded. Try again shortly.
          </div>
        )}

        {catalog.data && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Services to back up</h3>
              <div className="flex gap-3 text-xs">
                <button
                  type="button"
                  className="text-primary hover:underline disabled:opacity-50"
                  disabled={running}
                  onClick={() => setPicked(new Set(entitled.map((c) => c.service)))}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="text-primary hover:underline disabled:opacity-50"
                  disabled={running}
                  onClick={() => setPicked(new Set())}
                >
                  Clear
                </button>
              </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {catalog.data.map((c) => (
                <li key={c.service}>
                  <label
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 text-sm ${
                      c.entitled ? 'cursor-pointer' : 'opacity-60'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={c.entitled && selected.has(c.service)}
                        disabled={!c.entitled || running}
                        onChange={() => toggle(c.service)}
                      />
                      {c.name}
                    </span>
                    {!c.entitled && <span className="text-xs text-slate-400">Not in your plan</span>}
                  </label>
                </li>
              ))}
            </ul>
            {selected.size === 0 && <p className="text-xs text-slate-500 mt-2">Select at least one service.</p>}
          </div>
        )}

        {backup.isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        )}

        {backup.isError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" /> Backups are not available right now.
          </div>
        )}

        {state && state.status === 'none' && <p className="text-sm text-slate-500">No backup has been made yet.</p>}

        {state && state.status === 'failed' && (
          <div className="flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              The last backup failed{state.error ? `: ${state.error}` : ''}.
              {state.can_download ? ' The previous backup is still available below.' : ''}
            </span>
          </div>
        )}

        {state?.can_download && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-sm">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Latest backup
              </div>
              <div className="text-slate-500">
                {formatDate(state.completed_at)} · {formatBytes(state.size)}
              </div>
            </div>
            <Button variant="outline" onClick={() => download.mutate()} disabled={download.isPending}>
              {download.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
          </div>
        )}

        {state?.partial && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Some services could not be included. Run the backup again to retry them.
          </p>
        )}

        {shownServices.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {running ? 'Progress' : 'Services in the last backup'}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {shownServices.map((s) => (
                <li
                  key={s.service}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 text-sm"
                >
                  <span className="text-slate-800 dark:text-slate-200">{names.get(s.service) ?? s.service}</span>
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      s.status === 'ok' ? 'text-emerald-600' : s.status === 'failed' ? 'text-red-600' : 'text-slate-400'
                    }`}
                    title={s.error}
                  >
                    {s.status === 'ok' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : s.status === 'failed' ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : (
                      <MinusCircle className="h-3.5 w-3.5" />
                    )}
                    {resultLabel[s.status]}
                    {s.status === 'ok' && s.bytes ? ` · ${formatBytes(s.bytes)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-slate-400">
          The archive holds one <span className="font-mono">.jsonl.gz</span> file per service plus a manifest. Services
          with no data for your organization are left out. Passwords, keys and tokens are never included. To restore
          data, contact support.
        </p>
      </div>
    </div>
  );
}
