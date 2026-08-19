'use client';

import PhoneInput, { type Country } from 'react-phone-number-input';
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
 * An existing free-text value (legacy data) is shown as-is until re-saved.
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
  return (
    <PhoneInput
      id={id}
      international
      defaultCountry={defaultCountry}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
