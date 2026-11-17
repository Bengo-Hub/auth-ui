'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import { Button } from '@/components/ui/button';
import { Coins, KeyRound, Pause, Play, RefreshCw, ShieldOff, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate as formatInUserZone } from '@/lib/user-timezone';
import { graceRemaining } from '@/lib/credential-rotation';

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
  /** True once a consumer secret exists for the client_credentials grant. */
  has_client_secret?: boolean;
  client_secret_rotated_at?: string;
  /** Set while a secret or key replaced by a rotation still works; the time it stops. */
  previous_client_secret_expires_at?: string;
  previous_key_expires_at?: string;
  previous_key_prefix?: string;
}

export const INTERNAL_SERVICE_KEY_SCOPE = 'internal_service_key';

// Scope prefix to token wallet service_tag. Keep in step with subscriptions-api's
// scopePrefixToServiceTag (consumers/app_promotion.go).
const SCOPE_PREFIX_TO_SERVICE_TAG: Record<string, string> = { etims: 'etims_api' };

/** The token wallet service_tag this app draws from, or null when its scopes are not metered. */
export function appTokenServiceTag(a: Pick<App, 'scopes'>): string | null {
  for (const s of a.scopes ?? []) {
    const prefix = s.split(':')[0];
    if (SCOPE_PREFIX_TO_SERVICE_TAG[prefix]) return SCOPE_PREFIX_TO_SERVICE_TAG[prefix];
  }
  return null;
}

const SUBSCRIPTIONS_UI_URL = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL || 'https://pricing.codevertexafrica.com';

function formatDate(d: string) {
  return formatInUserZone(d, undefined, { locale: 'en-US', year: 'numeric', month: 'short', day: 'numeric' });
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
  /** app.id -> current token balance, for Apps scoped to a metered external API. Undefined
   * while still loading; absent entirely for Apps with no matching scope. */
  tokenBalances: Record<string, number | undefined>;
  /** True when at least one listed app has a metered scope; otherwise the column is left out. */
  showUsageBalance: boolean;
  onSetRevokeTarget: (id: string | null) => void;
  onRotate: (app: App) => void;
  /** Issues (or re-issues) the consumer secret for the client_credentials grant. */
  onRotateSecret: (app: App) => void;
  onRevoke: (id: string) => void;
  onSuspend: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (app: App) => void;
  onPromote: (app: App) => void;
  onRequestGoLive: (app: App) => void;
}

/** Columns for both views. Role differences (delete or revoke, promote or request go-live,
 * suspend and resume) live in the actions column. */
export function buildAppColumns(cb: AppColumnCallbacks): DataTableColumn<App>[] {
  const columns: DataTableColumn<App>[] = [
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
            <span className="text-xs text-muted-foreground">Key <code className="font-mono">{a.key_prefix}…</code></span>
            {a.scopes?.includes(INTERNAL_SERVICE_KEY_SCOPE) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400">
                <KeyRound className="h-2.5 w-2.5" /> Fleet Key
              </span>
            )}
          </div>
          {graceRemaining(a.previous_key_expires_at) && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              Old key{a.previous_key_prefix ? <> <code className="font-mono">{a.previous_key_prefix}…</code></> : null} stops working {graceRemaining(a.previous_key_expires_at)}
            </div>
          )}
          {graceRemaining(a.previous_client_secret_expires_at) && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
              Old consumer secret stops working {graceRemaining(a.previous_client_secret_expires_at)}
            </div>
          )}
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
            {a.app_type === 'tenant' && (
              <Button
                variant="outline"
                size="sm"
                title={a.has_client_secret ? 'Issue a new consumer secret; you choose whether the old one keeps working for 24 hours' : 'Generate a consumer secret for OAuth client credentials'}
                className="rounded-xl text-xs font-bold"
                onClick={() => cb.onRotateSecret(a)}
              >
                <KeyRound className="h-3.5 w-3.5 mr-1" />
                {a.has_client_secret ? 'New secret' : 'Generate consumer secret'}
              </Button>
            )}
            <Button variant="ghost" size="icon" title="Rotate API key" className="rounded-xl" onClick={() => cb.onRotate(a)}>
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
  if (!cb.showUsageBalance) return columns;
  // The prepaid balance of metered APIs (eTIMS) sits after Scopes, only when some app is metered.
  const at = columns.findIndex((c) => c.key === 'scopes') + 1;
  columns.splice(at, 0, usageColumn(cb));
  return columns;
}

function usageColumn(cb: AppColumnCallbacks): DataTableColumn<App> {
  return {
    key: 'usage_balance',
    header: 'Usage balance',
    hideBelow: 'md',
    align: 'right',
    render: (a) => {
      if (!appTokenServiceTag(a)) return <span className="text-xs text-muted-foreground">Not metered</span>;
      const balance = cb.tokenBalances[a.id];
      return (
        <div className="flex items-center justify-end gap-2">
          {balance === undefined ? (
            <span className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse inline-block" aria-label="Loading balance" />
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
              <Coins className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              {balance.toLocaleString('en-KE')} tokens
            </span>
          )}
          <Link href={`${SUBSCRIPTIONS_UI_URL}/usage`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline">
            Top up
          </Link>
        </div>
      );
    },
  };
}
