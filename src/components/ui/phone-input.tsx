'use client';

import { useState } from 'react';
import PhoneInput, { type Country, parsePhoneNumber } from 'react-phone-number-input';
import './phone-input.css';

export interface PhoneInputFieldProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: Country;
  id?: string;
}

/**
 * Country-flag + calling-code phone input (react-phone-number-input, built on
 * Google's libphonenumber). Always emits E.164 (e.g. "+254743793901") — the
 * single canonical shape auth-api validates and stores. See
 * internal/httpapi/handlers/user_handler.go UpdateMyProfile and
 * auth_handler_contacts.go AddMyPhone for the matching server-side check.
 */
export function PhoneInputField({
  value,
  onChange,
  placeholder = 'e.g. 743 793 901',
  disabled,
  className,
  defaultCountry = 'KE',
  id,
}: PhoneInputFieldProps) {
  // A legacy free-text value with no leading "+" (e.g. "0743793901" from
  // before this component existed) can't be attributed to any country by the
  // library, so it renders as a generic "International" placeholder instead
  // of the right flag. Try once, on mount, to reinterpret it as a NATIONAL
  // number for defaultCountry and upgrade it to real E.164 — after that this
  // is a normal controlled input, so it never fights the user's typing.
  const [displayValue, setDisplayValue] = useState<string | undefined>(() => {
    if (value && !value.startsWith('+')) {
      try {
        const parsed = parsePhoneNumber(value, defaultCountry);
        if (parsed?.isValid()) return parsed.number;
      } catch {
        // fall through — show the raw value as-is
      }
    }
    return value;
  });

  return (
    <PhoneInput
      id={id}
      international
      defaultCountry={defaultCountry}
      value={displayValue}
      onChange={(v) => {
        setDisplayValue(v);
        onChange(v ?? '');
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
