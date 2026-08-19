'use client';

import { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Loader2,
  RefreshCw,
  Plus,
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
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import { buildRoleColumns } from './roles-columns';

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

export default function RolesPage() {
  const { data: roles, isLoading, isError, refetch } = useRoles();
  const [creating, setCreating] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const del = useDeleteRole();
  const { toast } = useToast();
  const list = roles ?? [];

  const doDelete = (role: Role) => {
    if (!confirm(`Delete role "${role.role_code}"? Its permission assignments will be removed.`)) return;
    del.mutate(role.role_code, {
      onSuccess: () => toast({ title: 'Deleted', description: `Role "${role.role_code}" removed.` }),
      onError: (e: any) =>
        toast({ title: 'Error', description: e?.response?.data?.error ?? 'Failed to delete role.', variant: 'destructive' }),
    });
  };

  const columns = useMemo(() => buildRoleColumns({ onEdit: setEditingRole, onDelete: doDelete }), []); // eslint-disable-line react-hooks/exhaustive-deps

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
      {editingRole && <EditRoleDialog role={editingRole} onClose={() => setEditingRole(null)} />}

      <DataTable
        columns={columns}
        rows={list}
        rowKey={(r) => r.role_code}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyText="No roles found"
        storageKey="platform-roles-col-prefs"
      />
    </div>
  );
}
