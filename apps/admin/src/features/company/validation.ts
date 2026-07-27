import type { CompanyInput } from "./types";

export type FieldErrors = Partial<Record<keyof CompanyInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{8,20}$/;
const URL_RE = /^https?:\/\/.+/i;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function validateCompany(data: CompanyInput): FieldErrors {
  const errors: FieldErrors = {};

  if (isBlank(data.name)) {
    errors.name = "Company name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Company name must be at least 2 characters";
  } else if (data.name.trim().length > 100) {
    errors.name = "Company name must be 100 characters or less";
  }

  if (data.tagline && data.tagline.trim().length > 160) {
    errors.tagline = "Tagline must be 160 characters or less";
  }

  if (isBlank(data.email)) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (isBlank(data.phone)) {
    errors.phone = "Phone number is required";
  } else if (
    !PHONE_RE.test(data.phone.trim()) ||
    digitsOnly(data.phone).length < 8
  ) {
    errors.phone = "Enter a valid phone number (at least 8 digits)";
  }

  if (isBlank(data.whatsapp)) {
    errors.whatsapp = "WhatsApp number is required";
  } else if (
    !PHONE_RE.test(data.whatsapp.trim()) ||
    digitsOnly(data.whatsapp).length < 8
  ) {
    errors.whatsapp = "Enter a valid WhatsApp number with country code";
  }

  if (!isBlank(data.website) && !URL_RE.test(data.website.trim())) {
    errors.website = "Website must start with http:// or https://";
  }

  if (isBlank(data.addressLine1)) {
    errors.addressLine1 = "Street address is required";
  }

  if (isBlank(data.city)) {
    errors.city = "City is required";
  }

  if (isBlank(data.country)) {
    errors.country = "Country is required";
  }

  if (!isBlank(data.mapUrl) && !URL_RE.test(data.mapUrl.trim())) {
    errors.mapUrl = "Map link must start with http:// or https://";
  }

  if (!isBlank(data.mapEmbedUrl) && !URL_RE.test(data.mapEmbedUrl.trim())) {
    errors.mapEmbedUrl = "Embed URL must start with http:// or https://";
  }

  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Normalize WhatsApp to digits for wa.me links */
export function toWhatsAppLink(whatsapp: string): string {
  const digits = digitsOnly(whatsapp);
  return digits ? `https://wa.me/${digits}` : "";
}
