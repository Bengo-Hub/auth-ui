'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, ScrollText, Search } from 'lucide-react';
import { useAuditLogs, type AuditLogItem } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function AuditRow({ log }: { log: AuditLogItem }) {
  const [open, setOpen] = useState(false);
  const hasContext = log.context && Object.keys(log.context).length > 0;
  return (
    <>
      <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
          {new Date(log.occurred_at).toLocaleString()}
        </td>
        <td className="px-4 py-3">
          <span className="font-mono text-xs">{log.action}</span>
        </td>
        <td className="px-4 py-3 text-sm">
          {log.resource_type || '—'}
          {log.resource_id ? <span className="text-muted-foreground"> · {log.resource_id}</span> : null}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
          {(log.context?.actor_email as string) || log.user_id || '—'}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{log.ip_address || '—'}</td>
        <td className="px-4 py-3 text-right">
          {hasContext && (
            <button className="text-xs text-primary hover:underline" onClick={() => setOpen((v) => !v)}>
              {open ? 'Hide' : 'Details'}
            </button>
          )}
        </td>
      </tr>
      {open && hasContext && (
        <tr className="bg-muted/20">
          <td colSpan={6} className="px-4 py-3">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(log.context, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const limit = 50;

  // Convert datetime-local to RFC3339 (best-effort).
  const toRFC = (v: string) => (v ? new Date(v).toISOString() : '');

  const { data, isLoading, refetch } = useAuditLogs({
    page,
    limit,
    entity_type: entityType || undefined,
    action: action || undefined,
    actor: actor || undefined,
    from: toRFC(from) || undefined,
    to: toRFC(to) || undefined,
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScrollText className="h-6 w-6" /> Audit Log
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Security and administrative events. Filter by entity type, action, actor, or date range.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Entity type</label>
          <Input value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} placeholder="role / password_policy …" className="w-44" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Action contains</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} placeholder="auth.role…" className="w-44 pl-8" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Actor user ID</label>
          <Input value={actor} onChange={(e) => { setActor(e.target.value); setPage(1); }} placeholder="uuid" className="w-56" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">From</label>
          <Input type="datetime-local" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-52" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">To</label>
          <Input type="datetime-local" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-52" />
        </div>
        <span className="text-sm text-muted-foreground ml-auto">{total} event{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No audit events found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Entity</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <AuditRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
