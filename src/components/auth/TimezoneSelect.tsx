'use client';

import { useMemo } from 'react';
import { timeZoneLabel, timeZoneOptions } from '@/lib/timezone';

/** A time zone picker shared by sign-up and the Profile page. */
export function TimezoneSelect({
  id,
  value,
  onChange,
  className,
}: {
  id?: string;
  value: string;
  onChange: (tz: string) => void;
  className?: string;
}) {
  const options = useMemo(() => timeZoneOptions(value), [value]);
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm'}
    >
      {options.map((tz) => (
        <option key={tz} value={tz}>
          {timeZoneLabel(tz)}
        </option>
      ))}
    </select>
  );
}
