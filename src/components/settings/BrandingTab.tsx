'use client';

import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { IdentitySection } from './branding/identity-section';
import { VisualBrandSection } from './branding/visual-brand-section';
import { TypographySection } from './branding/typography-section';
import { ContactSection } from './branding/contact-section';
import { TaxComplianceSection } from './branding/tax-compliance-section';
import { EtimsSection } from './branding/etims-section';
import { LivePreview } from './branding/live-preview';

export function BrandingTab() {
  const activeTenant = useAuthStore((state) => state.activeTenant);
  const [saving, setSaving] = useState(false);
  const [tenantData, setTenantData] = useState<any>(null);
  const { toast } = useToast();

  const tenantQuery = useQuery({
    queryKey: ['tenant', activeTenant?.slug],
    queryFn: async () => {
      const res = await api.get(
        `/api/v1/tenants/by-slug/${activeTenant?.slug}`,
      );
      return res.data;
    },
    enabled: !!activeTenant?.slug,
    staleTime: 30_000,
  });

  // Re-syncs whenever the query actually resolves NEW data (a fresh load, or
  // switching to a different organisation via the tenant switcher) rather
  // than only once ever -- the previous `!tenantData` guard meant switching
  // tenants kept showing the PREVIOUS tenant's branding data indefinitely,
  // since tenantData was already truthy from the first load and never
  // re-synced. User edits since the last sync are intentionally not
  // preserved across a tenant switch (they belong to the old tenant).
  useEffect(() => {
    if (tenantQuery.data) {
      setTenantData(tenantQuery.data);
    }
  }, [tenantQuery.data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const cleanMetadata = tenantData.metadata
        ? Object.fromEntries(
            Object.entries(tenantData.metadata).filter(
              ([, v]) => v !== '' && v != null,
            ),
          )
        : undefined;
      const payload = { ...tenantData, metadata: cleanMetadata };
      await api.put(`/api/v1/admin/tenants/${tenantData?.id || activeTenant?.id}`, payload);
      toast({
        title: 'Saved',
        description: 'Organization branding updated successfully.',
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

  if (!activeTenant?.slug) {
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
        <Button variant="outline" onClick={() => tenantQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const primaryColor =
    tenantData?.brand_colors?.primary || '#020617';
  const secondaryColor =
    tenantData?.brand_colors?.secondary || '#334155';
  const accentColor =
    tenantData?.brand_colors?.accent || '#0ea5e9';
  const logoUrl = tenantData?.logo_url || '';
  const orgName =
    tenantData?.name || tenantData?.slug || 'Your Organization';

  return (
    <form
      onSubmit={handleSave}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      {/* Top: two-column — preview on the right, always visible */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: editable sections */}
        <div className="lg:col-span-3 space-y-8">
          <IdentitySection tenantData={tenantData} updateField={updateField} updateMetadata={updateMetadata} />
          <VisualBrandSection
            tenantData={tenantData}
            updateField={updateField}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
          />
          <TypographySection tenantData={tenantData} updateMetadata={updateMetadata} />
          <ContactSection tenantData={tenantData} updateField={updateField} />
          <TaxComplianceSection tenantData={tenantData} updateField={updateField} />
          <EtimsSection tenantData={tenantData} />
        </div>

        {/* Right: sticky real-time preview */}
        <div className="lg:col-span-2">
          <LivePreview
            orgName={orgName}
            logoUrl={logoUrl}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
          />
        </div>
      </div>

      <div className="flex justify-end pb-12">
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
              Save Branding
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
