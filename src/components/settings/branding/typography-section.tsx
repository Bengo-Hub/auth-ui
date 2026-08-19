'use client';

import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';

export function TypographySection({
  tenantData,
  updateMetadata,
}: {
  tenantData: any;
  updateMetadata: (key: string, value: any) => void;
}) {
  return (
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
  );
}
