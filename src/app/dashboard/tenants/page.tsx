'use client';

import { useMemo, useState } from 'react';
import {
  Loader2,
  Plus,
  ShieldCheck,
  ArrowRight,
  Clock,
  Check,
  X,
} from 'lucide-react';
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useProvisionTenantOAuthRedirects,
  usePendingTenants,
  useApproveTenant,
  useRejectTenant,
  Tenant,
} from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { DataTable } from '@bengo-hub/shared-ui-lib/data-table';
import { buildTenantColumns } from './tenants-columns';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// SERVICE_IDS maps display labels to the service_urls key used in tenant metadata.
const SERVICE_IDS = [
  { id: 'truload', label: 'TruLoad (Weighbridge)' },
  { id: 'ordering', label: 'Food Ordering' },
  { id: 'pos', label: 'Point of Sale' },
  { id: 'logistics', label: 'Logistics / Fleet' },
  { id: 'inventory', label: 'Inventory' },
];

function CreateOrgDialog() {
  const { toast } = useToast();
  const createTenant = useCreateTenant();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [useCase, setUseCase] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const metadata: Record<string, any> = {};
    if (appUrl) metadata['app_url'] = appUrl;

    createTenant.mutate({ name, slug, use_case: useCase, contact_email: contactEmail, ...(Object.keys(metadata).length > 0 ? { metadata } : {}) }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Organization created successfully.' });
        setOpen(false);
        setName('');
        setSlug('');
        setUseCase('');
        setContactEmail('');
        setAppUrl('');
      },
      onError: (err: any) => {
        setError(err.response?.data?.error || 'Failed to create organization');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5 mr-2" /> Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Organization</DialogTitle>
          <DialogDescription>Add a new organization to your ecosystem.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Organization Name *</Label>
              <Input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="Acme Corp" required />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={slug} onChange={e => { setSlugManuallyEdited(true); setSlug(slugify(e.target.value)); }} placeholder="acme-corp" required />
              <p className="text-[11px] text-muted-foreground">Used in URLs and API calls</p>
            </div>
            <div className="space-y-2">
              <Label>Use Case</Label>
              <select
                value={useCase}
                onChange={e => setUseCase(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Select type...</option>
                <option value="ordering">Food Ordering</option>
                <option value="pos">Point of Sale</option>
                <option value="weighbridge">Weighbridge / TruLoad</option>
                <option value="isp">ISP Billing</option>
                <option value="erp">ERP</option>
                <option value="developer_external">Developer / API Partner</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Contact Email</Label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@acme.com" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>App URL</Label>
              <Input value={appUrl} onChange={e => setAppUrl(e.target.value)} placeholder="https://app.yourdomain.com" />
              <p className="text-[11px] text-muted-foreground">Default deployed app URL for email links (e.g. welcome, password reset)</p>
            </div>
          </div>
          <Button type="submit" disabled={createTenant.isPending || !name || !slug} className="w-full h-12 rounded-xl text-white font-bold">
            {createTenant.isPending ? <Loader2 className="animate-spin" /> : 'Create Organization'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditOrgDialog({ tenant, open, onOpenChange }: { tenant: Tenant; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const updateTenant = useUpdateTenant();
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [useCase, setUseCase] = useState(tenant.use_case || '');
  const [contactEmail, setContactEmail] = useState(tenant.contact_email || '');
  const [appUrl, setAppUrl] = useState<string>(tenant.metadata?.app_url ?? '');
  // Per-service URLs: each entry is { service_id, url }
  const initServiceUrls = (): { id: string; url: string }[] => {
    const svcMap: Record<string, string> = tenant.metadata?.service_urls ?? {};
    return SERVICE_IDS.map(s => ({ id: s.id, url: svcMap[s.id] ?? '' }));
  };
  const [serviceUrls, setServiceUrls] = useState<{ id: string; url: string }[]>(initServiceUrls);

  const handleServiceUrlChange = (serviceId: string, value: string) => {
    setServiceUrls(prev => prev.map(s => s.id === serviceId ? { ...s, url: value } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const svcUrlsMap: Record<string, string> = {};
    serviceUrls.forEach(({ id, url }) => { if (url) svcUrlsMap[id] = url; });
    const metadata: Record<string, any> = {};
    if (appUrl) metadata['app_url'] = appUrl;
    if (Object.keys(svcUrlsMap).length > 0) metadata['service_urls'] = svcUrlsMap;

    updateTenant.mutate({ id: tenant.id, name, slug, use_case: useCase, contact_email: contactEmail, ...(Object.keys(metadata).length > 0 ? { metadata } : {}) }, {
      onSuccess: () => {
        toast({ title: 'Updated', description: 'Organization updated successfully.' });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Organization</DialogTitle>
          <DialogDescription>Update organization details for {tenant.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Organization Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Use Case</Label>
              <select
                value={useCase}
                onChange={e => setUseCase(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Select type...</option>
                <option value="ordering">Food Ordering</option>
                <option value="pos">Point of Sale</option>
                <option value="weighbridge">Weighbridge / TruLoad</option>
                <option value="isp">ISP Billing</option>
                <option value="erp">ERP</option>
                <option value="developer_external">Developer / API Partner</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Contact Email</Label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@acme.com" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>App URL</Label>
              <Input value={appUrl} onChange={e => setAppUrl(e.target.value)} placeholder="https://app.yourdomain.com" />
              <p className="text-[11px] text-muted-foreground">Default deployed app URL for email links (welcome, password reset). Used when no per-service URL is set.</p>
            </div>
          </div>

          {/* Per-service URLs */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-bold">Per-Service App URLs</Label>
              <p className="text-[11px] text-muted-foreground mt-1">Override the default App URL for specific services. Email links will use the matching service URL when available.</p>
            </div>
            {serviceUrls.map(({ id, url }) => {
              const label = SERVICE_IDS.find(s => s.id === id)?.label ?? id;
              return (
                <div key={id} className="grid grid-cols-[140px_1fr] gap-2 items-center">
                  <span className="text-xs font-semibold text-slate-500 truncate">{label}</span>
                  <Input
                    value={url}
                    onChange={e => handleServiceUrlChange(id, e.target.value)}
                    placeholder={`https://${id}.yourdomain.com`}
                    className="text-sm"
                  />
                </div>
              );
            })}
          </div>

          <Button type="submit" disabled={updateTenant.isPending} className="w-full h-12 rounded-xl text-white font-bold">
            {updateTenant.isPending ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RejectTenantDialog({ tenant, open, onOpenChange }: { tenant: Tenant; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const rejectTenant = useRejectTenant();
  const [reason, setReason] = useState('');

  const handleReject = () => {
    rejectTenant.mutate({ id: tenant.id, reason: reason.trim() || undefined }, {
      onSuccess: () => {
        toast({ title: 'Registration declined', description: `${tenant.name} will not be able to sign in.` });
        onOpenChange(false);
        setReason('');
      },
      onError: () => {
        toast({ title: 'Failed to decline registration', variant: 'destructive' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Decline registration?</DialogTitle>
          <DialogDescription>
            <span className="font-bold text-slate-900 dark:text-white">{tenant.name}</span> will not be able to sign in.
            You can optionally note why, for your own records.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <Label>Reason (optional)</Label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. duplicate of an existing account, suspected fraud..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-xl font-bold flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={rejectTenant.isPending}
            className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 flex-1"
          >
            {rejectTenant.isPending ? <Loader2 className="animate-spin" /> : 'Decline Registration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PendingApprovalsSection() {
  const { data: pending, isLoading } = usePendingTenants();
  const approveTenant = useApproveTenant();
  const { toast } = useToast();
  const [rejecting, setRejecting] = useState<Tenant | null>(null);

  if (isLoading || !pending || pending.length === 0) return null;

  const handleApprove = (tenant: Tenant) => {
    approveTenant.mutate(tenant.id, {
      onSuccess: () => {
        toast({ title: 'Organization approved', description: `${tenant.name} can now sign in.` });
      },
      onError: () => {
        toast({ title: 'Failed to approve organization', variant: 'destructive' });
      },
    });
  };

  return (
    <section className="rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Pending Approval ({pending.length})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New self-registered organizations awaiting your review before their team can sign in.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {pending.map((t) => (
          <div
            key={t.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                /{t.slug} · registered {new Date(t.created_at).toLocaleDateString()}
                {t.contact_email ? ` · ${t.contact_email}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejecting(t)}
                className="h-9 rounded-lg font-bold text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20"
              >
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(t)}
                disabled={approveTenant.isPending}
                className="h-9 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
      {rejecting && (
        <RejectTenantDialog tenant={rejecting} open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)} />
      )}
    </section>
  );
}

export default function TenantsPage() {
  const { data: tenants, isLoading, isError, refetch } = useTenants();
  const deleteTenant = useDeleteTenant();
  const provisionRedirects = useProvisionTenantOAuthRedirects();
  const { toast } = useToast();
  const setActiveTenant = useAuthStore((state) => state.setActiveTenant);

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  const handleSwitch = (tenant: Tenant) => {
    setActiveTenant({ id: tenant.id, name: tenant.name, slug: tenant.slug });
    toast({
      title: 'Context Switched',
      description: `Now acting as ${tenant.name}`,
    });
  };

  const handleDelete = () => {
    if (!deletingTenant) return;
    deleteTenant.mutate(deletingTenant.id, {
      onSuccess: () => {
        toast({ title: 'Deleted', description: 'Organization has been removed.' });
        setDeletingTenant(null);
      }
    });
  };

  const handleProvisionRedirects = (tenant: Tenant) => {
    provisionRedirects.mutate(tenant.id, {
      onSuccess: () => {
        toast({
          title: 'OAuth Redirects Provisioned',
          description: `Login redirect URIs for /${tenant.slug}/auth/callback registered on all OAuth clients.`,
        });
      },
      onError: () => {
        toast({ title: 'Provisioning failed', variant: 'destructive' });
      },
    });
  };

  const columns = useMemo(
    () =>
      buildTenantColumns({
        onSwitch: handleSwitch,
        onEdit: setEditingTenant,
        onDelete: setDeletingTenant,
        onProvisionRedirects: handleProvisionRedirects,
        provisionPending: provisionRedirects.isPending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [provisionRedirects.isPending],
  );

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Organizations</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Manage your organizations, switch context, and control team memberships.
          </p>
        </div>
        <CreateOrgDialog />
      </header>

      <PendingApprovalsSection />

      <DataTable
        columns={columns}
        rows={tenants ?? []}
        rowKey={(t) => t.id}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyText="You haven't added any organizations yet. Create one to get started."
        storageKey="dashboard-tenants-col-prefs"
      />

      {editingTenant && (
        <EditOrgDialog 
          tenant={editingTenant} 
          open={!!editingTenant} 
          onOpenChange={(open) => !open && setEditingTenant(null)} 
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deletingTenant} onOpenChange={(open) => !open && setDeletingTenant(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-rose-600">Hold on!</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{deletingTenant?.name}</span>? 
              This action cannot be undone and will permanently remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeletingTenant(null)} className="h-12 rounded-xl font-bold flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 flex-1"
            >
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enterprise Banner */}
      <section className="p-16 rounded-[4rem] bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-widest mb-8">
            <ShieldCheck className="h-4 w-4" /> Enterprise Support
          </div>
          <h2 className="text-4xl font-black mb-6">Scale without limits.</h2>
          <p className="text-slate-400 text-xl font-light leading-relaxed mb-10">
            Get dedicated infrastructure, 99.99% SLA, and custom audit trails 
            tailored for high-growth enterprises.
          </p>
          <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black text-lg transition-all shadow-xl">
            Upgrade to Enterprise <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[160px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] -mb-32" />
      </section>
    </div>
  );
}

