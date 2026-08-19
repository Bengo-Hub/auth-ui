'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Loader2, MapPin, Pencil, Plus, Store, X } from 'lucide-react';
import { useState } from 'react';
import { outletsPath, type TenantOutlet } from './shared';

/** Reads the branch's own contact phone/email out of its free-form metadata (the
 *  `contact_phones: [{label, value}]` convention pos-api's receipt printer already reads). */
function branchContact(o: Pick<TenantOutlet, 'metadata'>) {
  const meta = o.metadata ?? {};
  const phones = Array.isArray(meta.contact_phones) ? meta.contact_phones as { label?: string; value?: string }[] : [];
  const phone = phones.find((p) => p?.value)?.value ?? '';
  const email = typeof meta.contact_email === 'string' ? meta.contact_email : '';
  return { phone, email };
}

// Authoritative outlet use_case list — MUST match auth-api usecase.KnownUseCases.
// The chosen use case controls which downstream services (POS, inventory, logistics,
// ISP, TruLoad …) the branch syncs to, so surface human labels but send the raw value.
const OUTLET_USE_CASES: { value: string; label: string }[] = [
  { value: 'hospitality', label: 'Hospitality — restaurant / café / bar' },
  { value: 'retail', label: 'Retail — shop / supermarket' },
  { value: 'quick_service', label: 'Quick Service — fast food / takeaway' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'hospital', label: 'Hospital / Clinic' },
  { value: 'services', label: 'Services' },
  { value: 'warehouse', label: 'Warehouse / stock only' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'logistics', label: 'Logistics / delivery' },
  { value: 'commercial_weighing', label: 'Commercial Weighing' },
  { value: 'axle_load_enforcement', label: 'Axle Load Enforcement' },
  { value: 'isp', label: 'ISP / Hotspot' },
];

// ── Branches / Outlets ───────────────────────────────────────────────────────

const emptyBranchForm = {
  code: '', name: '', use_case: 'retail', address: '', is_hq: false, status: 'active',
  contact_phone: '', contact_email: '',
};
type BranchForm = typeof emptyBranchForm;

