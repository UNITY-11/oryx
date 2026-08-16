import { validatePhoneValue } from "./phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function validateCustomerName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Full name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 100) return "Name must be 100 characters or less";
  return "";
}

export type CustomerInput = {
  name: string;
  phone: string;
  email?: string;
};

export function validateCustomerInput(data: CustomerInput): string | null {
  const nameError = validateCustomerName(data.name);
  if (nameError) return nameError;

  const phoneError = validatePhoneValue(data.phone, {
    required: true,
    label: "phone number",
  });
  if (phoneError) return phoneError;

  if (!isBlank(data.email) && !EMAIL_RE.test(data.email!.trim())) {
    return "Enter a valid email address";
  }

  return null;
}
