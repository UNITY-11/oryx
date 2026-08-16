export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Normalize to WhatsApp API `to` field (country code + number, no +). */
export function normalizeWhatsAppRecipient(phone: string): string | null {
  const digits = digitsOnly(phone);
  if (!digits) return null;
  return digits;
}
