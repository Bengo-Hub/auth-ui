'use client';

import { useState } from 'react';
import {
  ShieldOff,
  ShieldCheck,
  Loader2,
  KeyRound,
  Mail,
  Copy,
  Plus,
  X,
} from 'lucide-react';
import {
  useCreateAdminUser,
  useUpdateAdminUser,
  useAdminResetPassword,
  useAdminSendResetEmail,
  useAdminSetMfaEnforcement,
  useAddUserToTenant,
  useSetUserTenantRoles,
  useRemoveUserFromTenant,
  useAdminSetUserServicePin,
  useTenants,
  type PlatformUser,
} from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInputField } from '@bengo-hub/shared-ui-lib/contact';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Global SSO roles assignable per tenant membership. 'developer' and 'superuser' grant
// developer-portal access (superuser also grants platform-owner status when the tenant is
// "codevertex" — see auth-api's isPlatformAdminRole/DEVELOPER_PORTAL_ROLES).
export const SSO_ROLES = [
  'admin', 'superuser', 'developer', 'manager', 'staff', 'member', 'viewer', 'cashier', 'waiter',
  'barista', 'kitchen', 'bar', 'receptionist', 'accountant', 'rider', 'driver',
  'delivery_coordinator', 'technician', 'customer',
];

export function CreateUserDialog({ onClose }: { onClose: () => void }) {
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
                <PhoneInputField value={phone} onChange={setPhone} className="mt-1" />
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

export function EditUserDialog({
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

// Services that support a 4-digit terminal PIN. Kept in sync with the tenant
// "Set PIN" dialog on the my-tenant page.
const PIN_SERVICES = [
  { value: 'pos', label: 'POS' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'library', label: 'Library' },
];

// Platform-admin PIN dialog. Reuses the tenant "Set Service PIN" flow, but adds
// an organization picker because a platform user may belong to several orgs and
// a PIN is scoped to one tenant + service.
export function SetPinDialog({ user, onClose }: { user: PlatformUser; onClose: () => void }) {
  const { toast } = useToast();
  const { data: tenants = [] } = useTenants();
  const setPinMutation = useAdminSetUserServicePin();
  const memberships = user.memberships ?? [];
  const [tenantId, setTenantId] = useState(memberships[0]?.tenant_id ?? '');
  const [service, setService] = useState('pos');
  const [pin, setPin] = useState('');

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || pin.length !== 4) return;
    setPinMutation.mutate(
      { tenantId, userId: user.id, pin, service },
      {
        onSuccess: () => {
          toast({ title: 'PIN set', description: `${service.toUpperCase()} PIN set for ${user.email} in ${tenantName(tenantId)}.` });
          onClose();
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          toast({ title: msg ?? 'Failed to set PIN', variant: 'destructive' });
        },
      },
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Set Service PIN</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        {memberships.length === 0 ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              A service PIN is scoped to an organization. Add this user to an organization first (via <strong>Edit → Organization Memberships</strong>), then set their PIN.
            </p>
            <DialogFooter><Button onClick={onClose}>Close</Button></DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label>Organization</Label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {memberships.map((m) => (
                  <option key={m.tenant_id} value={m.tenant_id}>{tenantName(m.tenant_id)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Service</Label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {PIN_SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label>4-Digit PIN</Label>
              <Input
                required
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="mt-1 text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">The user will use this PIN to log in on the terminal.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={setPinMutation.isPending || pin.length !== 4 || !tenantId}>
                {setPinMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Save PIN
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
