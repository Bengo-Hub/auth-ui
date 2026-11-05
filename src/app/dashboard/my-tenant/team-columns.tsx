'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import type { TenantMember } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { AppWindow, Ban, CheckCircle2, KeyRound, Lock, MapPin, Trash2, UserCog } from 'lucide-react';
import type { TenantOutlet } from './shared';
import { serviceLabel } from './team-dialogs';

// Standard global roles as seeded by auth-api. Service-specific roles (e.g. inventory_admin,
// finance_admin) are JIT-provisioned by each service and not listed here.
export const TEAM_ROLES = [
  'admin',                // Full tenant admin (all services)
  'manager',             // Store/operations manager
  'staff',               // General cross-service staff
  'viewer',              // Read-only access for auditors/observers
  'floor_supervisor',    // POS floor supervisor
  'cashier',             // POS cashier / treasury cashier
  'waiter',              // POS hospitality waiter
  'barista',             // POS hospitality café barista (order + till + drink prep)
  'kitchen',             // POS kitchen display
  'bar',                 // POS bar display
  'receptionist',        // POS hotel receptionist
  'accountant',          // Finance/back-office: inventory, purchases & treasury (plan-gated)
  'warehouse_manager',   // Inventory: purchases, goods received, items, stock and counts
  'stock_clerk',         // Inventory: stock movements and counts
  'rider',               // Logistics motorcycle delivery rider
  'driver',              // Logistics fleet/cargo driver
  'delivery_coordinator',// Ordering/logistics dispatch coordinator
  'technician',          // Field technician (IT and other services)
];

// Business types that run each kind of floor. Mirrors the role scoping in pos-api's
// rbac/use_case_scope.go, reading a tenant's use case the way auth-api's defaultTrialPlan groups them.
const HOSPITALITY = ['hospitality', 'hotel', 'restaurant', 'bar', 'cafe', 'food_delivery'];
const QUICK_SERVICE = ['quick_service'];
const RETAIL = ['retail', 'grocery', 'warehouse', 'warehousing', 'e_commerce', 'ecommerce', 'hardware', 'agrovet'];
const SERVICES = ['services'];

const ROLE_USE_CASES: Record<string, string[]> = {
  floor_supervisor: HOSPITALITY,
  waiter: HOSPITALITY,
  bar: HOSPITALITY,
  kitchen: [...HOSPITALITY, ...QUICK_SERVICE],
  barista: [...HOSPITALITY, ...QUICK_SERVICE],
  receptionist: [...HOSPITALITY, ...RETAIL, ...SERVICES],
  technician: SERVICES,
};

// The service a role works in; it is offered only when the plan includes that service.
const ROLE_SERVICES: Record<string, string> = {
  warehouse_manager: 'inventory',
  stock_clerk: 'inventory',
  accountant: 'treasury',
  rider: 'logistics',
  driver: 'logistics',
  delivery_coordinator: 'logistics',
};

/**
 * The roles this organisation's admin can hand out: those for its kind of business and its plan.
 * An unknown use case or plan (still loading, or a plan with no limits) leaves that check off, so a
 * failed lookup never empties the list. Roles a member already holds stay listed in the dialog.
 */
export function assignableRoles(useCase: string | undefined, entitledTags: string[] | undefined): string[] {
  const uc = (useCase ?? '').toLowerCase();
  // A use case outside these groups ('pos', say) says nothing about the floor, so it filters nothing.
  const scoped = [...HOSPITALITY, ...QUICK_SERVICE, ...RETAIL, ...SERVICES].includes(uc);
  return TEAM_ROLES.filter((role) => {
    const useCases = ROLE_USE_CASES[role];
    if (scoped && useCases && !useCases.includes(uc)) return false;
    const service = ROLE_SERVICES[role];
    if (entitledTags && service && !entitledTags.includes(service)) return false;
    return true;
  });
}

export interface TeamColumnCallbacks {
  outlets: TenantOutlet[];
  onStatusChange: (m: TenantMember, status: string) => void;
  onAssignOutlet: (m: TenantMember) => void;
  onSetPin: (m: TenantMember) => void;
  onRoles: (m: TenantMember) => void;
  onServices: (m: TenantMember) => void;
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
          {m.roles.map((r) => (
            <span key={r} className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
              {r.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'services',
      header: 'Services',
      hideBelow: 'md',
      mobileHidden: true,
      render: (m) =>
        m.effective_services ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {m.effective_services.length === 0 ? (
              <span className="text-xs text-slate-400">None</span>
            ) : (
              m.effective_services.map((s) => (
                <span key={s} className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {serviceLabel(s)}
                </span>
              ))
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">-</span>
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
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => cb.onRoles(m)}>
            <UserCog className="h-3 w-3" /> Roles
          </Button>
          <Button variant="outline" size="sm"
            className="h-8 px-3 rounded-xl text-xs font-bold gap-1.5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => cb.onServices(m)}>
            <AppWindow className="h-3 w-3" /> Services
          </Button>
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
