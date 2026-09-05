'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import {
  useTenantMembers,
  useAddTenantMember,
  useUpdateTenantMember,
  useRemoveTenantMember,
  useSetTenantMemberStatus,
  useSetMemberPin,
  useAdminResetPassword,
  useAdminSendResetEmail,
  type TenantMember,
} from '@/hooks/use-dashboard-api';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { outletsPath, type TenantOutlet } from './shared';
import { TEAM_ROLES, buildTeamColumns } from './team-columns';
import { AssignOutletDialog, ResetPasswordDialog, SetPinDialog, TempPasswordRevealDialog } from './team-dialogs';

// ── Team ─────────────────────────────────────────────────────────────────────

export function TeamTab({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const LIMIT = 20;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [outletFilter, setOutletFilter] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [invitePin, setInvitePin] = useState('');
  const [pinTarget, setPinTarget] = useState<TenantMember | null>(null);
  const [pin, setPin] = useState('');
  const [pinService, setPinService] = useState('pos');
  const [outletTarget, setOutletTarget] = useState<TenantMember | null>(null);
  const [outletAssignId, setOutletAssignId] = useState('');
  // One-time temp-password reveal — after a brand-new account is created, OR after
  // generating a temp password via the Reset Password dialog below (different copy
  // for each: only the invite path actually sends a welcome email).
  const [tempPwInfo, setTempPwInfo] = useState<{ email: string; password: string; context: 'invite' | 'reset' } | null>(null);
  const [resetPwTarget, setResetPwTarget] = useState<TenantMember | null>(null);

  const addMember = useAddTenantMember(tenantId);
  const updateMember = useUpdateTenantMember(tenantId);
  const removeMember = useRemoveTenantMember(tenantId);
  const setMemberStatus = useSetTenantMemberStatus(tenantId);
  const setMemberPin = useSetMemberPin(tenantId);
  const resetPassword = useAdminResetPassword();
  const sendResetEmail = useAdminSendResetEmail();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const resetPage = useCallback(() => setPage(1), []);

  useEffect(() => { resetPage(); }, [debouncedSearch, roleFilter, statusFilter, outletFilter, resetPage]);

  const { data: outletsData } = useQuery<TenantOutlet[]>({
    queryKey: ['tenant-outlets', tenantSlug],
    queryFn: async () => {
      // Served at /api/v1/tenants/{slug}/outlets (mounted under /tenants) — NOT
      // /api/v1/{slug}/outlets, which 404s and silently yields an empty list.
      const res = await apiClient.get(outletsPath(tenantSlug));
      const raw = (res as { data?: unknown }).data ?? res;
      return Array.isArray(raw) ? raw as TenantOutlet[] : [];
    },
    enabled: !!tenantSlug,
    staleTime: 5 * 60 * 1000,
  });
  const outlets = outletsData ?? [];

  const { data, isLoading } = useTenantMembers(tenantId, true, {
    page,
    limit: LIMIT,
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
    outlet_id: outletFilter,
  });

  const members = data?.data ?? [];
  const total = data?.total ?? 0;

  const [inviteOutletId, setInviteOutletId] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Backend resolves the email to an existing user, or creates the account
      // on the fly (#3) and returns a one-time temp_password.
      const result = await addMember.mutateAsync({
        email: inviteEmail,
        roles: [inviteRole],
        ...(inviteName ? { name: inviteName } : {}),
        ...(inviteOutletId ? { outlet_id: inviteOutletId } : {}),
        ...(invitePin.length === 4 ? { pin: invitePin, service: 'pos' } : {}),
      });
      if (result?.temp_password) {
        setTempPwInfo({ email: inviteEmail, password: result.temp_password, context: 'invite' });
      } else {
        toast({ title: 'Member added' });
      }
      setInviteEmail('');
      setInviteName('');
      setInvitePin('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: msg ?? 'Failed to add member', variant: 'destructive' });
    }
  };

  const handleAssignOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletTarget) return;
    try {
      // Include current roles so the backend doesn't wipe them.
      // Empty string for outlet_id signals "clear assignment".
      await updateMember.mutateAsync({
        user_id: outletTarget.user_id,
        roles: outletTarget.roles,
        outlet_id: outletAssignId || '',
      });
      toast({ title: `Outlet assigned for ${outletTarget.name ?? outletTarget.email}` });
      setOutletTarget(null);
      setOutletAssignId('');
    } catch {
      toast({ title: 'Failed to assign outlet', variant: 'destructive' });
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await removeMember.mutateAsync(userId);
      toast({ title: 'Member removed' });
    } catch {
      toast({ title: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (m: TenantMember, status: string) => {
    try {
      await setMemberStatus.mutateAsync({ userId: m.user_id, status, roles: m.roles });
      toast({ title: `${m.name ?? m.email} ${status === 'active' ? 'activated' : status}` });
    } catch {
      toast({ title: 'Failed to update member status', variant: 'destructive' });
    }
  };

  const handleSendResetEmail = () => {
    if (!resetPwTarget) return;
    sendResetEmail.mutate(resetPwTarget.user_id, {
      onSuccess: () => { toast({ title: `Reset email sent to ${resetPwTarget.name ?? resetPwTarget.email}` }); setResetPwTarget(null); },
      onError: () => toast({ title: 'Failed to send reset email', variant: 'destructive' }),
    });
  };

  const handleSetPassword = (password: string) => {
    if (!resetPwTarget) return;
    resetPassword.mutate({ id: resetPwTarget.user_id, new_password: password }, {
      onSuccess: () => { toast({ title: `Password updated for ${resetPwTarget.name ?? resetPwTarget.email}` }); setResetPwTarget(null); },
      onError: () => toast({ title: 'Failed to set password', variant: 'destructive' }),
    });
  };

  const handleGeneratePassword = () => {
    if (!resetPwTarget) return;
    resetPassword.mutate({ id: resetPwTarget.user_id }, {
      onSuccess: (res) => {
        if (res?.temp_password) setTempPwInfo({ email: resetPwTarget.email, password: res.temp_password, context: 'reset' });
        setResetPwTarget(null);
      },
      onError: () => toast({ title: 'Failed to generate password', variant: 'destructive' }),
    });
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinTarget || pin.length !== 4) return;
    try {
      await setMemberPin.mutateAsync({ userId: pinTarget.user_id, pin, service: pinService });
      toast({ title: `PIN set for ${pinTarget.name ?? pinTarget.email}` });
      setPinTarget(null);
      setPin('');
    } catch {
      toast({ title: 'Failed to set PIN', variant: 'destructive' });
    }
  };

  const columns = useMemo(
    () =>
      buildTeamColumns({
        outlets,
        onStatusChange: handleStatusChange,
        onAssignOutlet: (m) => { setOutletTarget(m); setOutletAssignId(m.outlet_id ?? ''); },
        onSetPin: (m) => { setPinTarget(m); setPin(''); },
        onResetPassword: setResetPwTarget,
        onRemove: handleRemove,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outlets],
  );

  return (
    <div className="space-y-8">
      {/* Add member form */}
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Member</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6 ml-13">
          Existing users are added directly. New emails get an account with a temporary password and a welcome email with the sign-in link.
        </p>
        <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px] space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</Label>
            <Input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </div>
          <div className="w-40 space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Name (optional)</Label>
            <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)}
              placeholder="Jane Doe"
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
          </div>
          <div className="w-40 space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</Label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
              {TEAM_ROLES.map((r) => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="w-32 space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">PIN (optional)</Label>
            <Input type="text" inputMode="numeric" maxLength={4} pattern="[0-9]{4}"
              value={invitePin} onChange={(e) => setInvitePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="POS PIN"
              className="h-12 rounded-2xl text-center tracking-widest border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono" />
          </div>
          {outlets.length > 0 && (
            <div className="w-44 space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Outlet (optional)</Label>
              <select value={inviteOutletId} onChange={(e) => setInviteOutletId(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                <option value="">Unassigned</option>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <Button type="submit" disabled={addMember.isPending}
              className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
              {addMember.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </div>
        </form>
      </div>

      {/* Members list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Team Members</h2>
          <span className="text-sm text-slate-400 font-medium">{total} member{total !== 1 ? 's' : ''}</span>
        </div>

        <DataTable
          columns={columns}
          rows={members}
          rowKey={(m) => m.user_id}
          loading={isLoading}
          emptyText="No members found."
          storageKey="my-tenant-team-col-prefs"
          page={page}
          totalPages={Math.max(1, Math.ceil(total / LIMIT))}
          onPageChange={setPage}
          total={total}
          toolbar={
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap w-full">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
                  className="h-11 pl-9 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium w-full sm:w-40">
                <option value="">All Roles</option>
                {TEAM_ROLES.map((r) => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium w-full sm:w-36">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              {outlets.length > 0 && (
                <select value={outletFilter} onChange={(e) => setOutletFilter(e.target.value)}
                  className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium w-full sm:w-44">
                  <option value="">All Outlets</option>
                  {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              )}
            </div>
          }
        />
      </section>

      {/* Assign Outlet Modal */}
      {outletTarget && (
        <AssignOutletDialog
          target={outletTarget}
          outlets={outlets}
          outletAssignId={outletAssignId}
          onOutletAssignIdChange={setOutletAssignId}
          onCancel={() => { setOutletTarget(null); setOutletAssignId(''); }}
          onSubmit={handleAssignOutlet}
          pending={updateMember.isPending}
        />
      )}

      {/* Set PIN Modal */}
      {pinTarget && (
        <SetPinDialog
          target={pinTarget}
          pin={pin}
          pinService={pinService}
          onPinChange={setPin}
          onPinServiceChange={setPinService}
          onCancel={() => { setPinTarget(null); setPin(''); }}
          onSubmit={handleSetPin}
          pending={setMemberPin.isPending}
        />
      )}

      {/* Reset Password Modal */}
      {resetPwTarget && (
        <ResetPasswordDialog
          target={resetPwTarget}
          onCancel={() => setResetPwTarget(null)}
          onSendEmail={handleSendResetEmail}
          onSetPassword={handleSetPassword}
          onGenerate={handleGeneratePassword}
          sending={resetPassword.isPending || sendResetEmail.isPending}
        />
      )}

      {/* Temporary password reveal (new account created, or a generated password reset) */}
      {tempPwInfo && (
        <TempPasswordRevealDialog
          info={tempPwInfo}
          onCopy={() => { navigator.clipboard?.writeText(tempPwInfo.password); toast({ title: 'Copied' }); }}
          onDone={() => setTempPwInfo(null)}
          {...(tempPwInfo.context === 'reset' ? {
            title: 'Password reset',
            description: "Share this temporary password securely — it won't be shown again. The user must change it on next sign-in.",
          } : {})}
        />
      )}
    </div>
  );
}
