import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type { CountryCode };

export const DEFAULT_PHONE_COUNTRY: CountryCode = "QA";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function parsePhone(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY
) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(trimmed);
      if (parsed?.isValid()) return parsed;
    }

    const digits = digitsOnly(trimmed);
    if (digits) {
      const parsedIntl = parsePhoneNumberFromString(`+${digits}`);
      if (parsedIntl?.isValid()) return parsedIntl;
    }

    const parsedNational = parsePhoneNumberFromString(trimmed, defaultCountry);
    if (parsedNational?.isValid()) return parsedNational;
  } catch {
    // ignore
  }

  return null;
}

export function isValidPhone(value: string, country?: CountryCode): boolean {
  if (!value?.trim()) return false;
  if (country) {
    try {
      return isValidPhoneNumber(value, country);
    } catch {
      return false;
    }
  }
  return parsePhone(value) !== null;
}

export function validatePhoneValue(
  value: string,
  opts?: { required?: boolean; label?: string; country?: CountryCode }
): string {
  const label = opts?.label || "phone number";
  const required = opts?.required !== false;
  const defaultCountry = opts?.country ?? DEFAULT_PHONE_COUNTRY;

  if (!value?.trim()) {
    if (!required) return "";
    const pretty = label.charAt(0).toUpperCase() + label.slice(1);
    return `${pretty} is required`;
  }

  if (!isValidPhone(value, defaultCountry)) {
    return `Enter a valid ${label}`;
  }

  return "";
}

/**
 * Normalize to E.164 (+country + national) using country-aware parsing.
 * Numbers with a leading country code but no "+" are handled correctly.
 */
export function normalizePhone(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const parsed = parsePhone(trimmed, defaultCountry);
  if (parsed) return parsed.format("E.164");
  return trimmed;
}

/** Digits-only international number for wa.me / tel links (no leading +). */
export function toWhatsAppDigits(
  value: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY
): string | null {
  const normalized = normalizePhone(value, defaultCountry);
  if (!normalized) return null;
  if (normalized.startsWith("+")) {
    const digits = normalized.slice(1);
    return /^\d+$/.test(digits) ? digits : null;
  }
  const digits = digitsOnly(normalized);
  return digits || null;
}

export function buildWhatsAppUrl(
  phone: string,
  message?: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY
): string | null {
  const digits = toWhatsAppDigits(phone, defaultCountry);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
