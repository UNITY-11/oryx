import {
  DEFAULT_PHONE_COUNTRY,
  toWhatsAppDigits,
  type CountryCode,
} from "@repo/validation";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Normalize to WhatsApp `wa.me` digits (country code + number, no +). */
export function normalizeWhatsAppRecipient(
  phone: string,
  defaultCountry: CountryCode = DEFAULT_PHONE_COUNTRY
): string | null {
  return toWhatsAppDigits(phone, defaultCountry);
}
