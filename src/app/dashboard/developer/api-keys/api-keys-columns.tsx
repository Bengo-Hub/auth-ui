'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import { Button } from '@/components/ui/button';
import { Check, Copy, Trash2 } from 'lucide-react';

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  service?: string;
  scopes?: string[];
  status: string;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

export interface APIKeyColumnCallbacks {
  copiedId: string | null;
  revokeTarget: string | null;
  isRevoking: boolean;
  onCopy: (text: string, id: string) => void;
  onSetRevokeTarget: (id: string | null) => void;
  onRevoke: (id: string) => void;
}

export function buildAPIKeyColumns(cb: APIKeyColumnCallbacks): DataTableColumn<APIKey>[] {
  return [
    {
      key: 'name',
      header: 'Key',
      primary: true,
      sortable: true,
      filterable: true,
      accessor: (k) => k.name,
      render: (k) => (
        <div className="min-w-0">
          <div className="font-bold truncate">{k.name}</div>
          <code className="font-mono text-xs text-muted-foreground">{k.key_prefix}...</code>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      accessor: (k) => k.status,
      render: (k) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          k.status === 'active'
            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }`}>
          {k.status}
        </span>
      ),
    },
    {
      key: 'scopes',
      header: 'Scopes',
      hideBelow: 'md',
      accessor: (k) => (k.scopes ?? []).join(', '),
      render: (k) => (
        <div className="flex gap-1 flex-wrap max-w-xs">
          {(k.scopes ?? []).slice(0, 3).map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">{s}</span>
          ))}
          {(k.scopes ?? []).length > 3 && <span className="text-[11px] text-muted-foreground">+{(k.scopes ?? []).length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      hideBelow: 'lg',
      sortable: true,
      accessor: (k) => k.created_at,
      cellClassName: 'text-muted-foreground whitespace-nowrap',
      render: (k) => formatDate(k.created_at),
    },
    {
      key: 'last_used_at',
      header: 'Last Used',
      hideBelow: 'lg',
      accessor: (k) => k.last_used_at ?? '',
      cellClassName: 'text-muted-foreground whitespace-nowrap',
      render: (k) => (k.last_used_at ? formatRelativeDate(k.last_used_at) : '—'),
    },
    {
      key: 'expires_at',
      header: 'Expires',
      hideBelow: 'xl',
      accessor: (k) => k.expires_at ?? '',
      render: (k) => k.expires_at
        ? <span className={new Date(k.expires_at) < new Date() ? 'text-rose-500 dark:text-rose-400 font-medium' : 'text-muted-foreground'}>{formatDate(k.expires_at)}</span>
        : <span className="text-muted-foreground">Never</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      exportable: false,
      mobileAction: true,
      render: (k) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => cb.onCopy(k.key_prefix, k.id)}>
            {cb.copiedId === k.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          {k.status === 'active' && (
            cb.revokeTarget === k.id ? (
              <div className="flex items-center gap-1">
                <Button variant="destructive" size="sm" className="rounded-xl text-xs font-bold" disabled={cb.isRevoking} onClick={() => cb.onRevoke(k.id)}>Confirm</Button>
                <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => cb.onSetRevokeTarget(null)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl" onClick={() => cb.onSetRevokeTarget(k.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )
          )}
        </div>
      ),
    },
  ];
}
