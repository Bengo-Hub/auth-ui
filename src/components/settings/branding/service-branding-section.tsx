'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { useToast } from '@/hooks/use-toast';
import { AppWindow, RotateCcw } from 'lucide-react';
import { serviceAppName, serviceShortName } from '@bengo-hub/shared-ui-lib/branding';
import {
  BRANDABLE_SERVICES,
  getServiceBranding,
  type ServiceBrandingEntry,
} from '@/lib/tenant-api';

// Per-service app names and icons (tenant metadata `service_branding`). A
// restaurant can call its ordering app "Urban Eats" while another tenant keeps
// the default. Installed PWAs, browser tabs and the sign-in page pick these up.
export function ServiceBrandingSection({
  tenantData,
  updateMetadata,
}: {
  tenantData: any;
  updateMetadata: (key: string, value: any) => void;
}) {
  const { toast } = useToast();
  const current: Record<string, ServiceBrandingEntry | null> =
    (tenantData?.metadata?.service_branding as Record<string, ServiceBrandingEntry | null>) || {};
  // What each app is called when left blank, by the same shared rule the apps use.
  const tenantName: string = tenantData?.metadata?.org_name || tenantData?.name || '';

  const setEntry = (service: string, patch: Partial<ServiceBrandingEntry> | null) => {
    const existing = getServiceBranding(tenantData?.metadata, service) || {};
    // null tells auth-api to drop the override so the app falls back to the default.
    const next = patch === null ? null : { ...existing, ...patch };
    updateMetadata('service_branding', { ...current, [service]: next });
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <AppWindow className="h-5 w-5 text-primary" />
        App Names and Icons
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Give each app your own name and icon. Customers and staff see it in the app header, the
        browser tab, on the sign-in page and on their home screen when they install the app. Leave
        blank to use the name shown.
      </p>
      <div className="space-y-6">
        {BRANDABLE_SERVICES.map((service) => {
          const entry = getServiceBranding(tenantData?.metadata, service.key) || {};
          const customised = Boolean(entry.name || entry.icon_url || entry.short_name);
          return (
            <div
              key={service.key}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{service.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{service.description}</p>
                </div>
                {customised && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEntry(service.key, null)}
                    className="shrink-0 text-xs"
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Use default
                  </Button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    App name
                  </Label>
                  <Input
                    value={entry.name || ''}
                    maxLength={60}
                    onChange={(e) => setEntry(service.key, { name: e.target.value })}
                    placeholder={serviceAppName(tenantName, service.appLabel, 'Codevertex')}
                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Home screen label
                  </Label>
                  <Input
                    value={entry.short_name || ''}
                    maxLength={24}
                    onChange={(e) => setEntry(service.key, { short_name: e.target.value })}
                    placeholder={serviceShortName(tenantName, service.appLabel, 'Codevertex', { name: entry.name })}
                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                  />
                </div>
              </div>
              <ImageUploadField
                label="App icon (square SVG or PNG, 512x512)"
                value={entry.icon_url || ''}
                onChange={(url) => setEntry(service.key, { icon_url: url })}
                onError={(message) =>
                  toast({ title: 'Icon not accepted', description: message, variant: 'destructive' })
                }
                maxBytes={100 * 1024}
                hint="Falls back to your organisation logo when empty."
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
