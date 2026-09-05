'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TenantMember } from '@/hooks/use-dashboard-api';
import { Copy, KeyRound, Loader2, Lock, Mail, MapPin } from 'lucide-react';
import type { TenantOutlet } from './shared';

// Modal dialogs used by TeamTab's member list: outlet assignment, service-PIN
// assignment, and the one-time temp-password reveal shown after inviting a
// brand-new (non-existing) user account.

export function AssignOutletDialog({
  target,
  outlets,
  outletAssignId,
  onOutletAssignIdChange,
  onCancel,
  onSubmit,
  pending,
}: {
  target: TenantMember;
  outlets: TenantOutlet[];
  outletAssignId: string;
  onOutletAssignIdChange: (id: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
}) {
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
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Home Outlet</Label>
            <select value={outletAssignId} onChange={(e) => onOutletAssignIdChange(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
              <option value="">Unassigned (tenant-wide)</option>
              {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}{o.use_case ? ` (${o.use_case})` : ''}</option>)}
            </select>
            <p className="text-xs text-slate-400">Sets the default outlet for PIN login and reporting.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={pending}
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
