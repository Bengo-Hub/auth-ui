'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Receipt } from 'lucide-react';

// Tax & Compliance — KRA PIN + VAT registration (synced to Treasury).
export function TaxComplianceSection({
  tenantData,
  updateField,
}: {
  tenantData: any;
  updateField: (field: string, value: any) => void;
}) {
  return (
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
  );
}
