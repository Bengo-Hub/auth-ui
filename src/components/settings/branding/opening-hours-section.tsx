'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

/**
 * The organisation's weekly trading hours, kept by auth-api in tenant metadata `opening_hours`
 * and read by every app (online store open state and delivery slots, POS, the public website)
 * in the organisation's timezone. A day that is not ticked is closed; no ticked day at all
 * means the hours are not set and apps treat the business as always open.
 */

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

type Period = { open: string; close: string };
type Schedule = Record<string, Period | Period[]>;

const DEFAULT_PERIOD: Period = { open: '08:00', close: '22:00' };

/** The first period of a day, whether stored as one period or a list of split shifts. */
function firstPeriod(v: Period | Period[] | undefined): Period | null {
  if (!v) return null;
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

export function OpeningHoursSection({
  tenantData,
  updateMetadata,
}: {
  tenantData: any;
  updateMetadata: (key: string, value: any) => void;
}) {
  const schedule: Schedule = (tenantData?.metadata?.opening_hours as Schedule) || {};

  // An empty object (not null) is sent to clear: the save drops null metadata values, and
  // auth-api stores an empty schedule as "not set".
  const save = (next: Schedule) => updateMetadata('opening_hours', next);

  const setDay = (day: string, period: Period | null) => {
    const next: Schedule = { ...schedule };
    if (period) next[day] = period;
    else delete next[day];
    save(next);
  };

  const copyToAll = (day: string) => {
    const p = firstPeriod(schedule[day]);
    if (!p) return;
    save(Object.fromEntries(DAYS.map((d) => [d.key, { ...p }])));
  };

  const anyOpen = DAYS.some((d) => firstPeriod(schedule[d.key]));

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Opening Hours
      </h3>
      <p className="text-xs text-slate-400 font-medium mb-6">
        Used by your online store, POS and website, in the timezone set under Public Contact. Untick a
        day you are closed. A closing time earlier than the opening time runs past midnight.
        {!anyOpen && ' No hours set: apps treat you as always open.'}
      </p>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {DAYS.map((d) => {
          const p = firstPeriod(schedule[d.key]);
          const split = Array.isArray(schedule[d.key]) && (schedule[d.key] as Period[]).length > 1;
          return (
            <div key={d.key} className="grid grid-cols-[auto_1fr] sm:grid-cols-[140px_1fr_auto] items-center gap-3 py-3">
              <Label className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!p}
                  onChange={(e) => setDay(d.key, e.target.checked ? { ...DEFAULT_PERIOD } : null)}
                  className="h-4 w-4 accent-primary"
                  aria-label={`Open on ${d.label}`}
                />
                {d.label}
              </Label>
              {p ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={p.open}
                    onChange={(e) => setDay(d.key, { ...p, open: e.target.value })}
                    aria-label={`${d.label} opening time`}
                    className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                  />
                  <span className="text-slate-400 text-sm">to</span>
                  <Input
                    type="time"
                    value={p.close}
                    onChange={(e) => setDay(d.key, { ...p, close: e.target.value })}
                    aria-label={`${d.label} closing time`}
                    className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none font-bold"
                  />
                </div>
              ) : (
                <span className="text-sm text-slate-400">Closed</span>
              )}
              {p ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToAll(d.key)}
                  className="col-span-2 sm:col-span-1 justify-self-start text-xs"
                >
                  Use for every day
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              {split && (
                <p className="col-span-2 sm:col-span-3 text-xs text-amber-600">
                  This day has split shifts set through the API. Editing it here keeps only the first one.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
