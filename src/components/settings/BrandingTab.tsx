'use client';

import { useAuthStore } from '@/store/auth-store';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  Upload,
  X,
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

function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') onChange(e.target.result);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        {value ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="max-h-24 max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Drop an image or <span className="text-primary">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                PNG, SVG, JPG — max 512 KB
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      <Input
        placeholder="or paste an image URL"
        value={value?.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-none"
      />
      {hint && (
        <p className="text-[10px] text-slate-500 font-medium">{hint}</p>
      )}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 font-mono text-xs flex-1"
        />
      </div>
    </div>
  );
}

function LivePreview({
  orgName,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
}: {
  orgName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}) {
  return (
    <div className="sticky top-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">
          Live Preview
        </span>
      </div>
      <div className="flex h-52">
        <div
          className="w-44 flex flex-col items-center py-5 px-3 gap-3 shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="h-8 w-auto object-contain rounded"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-white/70" />
            </div>
          )}
          <span className="text-white/90 text-xs font-bold truncate max-w-full">
            {orgName}
          </span>
          <div className="w-full space-y-1.5 mt-1">
            <div className="h-7 rounded-lg bg-white/15 px-2 flex items-center">
              <span className="text-white/80 text-[10px] font-medium">
                Dashboard
              </span>
            </div>
            <div
              className="h-7 rounded-lg px-2 flex items-center"
              style={{ backgroundColor: accentColor + '44' }}
            >
              <span className="text-white text-[10px] font-bold">Orders</span>
            </div>
            <div className="h-7 rounded-lg bg-white/10 px-2 flex items-center">
              <span className="text-white/60 text-[10px] font-medium">
                Settings
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-6 w-16 rounded-md"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="h-6 w-12 rounded-md opacity-40"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-2.5 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-3 flex gap-2">
            <div
              className="h-7 px-3 rounded-lg text-white text-[10px] font-bold flex items-center"
              style={{ backgroundColor: accentColor }}
            >
              Action
            </div>
            <div
              className="h-7 px-3 rounded-lg border text-[10px] font-bold flex items-center"
              style={{ borderColor: secondaryColor, color: secondaryColor }}
            >
              Secondary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (tenantQuery.data && !tenantData) {
      setTenantData(tenantQuery.data);
    }
  }, [tenantQuery.data, tenantData]);

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
          {/* Identity */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organisation Identity
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Name
                </Label>
                <Input
                  value={tenantData?.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Handle (slug)
                </Label>
                <Input
                  value={tenantData?.slug || ''}
                  disabled
                  className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold opacity-60"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Industry
                </Label>
                <select
                  value={tenantData?.use_case || ''}
                  onChange={(e) => updateField('use_case', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm appearance-none cursor-pointer"
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Org size
                </Label>
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

          {/* Visual brand */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Visual Brand
            </h3>
            <div className="grid sm:grid-cols-2 gap-8">
              <ImageUploadField
                label="Brand Logo"
                value={tenantData?.logo_url || ''}
                onChange={(v) => updateField('logo_url', v)}
                hint="Transparent rectangular logo (512 x 128 px recommended)"
              />
              <div className="space-y-6">
                <ColorField
                  label="Primary"
                  value={primaryColor}
                  onChange={(v) =>
                    updateField('brand_colors', {
                      ...tenantData?.brand_colors,
                      primary: v,
                    })
                  }
                />
                <ColorField
                  label="Secondary"
                  value={secondaryColor}
                  onChange={(v) =>
                    updateField('brand_colors', {
                      ...tenantData?.brand_colors,
                      secondary: v,
                    })
                  }
                />
                <ColorField
                  label="Accent"
                  value={accentColor}
                  onChange={(v) =>
                    updateField('brand_colors', {
                      ...tenantData?.brand_colors,
                      accent: v,
                    })
                  }
                />
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Typography
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Brand Font
                </Label>
                <select
                  value={tenantData?.metadata?.font_family || 'Inter'}
                  onChange={(e) =>
                    updateMetadata('font_family', e.target.value)
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Geist Mono">Geist Mono</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Poppins">Poppins</option>
                  <option value="DM Sans">DM Sans</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Custom CSS
                </Label>
                <textarea
                  value={tenantData?.metadata?.custom_css || ''}
                  onChange={(e) =>
                    updateMetadata('custom_css', e.target.value)
                  }
                  placeholder="/* Custom styles */"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-mono text-xs resize-none"
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Public Contact
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Support Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={tenantData?.contact_email || ''}
                    onChange={(e) =>
                      updateField('contact_email', e.target.value)
                    }
                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Support Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={tenantData?.contact_phone || ''}
                    onChange={(e) =>
                      updateField('contact_phone', e.target.value)
                    }
                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold pl-12"
                  />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Website
                </Label>
                <Input
                  value={tenantData?.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                />
              </div>
            </div>
          </section>
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
