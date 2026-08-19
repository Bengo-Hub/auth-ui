'use client';

import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ImageUploadField } from '@/components/ui/image-upload-field';
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
  Receipt,
  Clock,
  Plug2,
  Send,
} from 'lucide-react';

// IANA timezones offered for a tenant's day/shift boundaries. East Africa first
// (default Africa/Nairobi / EAT), then other common business zones. The backend
// accepts any IANA string; this is a curated shortlist for the common cases.
const TIMEZONES = [
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi — EAT (UTC+3)' },
  { value: 'Africa/Dar_es_Salaam', label: 'Africa/Dar es Salaam — EAT (UTC+3)' },
  { value: 'Africa/Kampala', label: 'Africa/Kampala — EAT (UTC+3)' },
  { value: 'Africa/Kigali', label: 'Africa/Kigali — CAT (UTC+2)' },
  { value: 'Africa/Addis_Ababa', label: 'Africa/Addis Ababa — EAT (UTC+3)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos — WAT (UTC+1)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo — EET (UTC+2)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg — SAST (UTC+2)' },
  { value: 'Africa/Accra', label: 'Africa/Accra — GMT (UTC+0)' },
  { value: 'Europe/London', label: 'Europe/London — GMT/BST' },
  { value: 'Europe/Paris', label: 'Europe/Paris — CET/CEST' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai — GST (UTC+4)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata — IST (UTC+5:30)' },
  { value: 'America/New_York', label: 'America/New York — ET' },
  { value: 'UTC', label: 'UTC — Coordinated Universal Time' },
];

// Must match the USE_CASES array in SignupForm.tsx so tenant admins editing
// their org's profile see the same options they picked during registration.
const USE_CASES = [
  { value: 'fbo', label: 'Forever Living Products (FBO)' },
  { value: 'hospitality', label: 'Hospitality (Restaurant, Cafe, Bar)' },
  { value: 'retail', label: 'Retail / Shop' },
  { value: 'e_commerce', label: 'Online Store / E-commerce' },
  { value: 'quick_service', label: 'Quick Service / Kiosk' },
  { value: 'food_delivery', label: 'Food Delivery' },
  { value: 'grocery', label: 'Grocery / Supermarket' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'warehousing', label: 'Warehousing' },
  { value: 'logistics', label: 'Logistics / Fleet Management' },
  { value: 'weighbridge', label: 'Weighbridge / Commercial Weighing' },
  { value: 'services', label: 'Services / Professional' },
  { value: 'pharmacy', label: 'Pharmacy / Chemist' },
  { value: 'hospital', label: 'Hospital / Clinic (Consultation, Lab, Pharmacy, Billing)' },
  { value: 'library', label: 'Library / Resource Center' },
  { value: 'other', label: 'Other' },
];

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
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [tenantData, setTenantData] = useState<any>(null);
  const { toast } = useToast();

  const [showEtimsRequest, setShowEtimsRequest] = useState(false);
  const [etimsMode, setEtimsMode] = useState<'self_serve' | 'assisted'>('assisted');
  const [etimsNotes, setEtimsNotes] = useState('');

  const requestEtims = useMutation({
    mutationFn: async () =>
      api.post('/api/v1/integration-requests', {
        request_type: 'etims_integration',
        requester_name: user?.name || user?.email || 'Unknown',
        requester_email: user?.email || '',
        company_name: tenantData?.name,
        kra_pin: tenantData?.tax_pin,
        integration_mode: etimsMode,
        notes: etimsNotes,
      }),
    onSuccess: () => {
      toast({ title: 'Request sent', description: 'Our team will follow up shortly.' });
      setShowEtimsRequest(false);
      setEtimsNotes('');
    },
    onError: () => toast({ title: 'Request failed', variant: 'destructive' }),
  });

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
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Slogan / Tagline
                </Label>
                <Input
                  value={tenantData?.metadata?.tagline || ''}
                  onChange={(e) => updateMetadata('tagline', e.target.value)}
                  placeholder="e.g. Tangible Solutions for Businesses"
                  className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                />
                <p className="text-[11px] text-slate-400">Shown under your business name on invoices, receipts and quotations.</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Industry / Use Cases
                </Label>
                <div className="flex flex-wrap gap-2">
                  {USE_CASES.map((uc) => {
                    const selected = (tenantData?.use_cases as string[] | undefined)?.includes(uc.value)
                      || (!tenantData?.use_cases?.length && tenantData?.use_case === uc.value);
                    return (
                      <button
                        key={uc.value}
                        type="button"
                        onClick={() => {
                          const current: string[] = tenantData?.use_cases || (tenantData?.use_case ? [tenantData.use_case] : []);
                          const next = selected
                            ? current.filter((v: string) => v !== uc.value)
                            : [...current, uc.value];
                          updateField('use_cases', next);
                          updateField('use_case', next[0] || '');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {selected ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0" />
                        )}
                        {uc.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500">Select all that apply — same options as registration.</p>
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
                onError={(message) =>
                  toast({ title: 'Image not usable', description: message, variant: 'destructive' })
                }
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
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Timezone
                </Label>
                <select
                  value={tenantData?.timezone || 'Africa/Nairobi'}
                  onChange={(e) => updateField('timezone', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm appearance-none cursor-pointer"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                  {/* Preserve a non-listed value already saved on the tenant. */}
                  {tenantData?.timezone &&
                    !TIMEZONES.some((tz) => tz.value === tenantData.timezone) && (
                      <option value={tenantData.timezone}>
                        {tenantData.timezone}
                      </option>
                    )}
                </select>
                <p className="text-xs text-slate-400 font-medium">
                  Controls how sales days, shifts and reports are bucketed across
                  POS, Treasury and all connected apps. Defaults to Africa/Nairobi
                  (EAT).
                </p>
              </div>
            </div>
          </section>

          {/* Tax & Compliance — KRA PIN + VAT registration (synced to Treasury). */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Tax &amp; Compliance
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Your KRA PIN and VAT status appear on invoices and sync to Treasury.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  KRA PIN
                </Label>
                <Input
                  value={tenantData?.tax_pin || ''}
                  onChange={(e) => updateField('tax_pin', e.target.value.toUpperCase())}
                  placeholder="e.g. P051234567X"
                  className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Registered for VAT?
                </Label>
                <div className="flex items-center gap-3 h-12">
                  <button
                    type="button"
                    onClick={() => updateField('vat_registered', !tenantData?.vat_registered)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${tenantData?.vat_registered ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                    aria-pressed={!!tenantData?.vat_registered}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${tenantData?.vat_registered ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {tenantData?.vat_registered ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              {tenantData?.vat_registered && (
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    VAT Registered On
                  </Label>
                  <Input
                    type="date"
                    value={(tenantData?.vat_registered_on || '').slice(0, 10)}
                    onChange={(e) => updateField('vat_registered_on', e.target.value)}
                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                  />
                </div>
              )}
            </div>
          </section>

          {/* eTIMS Integration — request KRA fiscalization be enabled for this tenant. */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Plug2 className="h-5 w-5 text-primary" />
              eTIMS Integration
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Fiscalise your sales directly to KRA eTIMS. Not sure if it&apos;s active? Request it below and our team will confirm and set it up.
            </p>
            {showEtimsRequest ? (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEtimsMode('self_serve')}
                    className={`text-left p-4 rounded-xl border-2 transition-colors ${etimsMode === 'self_serve' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Self-serve</p>
                    <p className="text-xs text-slate-500 mt-1">Our developers handle the setup ourselves — no integration fee.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEtimsMode('assisted')}
                    className={`text-left p-4 rounded-xl border-2 transition-colors ${etimsMode === 'assisted' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Assisted setup</p>
                    <p className="text-xs text-slate-500 mt-1">Codevertex's team configures it for us — a one-time integration fee applies.</p>
                  </button>
                </div>
                <textarea
                  placeholder="Anything we should know? (device/branch count, timeline, etc.)"
                  value={etimsNotes}
                  onChange={(e) => setEtimsNotes(e.target.value)}
                  rows={3}
                  className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 placeholder:text-slate-400"
                />
                <div className="flex gap-3">
                  <Button type="button" disabled={requestEtims.isPending} onClick={() => requestEtims.mutate()}>
                    {requestEtims.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Submit request
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEtimsRequest(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setShowEtimsRequest(true)}>
                <Plug2 className="h-4 w-4 mr-2" />
                Request eTIMS Integration
              </Button>
            )}
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
