import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

export type { CountryCode };

/** Default for Oryx Spa (Qatar). */
export const DEFAULT_PHONE_COUNTRY: CountryCode = "QA";

const PRIORITY_COUNTRIES: CountryCode[] = [
  "QA",
  "AE",
  "SA",
  "KW",
  "BH",
  "OM",
  "IN",
  "PK",
  "BD",
  "PH",
  "EG",
  "JO",
  "LB",
  "TR",
  "GB",
  "US",
];

const regionNames =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function countryFlag(country: CountryCode): string {
  return country
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function countryLabel(country: CountryCode): string {
  return regionNames?.of(country) || country;
}

export type PhoneCountryOption = {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
};

export function getPhoneCountryOptions(): PhoneCountryOption[] {
  const all = getCountries();
  const priority = new Set(PRIORITY_COUNTRIES);
  const rest = all
    .filter((c) => !priority.has(c))
    .sort((a, b) => countryLabel(a).localeCompare(countryLabel(b)));

  return [...PRIORITY_COUNTRIES.filter((c) => all.includes(c)), ...rest].map(
    (code) => ({
      code,
      name: countryLabel(code),
      dialCode: `+${getCountryCallingCode(code)}`,
      flag: countryFlag(code),
    })
  );
}

export function detectCountryFromValue(
  value: string,
  fallback: CountryCode = DEFAULT_PHONE_COUNTRY
): CountryCode {
  if (!value?.trim()) return fallback;
  try {
    const parsed = parsePhoneNumberFromString(value);
    if (parsed?.country) return parsed.country;
  } catch {
    // ignore
  }
  return fallback;
}

/** National digits only for the input field (no country code). */
export function getNationalNumber(value: string, country: CountryCode): string {
  if (!value?.trim()) return "";
  try {
    const parsed = parsePhoneNumberFromString(value, country);
    if (parsed) return parsed.nationalNumber;
  } catch {
    // ignore
  }
  const dial = getCountryCallingCode(country);
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith(dial)) return digits.slice(dial.length);
  return digits;
}

/**
 * Build E.164 (+…) from country + national digits while typing.
 * Returns empty string when there are no national digits.
 */
export function buildPhoneValue(
  nationalDigits: string,
  country: CountryCode
): string {
  const digits = nationalDigits.replace(/\D/g, "");
  if (!digits) return "";
  const dial = getCountryCallingCode(country);
  const e164 = `+${dial}${digits}`;
  try {
    const parsed = parsePhoneNumberFromString(e164, country);
    if (parsed) return parsed.format("E.164");
  } catch {
    // ignore
  }
  return e164;
}

export function isValidPhone(value: string, country?: CountryCode): boolean {
  if (!value?.trim()) return false;
  try {
    if (country) return isValidPhoneNumber(value, country);
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}

/** Validation message for forms. Empty string when valid. */
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
    const country = opts?.country || detectCountryFromValue(value);
    const name = countryLabel(country);
    return `Enter a valid ${name} ${label}`;
  }

  return "";
}

export function validateName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Full name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  return "";
}
