'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Search,
  Users,
  RefreshCw,
  UserPlus,
  Building2,
  X,
} from 'lucide-react';
import { useAdminUsers, useTenants } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import { buildUserColumns } from './users-columns';
import { CreateUserDialog, SSO_ROLES } from './user-dialogs';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const limit = 50;

  const { data: tenants = [] } = useTenants();
  const tenantName = useCallback(
    (id: string) => tenants.find((t) => t.id === id)?.name ?? id,
    [tenants],
  );

  const { data, isLoading, isError, refetch } = useAdminUsers({
    search: search || undefined,
    status: status || undefined,
    tenant_id: tenantId || undefined,
    role: role || undefined,
    page,
    limit,
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination;
  const hasFilters = !!(search || status || tenantId || role);

  const clearFilters = () => {
    setSearch(''); setStatus(''); setTenantId(''); setRole(''); setPage(1);
  };

  const columns = useMemo(() => buildUserColumns({ tenantName }), [tenantName]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" /> User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all platform users — edit, suspend, deactivate, or delete accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Create User
          </Button>
        </div>
      </div>

      {creating && <CreateUserDialog onClose={() => setCreating(false)} />}

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyText="No users found"
        storageKey="platform-users-col-prefs"
        page={page}
        totalPages={pagination?.pages}
        onPageChange={setPage}
        total={pagination?.total}
        toolbar={
          <>
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                className="pl-8"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="relative min-w-[200px]">
              <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={tenantId || 'all'}
                onChange={(e) => { setTenantId(e.target.value === 'all' ? '' : e.target.value); setPage(1); }}
                className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-1 text-sm"
              >
                <option value="all">All organizations</option>
                {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <select
              value={role || 'all'}
              onChange={(e) => { setRole(e.target.value === 'all' ? '' : e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm w-40 capitalize"
            >
              <option value="all">All roles</option>
              {SSO_ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
            <select
              value={status || 'all'}
              onChange={(e) => { setStatus(e.target.value === 'all' ? '' : e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm w-40"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
              <option value="deleted">Deleted</option>
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </>
        }
      />
    </div>
  );
}
