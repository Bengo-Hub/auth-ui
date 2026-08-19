'use client';

import { useMemo, useState } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, Search } from 'lucide-react';
import { getCountries, type Country } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { cn } from '@/lib/utils';

export interface CountrySelectProps {
  value?: string;
  onChange: (isoCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

let regionNames: Intl.DisplayNames | null | undefined;
function countryName(iso: string): string {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      regionNames = null;
    }
  }
  return regionNames?.of(iso) ?? iso;
}

function FlagIcon({ code }: { code: string }) {
  const Flag = flags[code as Country];
  return (
    <span className="inline-flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[2px] ring-1 ring-black/10">
      {Flag ? <Flag title={code} /> : <span className="h-full w-full bg-slate-200 dark:bg-slate-700" />}
    </span>
  );
}

/**
 * ISO 3166-1 alpha-2 country picker with real flag icons (reuses
 * react-phone-number-input's own flag SVGs and country list — no separate
 * country-data dependency) and a search box, matching the Zoho-style picker
 * this was modeled on. Value is always the 2-letter code (e.g. "KE"); auth-api
 * validates against the same set of codes (phonenumbers.GetSupportedRegions)
 * in UpdateMyProfile.
 */
export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select a country…',
  disabled,
  className,
  id,
}: CountrySelectProps) {
  const [search, setSearch] = useState('');

  const options = useMemo(
    () =>
      getCountries()
        .map((code) => ({ code, name: countryName(code) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
  }, [options, search]);

  const selected = options.find((o) => o.code === value);

  return (
    <SelectPrimitive.Root
      value={selected ? value : undefined}
      onValueChange={onChange}
      disabled={disabled}
      onOpenChange={(open) => {
        if (!open) setSearch('');
      }}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white',
          className
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-left">
          {selected ? (
            <>
              <FlagIcon code={selected.code} />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="truncate text-slate-400">{value && !selected ? value : placeholder}</span>
          )}
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-80 w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="sticky top-0 flex items-center gap-2 border-b border-slate-100 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search countries…"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>
          <SelectPrimitive.Viewport className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-slate-400">No countries match &quot;{search}&quot;</p>
            )}
            {filtered.map((o) => (
              <SelectPrimitive.Item
                key={o.code}
                value={o.code}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 outline-none data-highlighted:bg-slate-100 data-[state=checked]:bg-primary/10 dark:text-slate-200 dark:data-highlighted:bg-slate-700"
              >
                <FlagIcon code={o.code} />
                <SelectPrimitive.ItemText>{o.name}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
