'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import type { AuditLogItem } from '@/hooks/use-dashboard-api';

export function buildAuditColumns(): DataTableColumn<AuditLogItem>[] {
  return [
    {
      key: 'occurred_at',
      header: 'When',
      sortable: true,
      accessor: (l) => l.occurred_at,
      cellClassName: 'text-muted-foreground whitespace-nowrap text-xs',
      render: (l) => new Date(l.occurred_at).toLocaleString(),
    },
    {
      key: 'action',
      header: 'Action',
      primary: true,
      filterable: true,
      accessor: (l) => l.action,
      cellClassName: 'font-mono text-xs',
    },
    {
      key: 'resource',
      header: 'Entity',
      hideBelow: 'sm',
      accessor: (l) => l.resource_type ?? '',
      render: (l) => (
        <>
          {l.resource_type || '—'}
          {l.resource_id ? <span className="text-muted-foreground"> · {l.resource_id}</span> : null}
        </>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      hideBelow: 'md',
      accessor: (l) => (l.context?.actor_email as string) || l.user_id || '',
      cellClassName: 'text-xs text-muted-foreground font-mono',
      render: (l) => (l.context?.actor_email as string) || l.user_id || '—',
    },
    {
      key: 'ip_address',
      header: 'IP',
      hideBelow: 'lg',
      accessor: (l) => l.ip_address ?? '',
      cellClassName: 'text-xs text-muted-foreground',
      render: (l) => l.ip_address || '—',
    },
  ];
}
