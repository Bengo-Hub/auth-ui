'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import { Button } from '@/components/ui/button';
import { KeyRound, Pause, Play, RefreshCw, ShieldOff, Trash2 } from 'lucide-react';

export interface App {
  id: string;
  name: string;
  description?: string;
  app_type: string;
  environment: string;
  client_id: string;
  key_prefix: string;
  tenant_id?: string;
  scopes?: string[];
  allowed_ips?: string[];
  status: string;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

export const INTERNAL_SERVICE_KEY_SCOPE = 'internal_service_key';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_CLS: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  suspended: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  revoked: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
};

export interface AppColumnCallbacks {
  isPlatformOwner: boolean;
  goLiveRequested: Set<string>;
  revokeTarget: string | null;
  onSetRevokeTarget: (id: string | null) => void;
  onRotate: (app: App) => void;
  onRevoke: (id: string) => void;
  onSuspend: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (app: App) => void;
  onPromote: (app: App) => void;
  onRequestGoLive: (app: App) => void;
}

/** Shared by both the tenant and platform-owner views of /dashboard/developer/apps —
 * role differences (hard delete vs soft revoke, unconditional vs go-live-request-gated
 * promote, suspend/resume) are handled entirely inside the actions renderer, per row,
 * rather than two separate column-def files, since every other column is identical. */
export function buildAppColumns(cb: AppColumnCallbacks): DataTableColumn<App>[] {
  return [
    {
      key: 'name',
      header: 'App',
      primary: true,
      sortable: true,
      filterable: true,
      accessor: (a) => a.name,
      render: (a) => (
        <div className="min-w-0">
          <div className="font-bold truncate">{a.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="font-mono text-xs text-muted-foreground">{a.key_prefix}...</code>
            {a.scopes?.includes(INTERNAL_SERVICE_KEY_SCOPE) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400">
                <KeyRound className="h-2.5 w-2.5" /> Fleet Key
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      accessor: (a) => a.status,
      render: (a) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLS[a.status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          {a.status}
        </span>
      ),
    },
    {
      key: 'environment',
      header: 'Environment',
      hideBelow: 'sm',
      filterable: true,
      accessor: (a) => a.environment,
      render: (a) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          a.environment === 'production'
            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
        }`}>
          {a.environment === 'production' ? 'Production' : 'Sandbox'}
        </span>
      ),
    },
    {
      key: 'scopes',
      header: 'Scopes',
      hideBelow: 'md',
      accessor: (a) => (a.scopes ?? []).join(', '),
      render: (a) => (
        <div className="flex gap-1 flex-wrap max-w-xs">
          {(a.scopes ?? []).slice(0, 3).map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">{s}</span>
          ))}
          {(a.scopes ?? []).length > 3 && <span className="text-[11px] text-muted-foreground">+{(a.scopes ?? []).length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      hideBelow: 'lg',
      sortable: true,
      accessor: (a) => a.created_at,
      cellClassName: 'text-muted-foreground whitespace-nowrap',
      render: (a) => formatDate(a.created_at),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      exportable: false,
      mobileAction: true,
      render: (a) => {
        if (a.status === 'suspended') {
          return (
            <Button variant="outline" size="sm" className="rounded-xl border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs" onClick={() => cb.onResume(a.id)}>
              <Play className="h-3.5 w-3.5 mr-1.5" /> Resume
            </Button>
          );
        }
        if (a.status !== 'active') return null;

        const canPromote = a.environment !== 'production';
        return (
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            {canPromote && (
              cb.isPlatformOwner ? (
                <Button variant="outline" size="sm" onClick={() => cb.onPromote(a)} className="rounded-xl border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  Promote
                </Button>
              ) : cb.goLiveRequested.has(a.id) ? (
                <span className="text-xs font-bold text-muted-foreground">Go-live requested</span>
              ) : (
                <Button variant="outline" size="sm" onClick={() => cb.onRequestGoLive(a)} className="rounded-xl border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  Request go-live
                </Button>
              )
            )}
            <Button variant="ghost" size="icon" title="Rotate token" className="rounded-xl" onClick={() => cb.onRotate(a)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {cb.isPlatformOwner && (
              <Button variant="ghost" size="icon" title="Suspend" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl" onClick={() => cb.onSuspend(a.id)}>
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {cb.revokeTarget === a.id ? (
              <div className="flex items-center gap-1">
                <Button variant="destructive" size="sm" className="rounded-xl text-xs font-bold" onClick={() => (cb.isPlatformOwner ? cb.onDelete(a) : cb.onRevoke(a.id))}>Confirm</Button>
                <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => cb.onSetRevokeTarget(null)}>Cancel</Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                title={cb.isPlatformOwner ? 'Delete' : 'Revoke'}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                onClick={() => cb.onSetRevokeTarget(a.id)}
              >
                {cb.isPlatformOwner ? <Trash2 className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
