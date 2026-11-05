'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateTenantMember, type TenantMember } from '@/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import { AppWindow, Copy, KeyRound, Loader2, Lock, Mail, MapPin, UserCog } from 'lucide-react';
import type { TenantOutlet } from './shared';

// Modal dialogs used by TeamTab's member list: outlet assignment, service-PIN
// assignment, and the one-time temp-password reveal shown after inviting a
// brand-new (non-existing) user account.

// Roles that may work several outlets or the whole organisation. Same list as auth-api's
// multiOutletRoles, which enforces it. Every other staff role works one outlet.
const MULTI_OUTLET_ROLES = ['manager', 'accountant', 'warehouse_manager'];

export type OutletAssignment = { outlet_id: string } | { outlet_ids: string[] };

export function AssignOutletDialog({
  target,
  outlets,
  onCancel,
  onSave,
  pending,
}: {
  target: TenantMember;
  outlets: TenantOutlet[];
  onCancel: () => void;
  onSave: (assignment: OutletAssignment) => void;
  pending: boolean;
}) {
  const isAdmin = target.roles.some((r) => r === 'admin' || r === 'superuser');
  const multi = !isAdmin && outlets.length > 1 && target.roles.some((r) => MULTI_OUTLET_ROLES.includes(r));
  const [homeOutlet, setHomeOutlet] = useState(target.outlet_id ?? '');
  const [selected, setSelected] = useState<string[]>(target.outlet_ids ?? []);
  const [tenantWide, setTenantWide] = useState(!target.outlet_ids?.length);
  const pickNothing = multi && !tenantWide && selected.length === 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickNothing) return;
    onSave(multi ? { outlet_ids: tenantWide ? [] : selected } : { outlet_id: homeOutlet });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Outlet</h3>
            <p className="text-xs text-slate-400 mt-0.5">{target.name ?? target.email}</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          {multi ? (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Outlets</Label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                <input type="checkbox" checked={tenantWide} onChange={(e) => setTenantWide(e.target.checked)} />
                All outlets (tenant-wide)
              </label>
              {!tenantWide && (
                <div className="max-h-48 overflow-y-auto space-y-2 pl-1">
                  {outlets.map((o) => (
                    <label key={o.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={selected.includes(o.id)}
                        onChange={(e) => setSelected((cur) => (e.target.checked ? [...cur, o.id] : cur.filter((id) => id !== o.id)))}
                      />
                      {o.name}{o.use_case ? ` (${o.use_case})` : ''}
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400">
                {pickNothing ? 'Choose at least one outlet.' : 'Takes effect the next time they sign in.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Home Outlet</Label>
              <select value={homeOutlet} onChange={(e) => setHomeOutlet(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                <option value="">Unassigned</option>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}{o.use_case ? ` (${o.use_case})` : ''}</option>)}
              </select>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Admins work across every outlet. This sets where they start.'
                  : 'Sets the default outlet for PIN login and reporting. This role works one outlet.'}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={pending || pickNothing}
              className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SetPinDialog({
  target,
  pin,
  pinService,
  onPinChange,
  onPinServiceChange,
  onCancel,
  onSubmit,
  pending,
}: {
  target: TenantMember;
  pin: string;
  pinService: string;
  onPinChange: (pin: string) => void;
  onPinServiceChange: (service: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Set Service PIN</h3>
            <p className="text-xs text-slate-400 mt-0.5">{target.name ?? target.email}</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Service</Label>
            <select value={pinService} onChange={(e) => onPinServiceChange(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
              <option value="pos">POS</option>
              <option value="inventory">Inventory</option>
              <option value="library">Library</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">4-Digit PIN</Label>
            <Input required type="password" inputMode="numeric" maxLength={4} pattern="[0-9]{4}"
              value={pin} onChange={(e) => onPinChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="h-12 rounded-2xl text-center text-2xl tracking-widest border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono" />
            <p className="text-xs text-slate-400">Staff will use this PIN to log in on the terminal.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={pending || pin.length !== 4}
              className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save PIN'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ResetMode = 'choose' | 'set';

/**
 * Reset a team member's SSO password from their own organization's Team page —
 * a tenant admin action, distinct from (but built on the same auth-api endpoints
 * as) the platform Users page's EditUserDialog security actions. Two paths: send
 * the standard reset-password email, or set a new password directly (typed or
 * generated) — the generated case reuses TempPasswordRevealDialog for the reveal.
 */
export function ResetPasswordDialog({
  target,
  onCancel,
  onSendEmail,
  onSetPassword,
  onGenerate,
  sending,
}: {
  target: TenantMember;
  onCancel: () => void;
  onSendEmail: () => void;
  onSetPassword: (password: string) => void;
  onGenerate: () => void;
  sending: boolean;
}) {
  const [mode, setMode] = useState<ResetMode>('choose');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function submitSetPassword(e: React.FormEvent) {
    e.preventDefault();
    onSetPassword(password);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>
            <p className="text-xs text-slate-400 mt-0.5">{target.name ?? target.email}</p>
          </div>
        </div>

        {mode === 'choose' ? (
          <div className="space-y-2">
            <button
              onClick={onSendEmail}
              disabled={sending}
              className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">Send reset email</span>
                <span className="block text-xs text-slate-400">They&apos;ll get a link to choose their own new password.</span>
              </span>
              {sending && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
            </button>
            <button
              onClick={() => setMode('set')}
              disabled={sending}
              className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4 text-primary shrink-0" />
              <span>
                <span className="block text-sm font-bold text-slate-900 dark:text-white">Set a new password</span>
                <span className="block text-xs text-slate-400">Choose it yourself, or generate a one-time temporary password.</span>
              </span>
            </button>
            <Button type="button" variant="outline" className="w-full h-11 rounded-2xl mt-2" onClick={onCancel}>Cancel</Button>
          </div>
        ) : (
          <form onSubmit={submitSetPassword} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">New Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
            {password.length > 0 && password.length < 8 && (
              <p className="text-xs text-rose-500">Password must be at least 8 characters.</p>
            )}
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-rose-500">Passwords do not match.</p>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-2xl" onClick={() => setMode('choose')} disabled={sending}>
                Back
              </Button>
              <Button type="submit" disabled={sending || password.length < 8 || password !== confirmPassword}
                className="flex-1 h-11 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set Password'}
              </Button>
            </div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={sending}
              className="w-full text-center text-xs text-primary hover:underline disabled:opacity-50"
            >
              Or generate a random temporary password instead
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function TempPasswordRevealDialog({
  info,
  onCopy,
  onDone,
  title = 'Account created',
  description = "A welcome email with the sign-in link was sent. Share this temporary password securely — it won't be shown again. The user must change it on first sign-in.",
}: {
  info: { email: string; password: string };
  onCopy: () => void;
  onDone: () => void;
  /** Override for a non-invite caller (e.g. Reset Password's "generate" path — no welcome email is sent there). */
  title?: string;
  description?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{info.email}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          {description}
        </p>
        <div className="flex items-center gap-2 mb-5">
          <code className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white break-all">
            {info.password}
          </code>
          <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-2xl" onClick={onCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <Button type="button" className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold"
          onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

// Change a member's roles. Roles they already hold stay listed so an edit never strips a service's
// own role by accident; auth-api refuses a super role and keeps the organisation with an admin.
export function MemberRolesDialog({
  tenantId,
  target,
  roles,
  onClose,
}: {
  tenantId: string;
  target: TenantMember;
  /** The roles a tenant admin can assign. */
  roles: string[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updateMember = useUpdateTenantMember(tenantId);
  const [picked, setPicked] = useState<string[]>(target.roles);
  const choices = useMemo(() => Array.from(new Set([...roles, ...target.roles])), [roles, target.roles]);

  const toggle = (role: string) =>
    setPicked((cur) => (cur.includes(role) ? cur.filter((r) => r !== role) : [...cur, role]));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMember.mutateAsync({ user_id: target.user_id, roles: picked });
      toast({ title: `Roles saved for ${target.name ?? target.email}` });
      onClose();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      toast({ title: message?.message ?? message?.error ?? 'Failed to save roles', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md p-8 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Roles</h3>
            <p className="text-xs text-slate-400 mt-0.5">{target.name ?? target.email}</p>
          </div>
        </div>
        <form onSubmit={save} className="space-y-5">
          <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <legend className="sr-only">Roles this person holds</legend>
            {choices.map((role) => (
              <label key={role} className="flex items-center gap-3 min-h-11 text-sm text-slate-700 dark:text-slate-200 capitalize">
                <input type="checkbox" checked={picked.includes(role)} onChange={() => toggle(role)} />
                {role.replace(/_/g, ' ')}
              </label>
            ))}
          </fieldset>
          <p className="text-xs text-slate-400">The person gets the new access the next time they sign in.</p>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateMember.isPending || picked.length === 0}
              className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold">
              {updateMember.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Display names for service tags (auth-api access rules, subscription service tags).
const SERVICE_LABELS: Record<string, string> = {
  pos: 'POS', inventory: 'Inventory', treasury: 'Books', ordering: 'Online ordering', logistics: 'Logistics',
  hospital: 'Hospital', library: 'Library', maskani: 'Maskani', projects: 'Projects', erp: 'ERP',
};
export const serviceLabel = (tag: string) =>
  tag === '*' ? 'Every service' : SERVICE_LABELS[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1);

interface RoleRequiredDetails {
  services?: string[];
  roles_by_service?: Record<string, string[]>;
}

// Which services keep this member (their user, roles and PIN in that service). Tenant admins get
// every planned service; anyone else gets what is ticked here, within the plan, and each ticked
// service needs a role for it: when one is missing, the admin picks a role to add and saves again.
export function ServiceAccessDialog({
  tenantId,
  target,
  entitledTags,
  onClose,
}: {
  tenantId: string;
  target: TenantMember;
  /** The plan's service tags; undefined while loading or when the plan is not limited. */
  entitledTags: string[] | undefined;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updateMember = useUpdateTenantMember(tenantId);
  const isAdmin = target.roles.some((r) => r === 'admin' || r === 'superuser');
  const [followRoles, setFollowRoles] = useState(!target.services);
  const [picked, setPicked] = useState<string[]>(
    target.services ?? (target.effective_services ?? []).filter((s) => s !== '*'),
  );
  const [needRole, setNeedRole] = useState<RoleRequiredDetails | null>(null);
  const [rolesToAdd, setRolesToAdd] = useState<Record<string, string>>({});

  const choices = useMemo(() => {
    const tags = new Set<string>(entitledTags ?? Object.keys(SERVICE_LABELS));
    picked.forEach((t) => tags.add(t));
    return Array.from(tags).sort();
  }, [entitledTags, picked]);

  const toggle = (tag: string) =>
    setPicked((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const extraRoles = Object.values(rolesToAdd).filter(Boolean);
    const roles = Array.from(new Set([...target.roles, ...extraRoles]));
    try {
      await updateMember.mutateAsync(
        followRoles
          ? { user_id: target.user_id, roles: target.roles, services_follow_roles: true }
          : { user_id: target.user_id, roles, services: picked },
      );
      toast({ title: `Service access saved for ${target.name ?? target.email}` });
      onClose();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { code?: string; error?: string; details?: RoleRequiredDetails } } })
        ?.response?.data;
      if (data?.code === 'role_required_for_service' && data.details) {
        setNeedRole(data.details);
        return;
      }
      toast({ title: data?.error ?? 'Failed to save service access', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md p-8 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <AppWindow className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Access</h3>
            <p className="text-xs text-slate-400 mt-0.5">{target.name ?? target.email}</p>
          </div>
        </div>
        {isAdmin ? (
          <div className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Admins use every service in your plan. Remove the admin role to limit this person to chosen services.
            </p>
            <Button type="button" variant="outline" className="w-full h-12 rounded-2xl" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={save} className="space-y-5">
            <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
              <input type="checkbox" className="mt-1" checked={followRoles} onChange={(e) => setFollowRoles(e.target.checked)} />
              <span>
                Follow their roles
                <span className="block text-xs text-slate-400">
                  Services come from the roles they hold
                  {target.effective_services?.length ? `: now ${target.effective_services.map(serviceLabel).join(', ')}` : ''}.
                </span>
              </span>
            </label>
            {!followRoles && (
              <fieldset className="space-y-2">
                <legend className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Services they use</legend>
                {choices.map((tag) => (
                  <label key={tag} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <input type="checkbox" checked={picked.includes(tag)} onChange={() => toggle(tag)} />
                    {serviceLabel(tag)}
                  </label>
                ))}
                <p className="text-xs text-slate-400">Only services in your plan are listed. Unticked services remove this person from them.</p>
              </fieldset>
            )}
            {needRole?.services?.length ? (
              <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-500/10 p-4">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Add a role for {needRole.services.map(serviceLabel).join(', ')} first.
                </p>
                {needRole.services.map((svc) => {
                  const options = needRole.roles_by_service?.[svc] ?? [];
                  return (
                    <div key={svc} className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{serviceLabel(svc)} role</Label>
                      <select
                        value={rolesToAdd[svc] ?? ''}
                        onChange={(e) => setRolesToAdd((cur) => ({ ...cur, [svc]: e.target.value }))}
                        className="w-full h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="">Choose a role to add</option>
                        {options.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                      </select>
                      {options.length === 0 && (
                        <p className="text-xs text-slate-500">No role is set up for this service yet; untick it or ask the platform team.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={updateMember.isPending}
                className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold">
                {updateMember.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : needRole ? 'Add role and save' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
