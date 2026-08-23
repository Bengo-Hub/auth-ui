'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import type { ResellerApplication } from '@/hooks/use-dashboard-api';
import { Handshake } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Submitted',
  kyb_pending: 'KYB in review',
  kyb_approved: 'KYB approved',
  agreement_pending: 'Awaiting agreement',
  approved: 'Approved',
  rejected: 'Declined',
};

const STATUS_CLS: Record<string, string> = {
  pending: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
  kyb_pending: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  kyb_approved: 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400',
  agreement_pending: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
  approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  rejected: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
};

const TIER_LABELS: Record<string, string> = {
  registered: 'Registered Partner',
  certified: 'Certified Partner',
  premier: 'Premier Partner',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function buildResellerApplicationColumns(): DataTableColumn<ResellerApplication>[] {
  return [
    {
      key: 'business_name',
      header: 'Business',
      primary: true,
      sortable: true,
      filterable: true,
      accessor: (a) => a.business_name,
      render: (a) => (
        <div className="min-w-0">
          <div className="font-bold flex items-center gap-2 truncate">
            <Handshake className="h-4 w-4 text-slate-400 shrink-0" />
            {a.business_name}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">{a.contact_email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Stage',
      sortable: true,
      filterable: true,
      accessor: (a) => a.status,
      render: (a) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${STATUS_CLS[a.status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          {STATUS_LABELS[a.status] ?? a.status}
        </span>
      ),
    },
    {
      key: 'requested_tier',
      header: 'Tier requested',
      hideBelow: 'md',
      filterable: true,
      accessor: (a) => a.requested_tier,
      render: (a) => TIER_LABELS[a.requested_tier] ?? a.requested_tier,
    },
    {
      key: 'country',
      header: 'Country',
      hideBelow: 'lg',
      accessor: (a) => a.country ?? '',
      render: (a) => a.country || <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'created_at',
      header: 'Submitted',
      hideBelow: 'lg',
      sortable: true,
      accessor: (a) => a.created_at,
      cellClassName: 'text-sm text-muted-foreground whitespace-nowrap',
      render: (a) => formatDate(a.created_at),
    },
  ];
}
