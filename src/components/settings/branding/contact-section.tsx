'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Globe, Mail, Phone } from 'lucide-react';

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

export function ContactSection({
  tenantData,
  updateField,
}: {
  tenantData: any;
  updateField: (field: string, value: any) => void;
}) {
  return (
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
  );
}
