'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TenantMember } from '@/hooks/use-dashboard-api';
import { Copy, KeyRound, Loader2, MapPin } from 'lucide-react';
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

export function TempPasswordRevealDialog({
  info,
  onCopy,
  onDone,
}: {
  info: { email: string; password: string };
  onCopy: () => void;
  onDone: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account created</h3>
            <p className="text-xs text-slate-400 mt-0.5">{info.email}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          A welcome email with the sign-in link was sent. Share this temporary password securely — it
          won&apos;t be shown again. The user must change it on first sign-in.
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