export function BranchesTab({ tenantSlug }: { tenantSlug: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: outlets = [], isLoading } = useQuery<TenantOutlet[]>({
    queryKey: ['tenant-outlets', tenantSlug],
    queryFn: async () => {
      const res = await apiClient.get(outletsPath(tenantSlug));
      const raw = (res as { data?: unknown }).data ?? res;
      return Array.isArray(raw) ? raw as TenantOutlet[] : [];
    },
    enabled: !!tenantSlug,
    staleTime: 5 * 60 * 1000,
  });

  // null = closed, {} (no id) = creating, {id…} = editing an existing outlet.
  const [editing, setEditing] = useState<TenantOutlet | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyBranchForm);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tenant-outlets', tenantSlug] });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyBranchForm);
    setFormOpen(true);
  };

  const openEdit = (o: TenantOutlet) => {
    setEditing(o);
    const { phone, email } = branchContact(o);
    setForm({
      code: o.code ?? '',
      name: o.name ?? '',
      use_case: o.use_case ?? 'retail',
      address: o.address ?? '',
      is_hq: !!o.is_hq,
      status: o.status ?? 'active',
      contact_phone: phone,
      contact_email: email,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast({ title: 'Code and name are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      // Merge into whatever metadata this branch already has (never authored via this form,
      // e.g. set by a script) so saving contact details doesn't clobber unrelated keys.
      const metadata = {
        ...(editing?.metadata ?? {}),
        contact_phones: form.contact_phone.trim() ? [{ label: 'Branch', value: form.contact_phone.trim() }] : [],
        contact_email: form.contact_email.trim() || undefined,
      };
      if (editing) {
        // Backend UpdateOutlet ignores code (immutable) — send the editable fields only.
        await apiClient.put(`${outletsPath(tenantSlug)}/${editing.id}`, {
          name: form.name.trim(),
          use_case: form.use_case,
          address: form.address.trim(),
          status: form.status,
          is_hq: form.is_hq,
          metadata,
        });
        toast({ title: `Branch "${form.name}" updated` });
      } else {
        await apiClient.post(outletsPath(tenantSlug), {
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          use_case: form.use_case,
          address: form.address.trim(),
          is_hq: form.is_hq,
          metadata,
        });
        toast({ title: `Branch "${form.name}" created` });
      }
      await invalidate();
      closeForm();
    } catch (err) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } }).response;
      const status = response?.status;
      let msg = 'Failed to save branch';
      if (status === 409) msg = 'A branch with that code already exists';
      else if (status === 403) msg = 'You do not have permission to manage branches';
      else if (status === 422) msg = 'Invalid use case for this branch';
      // Structural plan limit (max_outlets) — server message already names the limit; falls back
      // to a generic upgrade prompt if the body shape ever changes.
      else if (status === 402) msg = response?.data?.message ?? "You've reached your plan's outlet limit. Upgrade your plan to add more outlets.";
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (o: TenantOutlet) => {
    if (o.is_hq) {
      toast({ title: 'The HQ branch cannot be archived', variant: 'destructive' });
      return;
    }
    if (!confirm(`Archive branch "${o.name}"? Staff assigned here will need reassigning.`)) return;
    try {
      await apiClient.delete(`${outletsPath(tenantSlug)}/${o.id}`);
      toast({ title: `Branch "${o.name}" archived` });
      await invalidate();
    } catch {
      toast({ title: 'Failed to archive branch', variant: 'destructive' });
    }
  };

  const activeOutlets = outlets.filter((o) => o.status !== 'archived');
  const archivedOutlets = outlets.filter((o) => o.status === 'archived');
  const useCaseLabel = (v?: string) => OUTLET_USE_CASES.find((u) => u.value === v)?.label ?? v ?? '—';

  return (
    <div className="space-y-8">
      {/* Header + add button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Branches &amp; Outlets
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Each branch is a physical location (shop, café, warehouse…). Staff, POS tills, stock and
            reporting are scoped per branch. The chosen use case controls which apps the branch syncs to.
          </p>
        </div>
        <Button onClick={openCreate}
          className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 gap-2">
          <Plus className="h-4 w-4" /> Add Branch
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : activeOutlets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Store className="h-10 w-10 text-slate-300" />
          <p className="text-slate-500 font-medium">No branches yet.</p>
          <p className="text-sm text-slate-400">Add your first branch to start assigning staff and tills.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeOutlets.map((o) => (
            <div key={o.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{o.name}</h3>
                    {o.is_hq && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">HQ</span>
                    )}
                    {o.status && o.status !== 'active' && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{o.status}</span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{o.code}</p>
                  <p className="text-xs text-slate-500 mt-2">{useCaseLabel(o.use_case)}</p>
                  {o.address && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.address}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(o)} title="Edit branch"
                    className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  {!o.is_hq && (
                    <button onClick={() => handleArchive(o)} title="Archive branch"
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {archivedOutlets.length > 0 && (
        <details className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
          <summary className="text-xs font-bold uppercase tracking-widest text-slate-400 cursor-pointer">
            Archived branches ({archivedOutlets.length})
          </summary>
          <ul className="mt-3 space-y-1">
            {archivedOutlets.map((o) => (
              <li key={o.id} className="text-sm text-slate-400 flex items-center gap-2">
                <Archive className="h-3 w-3" /> {o.name} <span className="font-mono text-xs">({o.code})</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Create / Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeForm}>
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editing ? 'Edit Branch' : 'Add Branch'}
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Branch Name</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Westlands Branch"
                    className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Code</Label>
                  <Input required value={form.code} disabled={!!editing}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="WESTLANDS"
                    className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono uppercase disabled:opacity-60" />
                  {editing && <p className="text-[11px] text-slate-400">Code can’t be changed after creation.</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Type / Use Case</Label>
                <select value={form.use_case} onChange={(e) => setForm({ ...form, use_case: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                  {OUTLET_USE_CASES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Address (optional)</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Waiyaki Way, Nairobi"
                  className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact Phone (optional)</Label>
                  <Input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="0712 345 678"
                    className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                  <p className="text-[11px] text-slate-400">Shown on this branch&apos;s receipts. Falls back to the tenant&apos;s general contact if left blank.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contact Email (optional)</Label>
                  <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    placeholder="branch@example.com"
                    className="h-12 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                </div>
              </div>
              {editing && (
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_hq} onChange={(e) => setForm({ ...form, is_hq: e.target.checked })}
                  className="h-5 w-5 rounded-md accent-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Set as HQ / main branch <span className="text-slate-400">(only one branch can be HQ)</span>
                </span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="h-11 px-5 rounded-2xl">Cancel</Button>
                <Button type="submit" disabled={saving}
                  className="h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Save Changes' : 'Create Branch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
