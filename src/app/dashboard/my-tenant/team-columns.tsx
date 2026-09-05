'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import type { TenantMember } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle2, KeyRound, Lock, MapPin, Trash2 } from 'lucide-react';
import type { TenantOutlet } from './shared';

// Standard global roles as seeded by auth-api. Service-specific roles (e.g. inventory_admin,
// finance_admin) are JIT-provisioned by each service and not listed here.
export const TEAM_ROLES = [
  'admin',                // Full tenant admin (all services)
  'developer',           // Developer Portal access (apps/API keys/OAuth) — no admin/billing/team access
  'manager',             // Store/operations manager
  'staff',               // General cross-service staff
  'member',              // Basic ordering/tenant member
  'viewer',              // Read-only access for auditors/observers
  'cashier',             // POS cashier / treasury cashier
  'waiter',              // POS hospitality waiter
  'barista',             // POS hospitality café barista (order + till + drink prep)
  'kitchen',             // POS kitchen display
  'bar',                 // POS bar display
  'receptionist',        // POS hotel receptionist
  'accountant',          // Finance/back-office: inventory, purchases & treasury (plan-gated)
  'rider',               // Logistics motorcycle delivery rider
  'driver',              // Logistics fleet/cargo driver
  'delivery_coordinator',// Ordering/logistics dispatch coordinator
  'technician',          // Field technician (ISP billing / IT services)
  'customer',            // B2C end-user / ordering customer / ISP subscriber
];

export interface TeamColumnCallbacks {
  outlets: TenantOutlet[];
  onStatusChange: (m: TenantMember, status: string) => void;
  onAssignOutlet: (m: TenantMember) => void;
  onSetPin: (m: TenantMember) => void;
  onResetPassword: (m: TenantMember) => void;
  onRemove: (userId: string) => void;
}

export function buildTeamColumns(cb: TeamColumnCallbacks): DataTableColumn<TenantMember>[] {
  return [
    {
      key: 'member',
      header: 'Member',
      primary: true,
      render: (m) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {(m.name ?? m.email ?? '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{m.name ?? m.email}</p>
            {m.name && m.email && <p className="text-xs text-slate-400 truncate">{m.email}</p>}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-slate-400 capitalize">{m.status}</p>
              {m.outlet_id && cb.outlets.length > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-primary/80">
                  <MapPin className="h-2.5 w-2.5" />
                  {cb.outlets.find((o) => o.id === m.outlet_id)?.name ?? 'Outlet'}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      hideBelow: 'sm',
      mobileHidden: true,
      render: (m) => (
        <div className="flex items-center gap-2 flex-wrap">
          {m.roles.slice(0, 2).map((r) => (
            <span key={r} className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      exportable: false,
      mobileAction: true,
      render: (m) => (
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {m.status === 'active' ? (
            <Button variant="outline" size="sm"
              className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              onClick={() => cb.onStatusChange(m, 'suspended')}>
              <Ban className="h-3 w-3" /> Suspend
            </Button>
          ) : (
            <Button variant="outline" size="sm"
              className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              onClick={() => cb.onStatusChange(m, 'active')}>
              <CheckCircle2 className="h-3 w-3" /> Activate
            </Button>
          )}
          {cb.outlets.length > 0 && (
            <Button variant="outline" size="sm"
              className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => cb.onAssignOutlet(m)}>
              <MapPin className="h-3 w-3" /> Outlet
            </Button>
          )}
          <Button variant="outline" size="sm"
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => cb.onSetPin(m)}>
            <KeyRound className="h-3 w-3" /> Set PIN
          </Button>
          <Button variant="outline" size="icon"
            className="h-8 w-8 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Reset password"
            onClick={() => cb.onResetPassword(m)}>
            <Lock className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon"
            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
            onClick={() => cb.onRemove(m.user_id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
