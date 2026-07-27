import type { CouponInput } from "./types";

export type CouponFieldErrors = Partial<Record<keyof CouponInput, string>>;

const ALLOWED_ICONS = [
  "Scissors",
  "Sparkles",
  "Flower2",
  "Heart",
  "Star",
  "Gift",
] as const;

const CODE_RE = /^[A-Z0-9_-]{3,24}$/;

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function validateCoupon(data: CouponInput): CouponFieldErrors {
  const errors: CouponFieldErrors = {};

  if (isBlank(data.type)) {
    errors.type = "Offer type is required";
  } else if (data.type.trim().length > 40) {
    errors.type = "Offer type must be 40 characters or less";
  }

  if (isBlank(data.title)) {
    errors.title = "Title is required";
  } else if (data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (data.title.trim().length > 120) {
    errors.title = "Title must be 120 characters or less";
  }

  const code = data.code.trim().toUpperCase();
  if (isBlank(code)) {
    errors.code = "Coupon code is required";
  } else if (!CODE_RE.test(code)) {
    errors.code =
      "Use 3–24 characters: letters, numbers, hyphen, or underscore";
  }

  if (isBlank(data.icon)) {
    errors.icon = "Select an icon";
  } else if (
    !ALLOWED_ICONS.includes(data.icon as (typeof ALLOWED_ICONS)[number])
  ) {
    errors.icon = "Select a valid icon";
  }

  return errors;
}

export function hasCouponFieldErrors(errors: CouponFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
