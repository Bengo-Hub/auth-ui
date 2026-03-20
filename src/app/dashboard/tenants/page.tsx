'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  ExternalLink,
  Loader2,
  Plus,
  Settings,
  ShieldCheck,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react';
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant, Tenant } from '@/hooks/use-dashboard-api';
import { TenantMembersDialog } from '@/components/tenant/tenant-members-dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function CreateOrgDialog() {
  const { toast } = useToast();
  const createTenant = useCreateTenant();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [useCase, setUseCase] = useState('');
  const [contactEmail, setContactEmail] = useState('');
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

    createTenant.mutate({ name, slug, use_case: useCase, contact_email: contactEmail }, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Organization created successfully.' });
        setOpen(false);
        setName('');
        setSlug('');
        setUseCase('');
        setContactEmail('');
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
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Contact Email</Label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@acme.com" />
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant.mutate({ id: tenant.id, name, slug, use_case: useCase, contact_email: contactEmail }, {
      onSuccess: () => {
        toast({ title: 'Updated', description: 'Organization updated successfully.' });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
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
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Contact Email</Label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@acme.com" />
            </div>
          </div>
          <Button type="submit" disabled={updateTenant.isPending} className="w-full h-12 rounded-xl text-white font-bold">
            {updateTenant.isPending ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const deleteTenant = useDeleteTenant();
  const { toast } = useToast();
  const setActiveTenant = useAuthStore((state) => state.setActiveTenant);
  
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [managingMembers, setManagingMembers] = useState<Tenant | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-bold text-slate-400">Loading your organizations...</p>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 gap-6">
        {tenants && tenants.length > 0 ? (
          tenants.map((tenant, idx) => (
            <motion.div
              key={tenant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-500 shadow-sm overflow-hidden">
                    <Building2 className="h-10 w-10 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                      {tenant.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-bold text-sm tracking-tighter uppercase">ID: {tenant.id.slice(0, 8)}...</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-primary font-bold text-sm tracking-tighter uppercase">{tenant.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TenantMembersDialog tenantId={tenant.id} tenantName={tenant.name} />
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">
                    <Settings className="h-4 w-4 mr-2 text-slate-400" />
                    Dashboard
                  </Button>
                  <Button 
                    onClick={() => handleSwitch(tenant)}
                    className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold transition-all shadow-lg hover:shadow-xl"
                  >
                    Switch Context <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                      <DropdownMenuItem onClick={() => setEditingTenant(tenant)} className="rounded-xl p-3 cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingTenant(tenant)} className="rounded-xl p-3 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Organization
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-24 rounded-[4rem] bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <Plus className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Initialize Ecosystem</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10">
              You haven't added any organizations yet. Start by creating your first business workspace.
            </p>
            <CreateOrgDialog />
          </div>
        )}
      </div>

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

