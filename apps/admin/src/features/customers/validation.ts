import { validatePhoneValue } from "@/shared/lib/phone";

import type { CustomerTier } from "./types";

export type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  tier: CustomerTier;
  status: "Active" | "Inactive";
  age?: string;
};

export type CustomerFieldErrors = Partial<
  Record<keyof CustomerFormData | "avatar", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function validateCustomer(
  data: Pick<CustomerFormData, "name" | "email" | "phone" | "tier" | "age">
): CustomerFieldErrors {
  const errors: CustomerFieldErrors = {};

  if (isBlank(data.name)) {
    errors.name = "Full name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (data.name.trim().length > 100) {
    errors.name = "Name must be 100 characters or less";
  }

  const phoneError = validatePhoneValue(data.phone, {
    required: true,
    label: "phone number",
  });
  if (phoneError) errors.phone = phoneError;

  if (!isBlank(data.email) && !EMAIL_RE.test(data.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!data.tier) {
    errors.tier = "Tier is required";
  }

  if (!isBlank(data.age)) {
    const ageNum = Number(data.age);
    if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
      errors.age = "Enter a valid age between 1 and 120";
    }
  }

  return errors;
}

export function validateCustomerAvatarFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, WEBP, or GIF image";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller";
  }
  return null;
}

export function hasCustomerFieldErrors(errors: CustomerFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function validateBookingFields(data: {
  date: string;
  time: string;
}): Partial<Record<"date" | "time", string>> {
  const errors: Partial<Record<"date" | "time", string>> = {};
  if (isBlank(data.date)) errors.date = "Date is required";
  if (isBlank(data.time)) errors.time = "Time is required";

  if (!isBlank(data.date)) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayIso = `${y}-${m}-${d}`;
    if (data.date < todayIso) {
      errors.date = "Date cannot be in the past";
    }
  }

  return errors;
}
