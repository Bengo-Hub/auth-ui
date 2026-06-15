'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Loader2,
  RefreshCw,
  Plus,
  Lock,
  Pencil,
  Trash2,
  Users,
  KeySquare,
} from 'lucide-react';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  type Role,
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
import { useToast } from '@/hooks/use-toast';

function ScopeBadge({ scope }: { scope?: string }) {
  if (!scope) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
      {scope}
    </span>
  );
}

function CreateRoleDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const create = useCreateRole();
  const [roleCode, setRoleCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('');

  const handleCreate = () => {
    const code = roleCode.trim().toLowerCase().replace(/\s+/g, '_');
    if (!code) {
      toast({ title: 'Role code required', variant: 'destructive' });
      return;
    }
    create.mutate(
      { role_code: code, name: name.trim() || code, description: description.trim() || undefined, scope: scope.trim() || undefined },
      {
        onSuccess: () => {
          toast({ title: 'Role created', description: `Created role "${code}".` });
          onClose();
        },
        onError: (e: any) =>
          toast({
            title: 'Error',
            description: e?.response?.data?.error ?? 'Failed to create role.',
            variant: 'destructive',
          }),
      }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create custom role</DialogTitle>
          <DialogDescription>
            Custom roles are non-system and fully editable. Assign permissions after creating.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Role code</Label>
            <Input value={roleCode} onChange={(e) => setRoleCode(e.target.value)} placeholder="e.g. regional_manager" />
            <p className="text-xs text-muted-foreground">Lowercase, no spaces. Matches the role name stored on memberships.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Regional Manager" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Scope</Label>
            <Input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="platform / pos / ordering …" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditRoleDialog({ role, onClose }: { role: Role; onClose: () => void }) {
  const { toast } = useToast();
  const update = useUpdateRole();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? '');
  const [scope, setScope] = useState(role.scope ?? '');

  const handleSave = () => {
    update.mutate(
      { code: role.role_code, name: name.trim(), description: description.trim(), scope: scope.trim() },
      {
        onSuccess: () => {
          toast({ title: 'Role updated' });
          onClose();
        },
        onError: (e: any) =>
          toast({ title: 'Error', description: e?.response?.data?.error ?? 'Failed to update role.', variant: 'destructive' }),
      }
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit role · {role.role_code}</DialogTitle>
          <DialogDescription>Update role metadata. Permissions are managed from the role detail page.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Scope</Label>
            <Input value={scope} onChange={(e) => setScope(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleRow({ role }: { role: Role }) {
  const { toast } = useToast();
  const del = useDeleteRole();
  const [editing, setEditing] = useState(false);

  const doDelete = () => {
    if (!confirm(`Delete role "${role.role_code}"? Its permission assignments will be removed.`)) return;
    del.mutate(role.role_code, {
      onSuccess: () => toast({ title: 'Deleted', description: `Role "${role.role_code}" removed.` }),
      onError: (e: any) =>
        toast({ title: 'Error', description: e?.response?.data?.error ?? 'Failed to delete role.', variant: 'destructive' }),
    });
  };

  return (
    <>
      {editing && <EditRoleDialog role={role} onClose={() => setEditing(false)} />}
      <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3">
          <Link href={`/dashboard/platform/roles/${role.role_code}`} className="font-medium text-sm hover:underline flex items-center gap-2">
            {role.is_wildcard && <Lock className="h-3.5 w-3.5 text-amber-600" />}
            {role.name}
          </Link>
          <div className="text-xs text-muted-foreground font-mono">{role.role_code}</div>
        </td>
        <td className="px-4 py-3"><ScopeBadge scope={role.scope} /></td>
        <td className="px-4 py-3">
          {role.is_system ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">System</span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Custom</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <KeySquare className="h-3.5 w-3.5" />
            {role.is_wildcard ? 'All' : role.permission_count}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{role.member_count}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <Link href={`/dashboard/platform/roles/${role.role_code}`}>
              <Button variant="ghost" size="sm">Permissions</Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={role.is_system} onClick={() => setEditing(true)} title={role.is_system ? 'System role — read-only' : 'Edit'}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" disabled={role.is_system} onClick={doDelete} title={role.is_system ? 'System role — cannot delete' : 'Delete'}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    </>
  );
}

export default function RolesPage() {
  const { data: roles, isLoading, refetch } = useRoles();
  const [creating, setCreating] = useState(false);
  const list = roles ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" /> Roles &amp; Permissions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage role metadata and their permission assignments. System roles are read-only; wildcard roles
            (superuser / admin / superusers) always have every permission and cannot be edited.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Role
          </Button>
        </div>
      </div>

      {creating && <CreateRoleDialog onClose={() => setCreating(false)} />}

      <div className="rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No roles found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Scope</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Permissions</th>
                <th className="px-4 py-3 text-left">Members</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <RoleRow key={r.role_code} role={r} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
