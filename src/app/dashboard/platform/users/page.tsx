'use client';

import { useState } from 'react';
import {
  Search,
  Users,
  MoreVertical,
  ShieldOff,
  ShieldCheck,
  UserX,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useAdminUsers,
  useAdminUserAction,
  useUpdateAdminUser,
  useDeleteAdminUser,
  type PlatformUser,
} from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  deactivated: 'bg-gray-100 text-gray-600',
  deleted: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function EditUserDialog({
  user,
  onClose,
}: {
  user: PlatformUser;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const update = useUpdateAdminUser();
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    if (!email || email === user.email) { onClose(); return; }
    update.mutate(
      { id: user.id, email },
      {
        onSuccess: () => {
          toast({ title: 'Updated', description: 'User email updated.' });
          onClose();
        },
        onError: () => toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' }),
      }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">User ID</Label>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{user.id}</p>
          </div>
          {user.primary_tenant_id && (
            <div>
              <Label className="text-muted-foreground text-xs">Primary Tenant</Label>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{user.primary_tenant_id}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserRow({ user }: { user: PlatformUser }) {
  const { toast } = useToast();
  const action = useAdminUserAction();
  const deleteUser = useDeleteAdminUser();
  const [editing, setEditing] = useState(false);

  const doAction = (act: 'suspend' | 'deactivate' | 'activate') => {
    action.mutate(
      { id: user.id, action: act },
      {
        onSuccess: () => toast({ title: 'Done', description: `User ${act}d.` }),
        onError: () => toast({ title: 'Error', description: `Failed to ${act} user.`, variant: 'destructive' }),
      }
    );
  };

  const doDelete = () => {
    if (!confirm(`Soft-delete ${user.email}? The account will be marked as deleted but data is retained.`)) return;
    deleteUser.mutate(user.id, {
      onSuccess: () => toast({ title: 'Deleted', description: `${user.email} has been deleted.` }),
      onError: () => toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' }),
    });
  };

  return (
    <>
      {editing && <EditUserDialog user={user} onClose={() => setEditing(false)} />}
      <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3">
          <div className="font-medium text-sm">{user.email}</div>
          <div className="text-xs text-muted-foreground font-mono">{user.id}</div>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={user.status} />
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {user.primary_tenant_id || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {user.memberships?.length ?? 0} org{(user.memberships?.length ?? 0) !== 1 ? 's' : ''}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {new Date(user.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status !== 'active' && (
                <DropdownMenuItem onClick={() => doAction('activate')}>
                  <ShieldCheck className="h-4 w-4 mr-2 text-green-600" /> Activate
                </DropdownMenuItem>
              )}
              {user.status === 'active' && (
                <DropdownMenuItem onClick={() => doAction('suspend')}>
                  <ShieldOff className="h-4 w-4 mr-2 text-yellow-600" /> Suspend
                </DropdownMenuItem>
              )}
              {user.status !== 'deactivated' && user.status !== 'deleted' && (
                <DropdownMenuItem onClick={() => doAction('deactivate')}>
                  <UserX className="h-4 w-4 mr-2 text-gray-500" /> Deactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={doDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    </>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading, refetch } = useAdminUsers({
    search: search || undefined,
    status: status || undefined,
    page,
    limit,
  });

  const users = data?.users ?? [];
  const pagination = data?.pagination;

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
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
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
        {pagination && (
          <span className="text-sm text-muted-foreground ml-auto">
            {pagination.total} user{pagination.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No users found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Email / ID</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Primary Tenant</th>
                <th className="px-4 py-3 text-left">Orgs</th>
                <th className="px-4 py-3 text-left">Last Login</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
