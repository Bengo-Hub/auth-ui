'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, Save, ShieldCheck } from 'lucide-react';
import {
  useRole,
  usePermissionsCatalogue,
  useSetRolePermissions,
} from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function RolePermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roleCode = decodeURIComponent(String(params?.role_code ?? ''));

  const { data: detail, isLoading: roleLoading } = useRole(roleCode);
  const { data: groups, isLoading: catLoading } = usePermissionsCatalogue();
  const setPerms = useSetRolePermissions();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Seed the selection from the role's current permissions once loaded.
  useEffect(() => {
    if (detail?.permission_codes) {
      setSelected(new Set(detail.permission_codes));
    }
  }, [detail?.permission_codes]);

  const locked = !!detail?.role?.is_wildcard;

  const allCodes = useMemo(() => {
    const codes: string[] = [];
    (groups ?? []).forEach((g) => g.modules.forEach((m) => m.permissions.forEach((p) => codes.push(p.code))));
    return codes;
  }, [groups]);

  const toggle = (code: string) => {
    if (locked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (codes: string[], on: boolean) => {
    if (locked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => (on ? next.add(c) : next.delete(c)));
      return next;
    });
  };

  const handleSave = () => {
    setPerms.mutate(
      { code: roleCode, permissionCodes: Array.from(selected) },
      {
        onSuccess: () => toast({ title: 'Saved', description: 'Role permissions updated.' }),
        onError: (e: any) =>
          toast({
            title: 'Error',
            description: e?.response?.data?.error ?? 'Failed to update permissions.',
            variant: 'destructive',
          }),
      }
    );
  };

  const isLoading = roleLoading || catLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/platform/roles" className="inline-flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Roles
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            {detail?.role?.name ?? roleCode}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-mono">{roleCode}</p>
          {detail?.role?.description && (
            <p className="text-muted-foreground text-sm mt-1">{detail.role.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{selected.size} / {allCodes.length} selected</span>
          <Button onClick={handleSave} disabled={locked || setPerms.isPending}>
            {setPerms.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      {locked && (
        <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Lock className="h-4 w-4 shrink-0" />
          This is a wildcard role (superuser / admin / superusers). It always resolves to every permission and
          its permission set is managed by the platform — editing is disabled.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {(groups ?? []).map((group) => (
            <div key={group.service} className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide">
                {group.service}
              </div>
              <div className="divide-y">
                {group.modules.map((mod) => {
                  const codes = mod.permissions.map((p) => p.code);
                  const allOn = codes.every((c) => selected.has(c));
                  return (
                    <div key={mod.module} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{mod.module}</span>
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => toggleModule(codes, !allOn)}
                          className="text-xs text-primary hover:underline disabled:opacity-40 disabled:no-underline"
                        >
                          {allOn ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {mod.permissions.map((p) => {
                          const checked = locked || selected.has(p.code);
                          return (
                            <label
                              key={p.code}
                              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${
                                checked ? 'border-primary/50 bg-primary/5' : 'border-input'
                              } ${locked ? 'cursor-not-allowed opacity-70' : ''}`}
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                checked={checked}
                                disabled={locked}
                                onChange={() => toggle(p.code)}
                              />
                              <span className="truncate" title={p.code}>{p.action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
