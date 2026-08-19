'use client';

import { useMemo, useState } from 'react';
import { RefreshCw, ScrollText, Search } from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import { buildAuditColumns } from './audit-columns';

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

  const { data, isLoading, isError, refetch } = useAuditLogs({
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

  const columns = useMemo(() => buildAuditColumns(), []);

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

      <DataTable
        columns={columns}
        rows={logs}
        rowKey={(l) => l.id}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyText="No audit events found"
        storageKey="platform-audit-col-prefs"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
        renderExpanded={(l) =>
          l.context && Object.keys(l.context).length > 0 ? (
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(l.context, null, 2)}</pre>
          ) : (
            <span className="text-xs text-muted-foreground">No additional context.</span>
          )
        }
      />
    </div>
  );
}
