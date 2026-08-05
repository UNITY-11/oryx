import type { CompanyDetails } from "./types";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function toTelLink(phone: string): string | null {
  const digits = digitsOnly(phone);
  return digits ? `tel:+${digits}` : null;
}

export function toWhatsAppLink(whatsapp: string): string | null {
  const digits = digitsOnly(whatsapp);
  return digits ? `https://wa.me/${digits}` : null;
}

export function toMailtoLink(email: string): string | null {
  const trimmed = email.trim();
  return trimmed ? `mailto:${trimmed}` : null;
}

export function formatAddress(company: CompanyDetails): string {
  return [
    company.addressLine1,
    company.addressLine2,
    [company.city, company.state].filter(Boolean).join(", "),
    company.country,
    company.postalCode,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

export function hasContactInfo(company: CompanyDetails | null): boolean {
  if (!company) return false;
  return Boolean(
    company.phone?.trim() ||
    company.whatsapp?.trim() ||
    company.email?.trim() ||
    company.mapUrl?.trim() ||
    company.mapEmbedUrl?.trim() ||
    formatAddress(company) ||
    company.socialLinks?.length
  );
}
