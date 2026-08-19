'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useToast } from '@/hooks/use-toast';
import { Palette } from 'lucide-react';

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

export function VisualBrandSection({
  tenantData,
  updateField,
  primaryColor,
  secondaryColor,
  accentColor,
}: {
  tenantData: any;
  updateField: (field: string, value: any) => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}) {
  const { toast } = useToast();

  return (
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
  );
}
