import { DEFAULT_PHONE_COUNTRY } from "@repo/validation";

import { normalizeWhatsAppRecipient } from "./phone";
import type { CompanyWhatsAppContext } from "./types";

export function buildWhatsAppUrl(
  phone: string,
  message: string
): string | null {
  const digits = normalizeWhatsAppRecipient(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppChat(phone: string, message: string): boolean {
  const url = buildWhatsAppUrl(phone, message);
  if (!url) return false;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return true;
}

export function resolveAdminWhatsAppPhone(
  company?: CompanyWhatsAppContext,
  fallback?: string
): string | null {
  const raw = company?.whatsapp?.trim() || fallback?.trim() || "";
  return normalizeWhatsAppRecipient(raw, DEFAULT_PHONE_COUNTRY);
}
