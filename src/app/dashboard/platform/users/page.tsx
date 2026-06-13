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
  UserPlus,
  KeyRound,
  Mail,
  Copy,
  Plus,
  X,
} from 'lucide-react';
import {
  useAdminUsers,
  useAdminUserAction,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useCreateAdminUser,
  useAdminResetPassword,
  useAdminSendResetEmail,
  useAdminSetMfaEnforcement,
  useAddUserToTenant,
  useSetUserTenantRoles,
  useRemoveUserFromTenant,
  useTenants,
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

// Global SSO roles assignable per tenant membership.
const SSO_ROLES = [
  'admin', 'manager', 'staff', 'member', 'viewer', 'cashier', 'waiter',
  'barista', 'kitchen', 'bar', 'receptionist', 'accountant', 'rider', 'driver',
  'delivery_coordinator', 'technician', 'customer',
];

function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateAdminUser();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tempPw, setTempPw] = useState<string | null>(null);

  const handleCreate = () => {
    if (!email) { toast({ title: 'Email required', variant: 'destructive' }); return; }
    create.mutate(
      { email, name: name || undefined, phone: phone || undefined },
      {
        onSuccess: (res) => {
          if (res?.temp_password) setTempPw(res.temp_password);
          else { toast({ title: 'User created' }); onClose(); }
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          toast({ title: msg ?? 'Failed to create user', variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Creates an SSO account. A welcome email with the sign-in link is sent; the user must change the temporary password on first login.</DialogDescription>
        </DialogHeader>
        {tempPw ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Account created for <strong>{email}</strong>. Share this temporary password securely — it won&apos;t be shown again.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-md bg-muted font-mono text-sm break-all">{tempPw}</code>
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard?.writeText(tempPw); toast({ title: 'Copied' }); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="user@company.com" />
              </div>
              <div>
                <Label>Full Name (optional)</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="+254 700 000 000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleCreate} disabled={create.isPending}>
                {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Create
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MembershipsSection({ user }: { user: PlatformUser }) {
  const { toast } = useToast();
  const { data: tenants = [] } = useTenants();
  const setRoles = useSetUserTenantRoles();
  const addToTenant = useAddUserToTenant();
  const removeFromTenant = useRemoveUserFromTenant();
  const [addTenantId, setAddTenantId] = useState('');
  const [addRole, setAddRole] = useState('member');

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? id;
  const memberships = user.memberships ?? [];
  const availableTenants = tenants.filter((t) => !memberships.some((m) => m.tenant_id === t.id));

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Organization Memberships &amp; Roles</Label>
      {memberships.length === 0 && <p className="text-sm text-muted-foreground">No memberships.</p>}
      <div className="space-y-2">
        {memberships.map((m) => (
          <div key={m.tenant_id} className="flex items-center gap-2">
            <span className="flex-1 text-sm truncate" title={m.tenant_id}>{tenantName(m.tenant_id)}</span>
            <select
              value={m.roles?.[0] ?? 'member'}
              onChange={(e) => setRoles.mutate(
                { tenantId: m.tenant_id, userId: user.id, roles: [e.target.value] },
                { onSuccess: () => toast({ title: 'Role updated' }), onError: () => toast({ title: 'Failed to update role', variant: 'destructive' }) },
              )}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm w-36"
            >
              {SSO_ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
              onClick={() => { if (confirm(`Remove from ${tenantName(m.tenant_id)}?`)) removeFromTenant.mutate({ tenantId: m.tenant_id, userId: user.id }, { onSuccess: () => toast({ title: 'Removed from organization' }) }); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {availableTenants.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <select value={addTenantId} onChange={(e) => setAddTenantId(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm flex-1">
            <option value="">Add to organization…</option>
            {availableTenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={addRole} onChange={(e) => setAddRole(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm w-32">
            {SSO_ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <Button size="sm" disabled={!addTenantId || addToTenant.isPending}
            onClick={() => addToTenant.mutate(
              { tenantId: addTenantId, userId: user.id, roles: [addRole] },
              { onSuccess: () => { toast({ title: 'Added to organization' }); setAddTenantId(''); }, onError: () => toast({ title: 'Failed to add', variant: 'destructive' }) },
            )}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
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
  const resetPw = useAdminResetPassword();
  const sendReset = useAdminSendResetEmail();
  const setMfa = useAdminSetMfaEnforcement();
  const [email, setEmail] = useState(user.email);
  const [resetPwValue, setResetPwValue] = useState<string | null>(null);

  const handleSave = () => {
    if (!email || email === user.email) { onClose(); return; }
    update.mutate(
      { id: user.id, email },
      {
        onSuccess: () => { toast({ title: 'Updated', description: 'User email updated.' }); onClose(); },
        onError: () => toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' }),
      }
    );
  };

  const handleResetPassword = () => {
    resetPw.mutate(
      { id: user.id },
      {
        onSuccess: (res) => {
          if (res?.temp_password) setResetPwValue(res.temp_password);
          toast({ title: 'Password reset', description: 'A temporary password was generated.' });
        },
        onError: () => toast({ title: 'Error', description: 'Failed to reset password.', variant: 'destructive' }),
      }
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage User</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div>
            <Label>Email</Label>
            <div className="flex gap-2 mt-1">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button variant="outline" onClick={handleSave} disabled={update.isPending || email === user.email}>
                {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Save
              </Button>
            </div>
          </div>

          {/* Security actions */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Security</Label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleResetPassword} disabled={resetPw.isPending}>
                {resetPw.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <KeyRound className="h-4 w-4 mr-1" />}
                Reset Password
              </Button>
              <Button variant="outline" size="sm"
                onClick={() => sendReset.mutate(user.id, { onSuccess: () => toast({ title: 'Reset email sent' }), onError: () => toast({ title: 'Failed to send email', variant: 'destructive' }) })}
                disabled={sendReset.isPending}>
                {sendReset.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Mail className="h-4 w-4 mr-1" />}
                Send Reset Email
              </Button>
              <Button variant="outline" size="sm"
                onClick={() => setMfa.mutate({ id: user.id, enforced: true }, { onSuccess: () => toast({ title: '2FA enforced' }), onError: () => toast({ title: 'Failed', variant: 'destructive' }) })}
                disabled={setMfa.isPending}>
                <ShieldCheck className="h-4 w-4 mr-1" /> Enforce 2FA
              </Button>
              <Button variant="outline" size="sm"
                onClick={() => setMfa.mutate({ id: user.id, enforced: false }, { onSuccess: () => toast({ title: '2FA enforcement removed' }) })}
                disabled={setMfa.isPending}>
                <ShieldOff className="h-4 w-4 mr-1" /> Unenforce 2FA
              </Button>
            </div>
            {resetPwValue && (
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 px-3 py-2 rounded-md bg-muted font-mono text-sm break-all">{resetPwValue}</code>
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard?.writeText(resetPwValue); toast({ title: 'Copied' }); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Memberships & roles */}
          <div className="border-t pt-4">
            <MembershipsSection user={user} />
          </div>

          <div className="border-t pt-4 space-y-1">
            <Label className="text-muted-foreground text-xs">User ID</Label>
            <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
            {user.primary_tenant_id && (
              <>
                <Label className="text-muted-foreground text-xs">Primary Tenant</Label>
                <p className="font-mono text-xs text-muted-foreground">{user.primary_tenant_id}</p>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
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
  const [creating, setCreating] = useState(false);
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
