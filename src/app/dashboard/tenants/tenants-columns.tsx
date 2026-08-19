'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import type { Tenant } from '@/hooks/use-dashboard-api';
import { TenantMembersDialog } from '@/components/tenant/tenant-members-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowRight,
  Building2,
  Edit,
  Link as LinkIcon,
  Loader2,
  MoreVertical,
  Settings,
  Trash2,
} from 'lucide-react';

const USE_CASE_LABELS: Record<string, string> = {
  ordering: 'Food Ordering',
  pos: 'Point of Sale',
  weighbridge: 'Weighbridge / TruLoad',
  isp: 'ISP Billing',
  erp: 'ERP',
  other: 'Other',
};

const STATUS_CLS: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  suspended: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export interface TenantColumnCallbacks {
  onSwitch: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onProvisionRedirects: (tenant: Tenant) => void;
  /** useProvisionTenantOAuthRedirects() is a single shared mutation (not per-row),
   * so — matching the pre-conversion behavior exactly — every row's menu item
   * disables/spins together while any provision-redirects call is in flight. */
  provisionPending: boolean;
}

export function buildTenantColumns(cb: TenantColumnCallbacks): DataTableColumn<Tenant>[] {
  return [
    {
      key: 'organization',
      header: 'Organization',
      primary: true,
      sortable: true,
      filterable: true,
      accessor: (t) => t.name,
      render: (t) => (
        <div className="min-w-0">
          <div className="font-bold flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            {t.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            <span className="text-muted-foreground font-mono">{t.id.slice(0, 8)}...</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-primary font-semibold">{t.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      hideBelow: 'sm',
      sortable: true,
      filterable: true,
      accessor: (t) => t.status,
      render: (t) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_CLS[t.status] ?? 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
          {t.status}
        </span>
      ),
    },
    {
      key: 'use_case',
      header: 'Use Case',
      hideBelow: 'md',
      filterable: true,
      accessor: (t) => t.use_case ?? '',
      render: (t) => (t.use_case ? (USE_CASE_LABELS[t.use_case] ?? t.use_case) : <span className="text-muted-foreground">—</span>),
    },
    {
      key: 'contact_email',
      header: 'Contact',
      hideBelow: 'lg',
      accessor: (t) => t.contact_email ?? '',
      cellClassName: 'text-sm text-muted-foreground',
      render: (t) => t.contact_email || <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      hideBelow: 'lg',
      sortable: true,
      accessor: (t) => t.created_at,
      cellClassName: 'text-sm text-muted-foreground whitespace-nowrap',
      render: (t) => formatDate(t.created_at),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      exportable: false,
      mobileAction: true,
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <TenantMembersDialog tenantId={t.id} tenantName={t.name} />
          <Button variant="outline" size="sm" className="rounded-xl font-bold">
            <Settings className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
            Dashboard
          </Button>
          <Button size="sm" onClick={() => cb.onSwitch(t)} className="rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold">
            Switch <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl">
              <DropdownMenuItem onClick={() => cb.onEdit(t)} className="rounded-xl p-3 cursor-pointer">
                <Edit className="h-4 w-4 mr-2" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => cb.onProvisionRedirects(t)}
                disabled={cb.provisionPending}
                className="rounded-xl p-3 cursor-pointer"
              >
                {cb.provisionPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4 mr-2" />
                )}
                Provision OAuth Redirects
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => cb.onDelete(t)} className="rounded-xl p-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
