import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type { CountryCode };

export const DEFAULT_PHONE_COUNTRY: CountryCode = "QA";

export function isValidPhone(value: string, country?: CountryCode): boolean {
  if (!value?.trim()) return false;
  try {
    if (country) return isValidPhoneNumber(value, country);
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}

export function validatePhoneValue(
  value: string,
  opts?: { required?: boolean; label?: string; country?: CountryCode }
): string {
  const label = opts?.label || "phone number";
  const required = opts?.required !== false;

  if (!value?.trim()) {
    if (!required) return "";
    const pretty = label.charAt(0).toUpperCase() + label.slice(1);
    return `${pretty} is required`;
  }

  if (!isValidPhone(value, opts?.country)) {
    return `Enter a valid ${label}`;
  }

  return "";
}

/** Normalize to E.164 when possible; otherwise trimmed input. */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (parsed?.isValid()) return parsed.format("E.164");
  } catch {
    // ignore
  }
  return trimmed;
}
