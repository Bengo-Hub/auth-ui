'use client';

import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import type { Role } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { KeySquare, Lock, Pencil, Trash2, Users } from 'lucide-react';
import Link from 'next/link';

function ScopeBadge({ scope }: { scope?: string }) {
  if (!scope) return <span className="text-muted-foreground">—</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{scope}</span>;
}

export interface RoleColumnCallbacks {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function buildRoleColumns(cb: RoleColumnCallbacks): DataTableColumn<Role>[] {
  return [
    {
      key: 'name',
      header: 'Role',
      primary: true,
      sortable: true,
      filterable: true,
      accessor: (r) => r.name,
      render: (r) => (
        <div>
          <Link href={`/dashboard/platform/roles/${r.role_code}`} className="font-medium text-sm hover:underline flex items-center gap-2">
            {r.is_wildcard && <Lock className="h-3.5 w-3.5 text-amber-600" />}
            {r.name}
          </Link>
          <div className="text-xs text-muted-foreground font-mono">{r.role_code}</div>
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      hideBelow: 'sm',
      filterable: true,
      accessor: (r) => r.scope ?? '',
      render: (r) => <ScopeBadge scope={r.scope} />,
    },
    {
      key: 'type',
      header: 'Type',
      hideBelow: 'md',
      filterable: true,
      accessor: (r) => (r.is_system ? 'System' : 'Custom'),
      render: (r) =>
        r.is_system ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">System</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Custom</span>
        ),
    },
    {
      key: 'permission_count',
      header: 'Permissions',
      hideBelow: 'lg',
      sortable: true,
      accessor: (r) => (r.is_wildcard ? Number.MAX_SAFE_INTEGER : r.permission_count),
      cellClassName: 'text-sm text-muted-foreground',
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <KeySquare className="h-3.5 w-3.5" />
          {r.is_wildcard ? 'All' : r.permission_count}
        </span>
      ),
    },
    {
      key: 'member_count',
      header: 'Members',
      hideBelow: 'lg',
      sortable: true,
      accessor: (r) => r.member_count,
      cellClassName: 'text-sm text-muted-foreground',
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {r.member_count}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      exportable: false,
      mobileAction: true,
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/dashboard/platform/roles/${r.role_code}`}>
            <Button variant="ghost" size="sm">Permissions</Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={r.is_system} onClick={() => cb.onEdit(r)} title={r.is_system ? 'System role — read-only' : 'Edit'}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" disabled={r.is_system} onClick={() => cb.onDelete(r)} title={r.is_system ? 'System role — cannot delete' : 'Delete'}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
