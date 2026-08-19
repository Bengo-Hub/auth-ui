'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CheckCircle2 } from 'lucide-react';

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

export function IdentitySection({
  tenantData,
  updateField,
  updateMetadata,
}: {
  tenantData: any;
  updateField: (field: string, value: any) => void;
  updateMetadata: (key: string, value: any) => void;
}) {
  return (
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
  );
}
