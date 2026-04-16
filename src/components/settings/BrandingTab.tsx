'use client';

import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Image as ImageIcon,
  Palette,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const INDUSTRIES = [
  { value: 'food_delivery', label: 'Food Delivery' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'cafe_restaurant', label: 'Cafe & Restaurant' },
  { value: 'retail', label: 'Retail' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'services', label: 'Services' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'other', label: 'Other' },
];

export function BrandingTab() {
  const activeTenant = useAuthStore((state) => state.activeTenant);
  const [saving, setSaving] = useState(false);
  const [tenantData, setTenantData] = useState<any>(null);
  const { toast } = useToast();

  // Use React Query so loading/error/retry is handled cleanly and the
  // spinner clears whether the request succeeds, fails, or never fires
  // (e.g. user has no active tenant yet).
  const tenantQuery = useQuery({
    queryKey: ['tenant', activeTenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/tenants/${activeTenant?.id}`);
      return res.data;
    },
    enabled: !!activeTenant?.id,
    staleTime: 30_000,
  });

  // Sync server data into the editable local state exactly once per fetch.
  // React Query drives loading/error; local state only tracks user edits.
  useEffect(() => {
    if (tenantQuery.data && !tenantData) {
      setTenantData(tenantQuery.data);
    }
  }, [tenantQuery.data, tenantData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Filter empty strings from metadata to avoid overwriting existing values with blanks
      const cleanMetadata = tenantData.metadata
        ? Object.fromEntries(
            Object.entries(tenantData.metadata).filter(([, v]) => v !== '' && v != null)
          )
        : undefined;
      const payload = { ...tenantData, metadata: cleanMetadata };
      await api.put(`/api/v1/tenants/${activeTenant?.id}`, payload);
      toast({
        title: 'Success',
        description: 'Organization settings updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update organization.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setTenantData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateMetadata = (key: string, value: any) => {
    setTenantData((prev: any) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
  };

  if (!activeTenant?.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
        <AlertCircle className="h-8 w-8 text-amber-500" />
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          No active organisation selected
        </p>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          Pick an organisation from the tenant switcher to edit its branding.
        </p>
      </div>
    );
  }

  if (tenantQuery.isLoading && !tenantData) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tenantQuery.isError && !tenantData) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-12 text-center dark:border-rose-900/40 dark:bg-rose-950/30">
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          Could not load organisation details
        </p>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          {(tenantQuery.error as Error)?.message || 'Please try again.'}
        </p>
        <Button variant="outline" onClick={() => tenantQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const primaryColor = tenantData?.brand_colors?.primary || '#020617';
  const secondaryColor = tenantData?.brand_colors?.secondary || '#334155';
  const accentColor = tenantData?.brand_colors?.accent || '#0ea5e9';
  const logoUrl = tenantData?.logo_url || '';
  const orgName = tenantData?.name || tenantData?.slug || 'Your Organization';

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Live Brand Preview */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Live Preview
        </h3>
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Mock sidebar + header */}
          <div className="flex h-48">
            {/* Sidebar preview */}
            <div className="w-56 flex flex-col items-center py-6 px-4 gap-4" style={{ backgroundColor: primaryColor }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain rounded" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-white/70" />
                </div>
              )}
              <span className="text-white/90 text-sm font-bold truncate max-w-full">{orgName}</span>
              <div className="w-full space-y-2 mt-2">
                <div className="h-8 rounded-lg bg-white/15 px-3 flex items-center">
                  <span className="text-white/80 text-xs font-medium">Dashboard</span>
                </div>
                <div className="h-8 rounded-lg px-3 flex items-center" style={{ backgroundColor: accentColor + '33' }}>
                  <span className="text-white text-xs font-bold">Orders</span>
                </div>
                <div className="h-8 rounded-lg bg-white/10 px-3 flex items-center">
                  <span className="text-white/60 text-xs font-medium">Settings</span>
                </div>
              </div>
            </div>
            {/* Content area preview */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-24 rounded-lg" style={{ backgroundColor: primaryColor }}></div>
                <div className="h-8 w-20 rounded-lg" style={{ backgroundColor: secondaryColor, opacity: 0.4 }}></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-9 px-4 rounded-lg text-white text-xs font-bold flex items-center" style={{ backgroundColor: accentColor }}>
                  Action Button
                </div>
                <div className="h-9 px-4 rounded-lg border text-xs font-bold flex items-center" style={{ borderColor: secondaryColor, color: secondaryColor }}>
                  Secondary
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-medium mt-3 text-center">This preview shows how your brand colors appear in the application sidebar, header, and buttons across all services</p>
      </section>

      {/* Identity Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Organization Identity
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Organization Name</Label>
            <Input 
              value={tenantData?.name || ''} 
              onChange={(e) => updateField('name', e.target.value)}
              className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Handle (Slug)</Label>
            <div className="relative">
              <Input 
                value={tenantData?.slug || ''} 
                onChange={(e) => updateField('slug', e.target.value)}
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold pr-16" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Auto</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Industry / Use Case</Label>
            <select 
              value={tenantData?.use_case || ''}
              onChange={(e) => updateField('use_case', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm appearance-none cursor-pointer"
            >
              {INDUSTRIES.map(i => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Org size</Label>
            <select 
              value={tenantData?.org_size || ''}
              onChange={(e) => updateField('org_size', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm appearance-none cursor-pointer"
            >
              <option value="1-5">1-5 Employees</option>
              <option value="6-20">6-20 Employees</option>
              <option value="21-100">21-100 Employees</option>
              <option value="100+">100+ Employees</option>
            </select>
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Branding & Experience
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Brand Logo</Label>
             <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700">
               <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center p-2 shadow-sm relative group overflow-hidden">
                 {tenantData?.logo_url ? (
                   <img src={tenantData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                 ) : (
                   <ImageIcon className="w-8 h-8 text-slate-300" />
                 )}
               </div>
               <div className="flex-1 space-y-2">
                 <Input 
                   placeholder="Logo URL (PNG/SVG)" 
                   value={tenantData?.logo_url || ''}
                   onChange={(e) => updateField('logo_url', e.target.value)}
                   className="h-10 text-xs bg-white dark:bg-slate-900" 
                 />
                 <p className="text-[10px] text-slate-500 font-medium">Recommended: Transparent rectangular logo (512x128px)</p>
               </div>
             </div>
          </div>

          <div className="space-y-4">
             <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Theme Colors</Label>
             <div className="grid grid-cols-3 gap-4">
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Primary</span>
                   <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: tenantData?.brand_colors?.primary || '#020617' }}
                   />
                 </div>
                 <Input 
                   value={tenantData?.brand_colors?.primary || '#020617'}
                   onChange={(e) => updateField('brand_colors', { ...tenantData?.brand_colors, primary: e.target.value })}
                   className="h-10 font-mono text-xs text-center" 
                 />
               </div>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Secondary</span>
                   <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: tenantData?.brand_colors?.secondary || '#334155' }}
                   />
                 </div>
                 <Input 
                   value={tenantData?.brand_colors?.secondary || '#334155'}
                   onChange={(e) => updateField('brand_colors', { ...tenantData?.brand_colors, secondary: e.target.value })}
                   className="h-10 font-mono text-xs text-center" 
                 />
               </div>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Accent</span>
                   <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: tenantData?.brand_colors?.accent || '#0ea5e9' }}
                   />
                 </div>
                 <Input 
                   value={tenantData?.brand_colors?.accent || '#0ea5e9'}
                   onChange={(e) => updateField('brand_colors', { ...tenantData?.brand_colors, accent: e.target.value })}
                   className="h-10 font-mono text-xs text-center" 
                 />
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Typography & Advanced Styling */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Typography & Styling
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Brand Font</Label>
            <select
              value={tenantData?.metadata?.font_family || 'Inter'}
              onChange={(e) => updateMetadata('font_family', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm appearance-none cursor-pointer"
            >
              <option value="Inter">Inter (Default)</option>
              <option value="Geist Mono">Geist Mono</option>
              <option value="Outfit">Outfit</option>
              <option value="Poppins">Poppins</option>
              <option value="DM Sans">DM Sans</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
            </select>
            <p className="text-[10px] text-slate-500 font-medium">Font used in emails, invoices, and branded pages</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Custom CSS (Advanced)</Label>
            <textarea
              value={tenantData?.metadata?.custom_css || ''}
              onChange={(e) => updateMetadata('custom_css', e.target.value)}
              placeholder="/* Custom styles for branded pages */"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-mono text-xs resize-none"
            />
            <p className="text-[10px] text-slate-500 font-medium">Applies to email templates and public-facing branded pages</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Public Contact Detail
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Support Email</Label>
            <div className="relative">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <Input 
                value={tenantData?.contact_email || ''}
                onChange={(e) => updateField('contact_email', e.target.value)}
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold pl-12" 
               />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Support Phone</Label>
            <div className="relative">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <Input 
                value={tenantData?.contact_phone || ''}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold pl-12" 
               />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Website URL</Label>
            <Input 
                value={tenantData?.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold" 
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4 pb-12">
        <Button 
          type="submit" 
          disabled={saving}
          className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Save Layout & Branding
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
