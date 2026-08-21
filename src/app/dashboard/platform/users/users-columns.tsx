'use client';

import { useState } from 'react';
import type { DataTableColumn } from '@bengo-hub/shared-ui-lib/data-table';
import {
  MoreVertical,
  ShieldOff,
  ShieldCheck,
  UserX,
  Trash2,
  Edit,
  KeyRound,
} from 'lucide-react';
import {
  useAdminUserAction,
  usePurgeAdminUser,
  type PlatformUser,
} from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditUserDialog, SetPinDialog } from './user-dialogs';

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

// Self-contained per-row actions cell. Deliberately mirrors the pre-conversion
// `UserRow` component 1:1 (own `useAdminUserAction`/`useDeleteAdminUser`
// mutation instances + own `editing`/`settingPin` dialog toggles) so pending
// state and dialogs stay isolated per row, exactly as before — a single
// shared page-level mutation would make every row's menu spin together,
// which the original never did.
function UserActionsCell({ user }: { user: PlatformUser }) {
  const { toast } = useToast();
  const action = useAdminUserAction();
  const purgeUser = usePurgeAdminUser();
  const [editing, setEditing] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    purgeUser.mutate(user.id, {
      onSuccess: () => {
        toast({ title: 'Deleted', description: `${user.email} has been permanently deleted.` });
        setDeleting(false);
      },
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err?.response?.data?.error || 'Failed to delete user.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <>
      {editing && <EditUserDialog user={user} onClose={() => setEditing(false)} />}
      {settingPin && <SetPinDialog user={user} onClose={() => setSettingPin(false)} />}
      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Permanently delete this user?</DialogTitle>
            <DialogDescription>
              This will permanently delete <span className="font-semibold">{user.email}</span> from
              auth and every service that holds a copy of their account (roles, PINs, staff/member
              records). This cannot be undone — the account cannot be recovered or recreated with
              its old history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(false)} disabled={purgeUser.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={doDelete} disabled={purgeUser.isPending}>
              {purgeUser.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <DropdownMenuItem onClick={() => setSettingPin(true)}>
            <KeyRound className="h-4 w-4 mr-2" /> Set PIN
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
          <DropdownMenuItem onClick={() => setDeleting(true)} className="text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export interface UserColumnCallbacks {
  tenantName: (id: string) => string;
}

export function buildUserColumns(cb: UserColumnCallbacks): DataTableColumn<PlatformUser>[] {
  return [
    {
      key: 'email',
      header: 'Email / ID',
      primary: true,
      sortable: true,
      accessor: (u) => u.email,
      render: (u) => (
        <div>
          <div className="font-medium text-sm">{u.email}</div>
          <div className="text-xs text-muted-foreground font-mono">{u.id}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (u) => u.status,
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'primary_tenant',
      header: 'Primary Tenant',
      hideBelow: 'md',
      cellClassName: 'text-sm text-muted-foreground',
      accessor: (u) => (u.primary_tenant_id ? cb.tenantName(u.primary_tenant_id) : ''),
      render: (u) => (u.primary_tenant_id ? cb.tenantName(u.primary_tenant_id) : '—'),
    },
    {
      key: 'orgs',
      header: 'Orgs',
      hideBelow: 'lg',
      sortable: true,
      cellClassName: 'text-sm text-muted-foreground',
      accessor: (u) => u.memberships?.length ?? 0,
      render: (u) => `${u.memberships?.length ?? 0} org${(u.memberships?.length ?? 0) !== 1 ? 's' : ''}`,
    },
    {
      key: 'last_login_at',
      header: 'Last Login',
      hideBelow: 'lg',
      sortable: true,
      cellClassName: 'text-xs text-muted-foreground',
      accessor: (u) => u.last_login_at ?? '',
      render: (u) => (u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'),
    },
    {
      key: 'created_at',
      header: 'Joined',
      hideBelow: 'lg',
      sortable: true,
      cellClassName: 'text-xs text-muted-foreground',
      accessor: (u) => u.created_at,
      render: (u) => new Date(u.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      exportable: false,
      mobileAction: true,
      render: (u) => <UserActionsCell user={u} />,
    },
  ];
}
