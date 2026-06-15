'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { usePasswordPolicy, useUpdatePasswordPolicy, type PasswordPolicy } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const DEFAULTS: PasswordPolicy = {
  min_length: 8,
  require_upper: true,
  require_lower: true,
  require_digit: true,
  require_symbol: false,
  expiry_days: 0,
  reuse_block_count: 0,
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function PasswordPolicyPage() {
  const { toast } = useToast();
  const { data, isLoading } = usePasswordPolicy();
  const update = useUpdatePasswordPolicy();
  const [form, setForm] = useState<PasswordPolicy>(DEFAULTS);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = <K extends keyof PasswordPolicy>(key: K, value: PasswordPolicy[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    update.mutate(form, {
      onSuccess: () => toast({ title: 'Saved', description: 'Password policy updated. New rules apply on the next password change.' }),
      onError: (e: any) =>
        toast({ title: 'Error', description: e?.response?.data?.error ?? 'Failed to update policy.', variant: 'destructive' }),
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <KeyRound className="h-6 w-6" /> Password Policy
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide password requirements. Rules are enforced on the next password set, change, or reset —
          they never retroactively lock out existing users.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Minimum length</Label>
                <Input
                  type="number"
                  min={4}
                  max={128}
                  value={form.min_length}
                  onChange={(e) => set('min_length', Math.max(4, parseInt(e.target.value || '0', 10) || 0))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry (days, 0 = never)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.expiry_days}
                  onChange={(e) => set('expiry_days', Math.max(0, parseInt(e.target.value || '0', 10) || 0))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reuse block count (0 = disabled)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.reuse_block_count}
                  onChange={(e) => set('reuse_block_count', Math.max(0, parseInt(e.target.value || '0', 10) || 0))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-5">
            <ToggleRow
              label="Require uppercase letter"
              description="At least one A–Z character."
              checked={form.require_upper}
              onChange={(v) => set('require_upper', v)}
            />
            <ToggleRow
              label="Require lowercase letter"
              description="At least one a–z character."
              checked={form.require_lower}
              onChange={(v) => set('require_lower', v)}
            />
            <ToggleRow
              label="Require digit"
              description="At least one 0–9 character."
              checked={form.require_digit}
              onChange={(v) => set('require_digit', v)}
            />
            <ToggleRow
              label="Require symbol"
              description="At least one non-alphanumeric character."
              checked={form.require_symbol}
              onChange={(v) => set('require_symbol', v)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save policy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
