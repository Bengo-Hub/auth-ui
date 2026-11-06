'use client';

import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useMfaPolicy, useUpdateMfaPolicy, type MfaPolicy } from '@/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import { MFA_COPY } from '@/lib/mfa-enrollment';

function describePolicy(p: MfaPolicy): string {
  if (p.all_accounts) return MFA_COPY.policyAllAccounts;
  return p.required_roles.length > 0 ? p.required_roles.join(', ') : MFA_COPY.policyNothing;
}

function ToggleRow({
  label, hint, checked, onChange, disabled,
}: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium break-words">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label} />
    </div>
  );
}

/**
 * Edits one MFA policy: the platform default (no tenantId) or a tenant's own rule. Only platform
 * owners reach it; auth-api refuses everyone else on these routes.
 */
export function MfaPolicyEditor({ tenantId, onSaved }: { tenantId?: string; onSaved?: () => void }) {
  const { toast } = useToast();
  const { data, isLoading, isError } = useMfaPolicy(tenantId);
  const update = useUpdateMfaPolicy(tenantId);
  const [roles, setRoles] = useState<string[]>([]);
  const [allAccounts, setAllAccounts] = useState(false);
  const [inherit, setInherit] = useState(false);

  useEffect(() => {
    if (!data) return;
    // A tenant following the default starts from the rule in force, so switching the inherit
    // toggle off edits that rule rather than an empty one.
    const start = data.inherited ? data.effective : data.policy;
    setRoles(start.required_roles);
    setAllAccounts(start.all_accounts);
    setInherit(data.inherited);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (isError || !data) {
    return <p className="text-sm text-destructive py-4">{MFA_COPY.policyLoadFailed}</p>;
  }

  const toggleRole = (role: string, on: boolean) =>
    setRoles((current) => (on ? [...current.filter((r) => r !== role), role] : current.filter((r) => r !== role)));

  const editing = !tenantId || !inherit;

  const handleSave = () => {
    update.mutate(
      { required_roles: editing ? roles : [], all_accounts: editing ? allAccounts : false, inherit: tenantId ? inherit : undefined },
      {
        onSuccess: () => {
          toast({ title: 'Saved', description: MFA_COPY.policySaved });
          onSaved?.();
        },
        onError: (e: any) =>
          toast({ title: 'Error', description: e?.response?.data?.error ?? MFA_COPY.policySaveFailed, variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{MFA_COPY.policyEffective}: </span>
        {describePolicy(data.effective)}
        {data.inherited ? ` (${MFA_COPY.policyFollowing.toLowerCase()})` : ''}
      </p>

      {tenantId && (
        <div className="rounded-lg border px-5 py-2">
          <ToggleRow label={MFA_COPY.policyInherit} hint={MFA_COPY.policyInheritHint} checked={inherit} onChange={setInherit} />
        </div>
      )}

      {editing && (
        <>
          <div className="rounded-lg border px-5 py-2">
            <ToggleRow label={MFA_COPY.policyAllAccounts} hint={MFA_COPY.policyAllAccountsHint} checked={allAccounts} onChange={setAllAccounts} />
          </div>
          <div className="rounded-lg border px-5 py-3">
            <p className="text-sm font-medium mb-1">{MFA_COPY.policyRoles}</p>
            {data.available_roles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">{MFA_COPY.policyNoRoles}</p>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {data.available_roles.map((role) => (
                  <ToggleRow
                    key={role}
                    label={role}
                    checked={allAccounts || roles.includes(role)}
                    disabled={allAccounts}
                    onChange={(on) => toggleRole(role, on)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          {MFA_COPY.save}
        </Button>
      </div>
    </div>
  );
}
