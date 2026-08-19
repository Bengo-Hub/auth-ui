'use client';

import { useMemo } from 'react';
import { getCountries } from 'react-phone-number-input';

export interface CountrySelectProps {
  value?: string;
  onChange: (isoCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function isoToFlagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
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

/**
 * ISO 3166-1 alpha-2 country picker (flag emoji + name) — reuses the same
 * country list react-phone-number-input already ships, so no separate
 * country-data dependency is needed. Value is always the 2-letter code
 * (e.g. "KE"); auth-api validates against the same set of codes
 * (phonenumbers.GetSupportedRegions) in UpdateMyProfile.
 */
export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select a country…',
  disabled,
  className,
  id,
}: CountrySelectProps) {
  const options = useMemo(
    () =>
      getCountries()
        .map((code) => ({ code, name: countryName(code) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // An existing free-text value (legacy data, e.g. "Kenya") won't match any
  // ISO code — surface it as a disabled placeholder rather than mis-select.
  const isKnown = value ? options.some((o) => o.code === value) : false;

  return (
    <select
      id={id}
      value={isKnown ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
    >
      <option value="" disabled={Boolean(value) && !isKnown}>
        {value && !isKnown ? value : placeholder}
      </option>
      {options.map((o) => (
        <option key={o.code} value={o.code}>
          {isoToFlagEmoji(o.code)} {o.name}
        </option>
      ))}
    </select>
  );
}
