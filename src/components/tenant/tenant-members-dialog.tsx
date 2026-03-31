'use client';

import { PermissionActionButton } from '@/components/auth/permission-action-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAddTenantMember,
  useRemoveTenantMember,
  useTenantMembers,
  useUpdateTenantMember,
} from '@/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import {
  Loader2,
  Plus,
  Trash2,
  Users
} from 'lucide-react';
import { useState } from 'react';

interface TenantMembersDialogProps {
  tenantId: string;
  tenantName: string;
}

export function TenantMembersDialog({ tenantId, tenantName }: TenantMembersDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [invitingUserId, setInvitingUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('');

  const { data: members, isLoading: isMembersLoading } = useTenantMembers(tenantId, open);
  const addMember = useAddTenantMember(tenantId);
  const updateMember = useUpdateTenantMember(tenantId);
  const removeMember = useRemoveTenantMember(tenantId);
  const { canManageUsers } = usePermissionCheck();

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitingUserId.trim()) return;

    setIsLoading(true);
    try {
      await addMember.mutateAsync({
        user_id: invitingUserId.trim(),
        roles: [selectedRole],
      });

      toast({
        title: 'Member added',
        description: `User has been added to ${tenantName} as ${selectedRole}.`,
      });

      setInvitingUserId('');
      setSelectedRole('admin');
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to add member';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (userId: string, newRole: string) => {
    try {
      await updateMember.mutateAsync({
        user_id: userId,
        roles: [newRole],
      });

      toast({
        title: 'Member updated',
        description: `Member role changed to ${newRole}.`,
      });

      setEditingUserId(null);
      setEditingRole('');
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to update member';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await removeMember.mutateAsync(userId);

      toast({
        title: 'Member removed',
        description: 'Member has been removed from the organization.',
      });
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to remove member';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (!canManageUsers()) {
    return null; // Hide button if user can't manage members
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">
          <Users className="h-4 w-4 mr-2" /> Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Members</DialogTitle>
          <DialogDescription>
            Invite and manage team members for {tenantName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">Invite New Member</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-id" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  User Email or ID
                </Label>
                <Input
                  id="user-id"
                  type="text"
                  placeholder="user@example.com"
                  value={invitingUserId}
                  onChange={(e) => setInvitingUserId(e.target.value)}
                  className="h-10 rounded-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Role
                </Label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  disabled={isLoading}
                >
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !invitingUserId.trim()}
              className="h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Member
            </Button>
          </form>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Team Members ({members?.length || 0})</h3>

            {isMembersLoading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading members...
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {member.name || member.email || 'Unknown User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {member.email && member.name ? member.email : member.user_id}
                        {' · '}Added {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {editingUserId === member.user_id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateMember(member.user_id, editingRole)}
                            className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUserId(null)}
                            className="h-8 px-3 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <select
                            value={member.roles[0] || 'admin'}
                            onChange={(e) => {
                              setEditingUserId(member.user_id);
                              setEditingRole(e.target.value);
                            }}
                            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                          </select>
                          <PermissionActionButton
                            permission="auth.users.manage"
                            icon={Trash2}
                            onClick={() => handleRemoveMember(member.user_id)}
                            variant="ghost"
                            size="icon"
                            hideWhenUnauthorized={true}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                No members yet. Invite someone to get started.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
