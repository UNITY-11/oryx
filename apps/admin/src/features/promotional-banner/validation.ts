import { validateSocialLinks } from "@/features/company/validation";

import type { PromotionalBannerInput } from "./types";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export type FieldErrors = Partial<
  Record<keyof PromotionalBannerInput | "socialLinks", string>
>;

export function validateBannerMediaFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, WEBP, or GIF image";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 8 MB or smaller";
  }
  return null;
}

export function validatePromotionalBanner(
  input: PromotionalBannerInput,
  options?: { hasPendingImage?: boolean }
): FieldErrors {
  const errors: FieldErrors = {};

  if (input.status === "Active") {
    if (!input.title.trim()) {
      errors.title = "Title is required when banner is active";
    }
    if (!input.image.trim() && !options?.hasPendingImage) {
      errors.image = "Image is required when banner is active";
    }
  }

  if (input.title.length > 120) {
    errors.title = "Title must be 120 characters or fewer";
  }

  if (input.description.length > 300) {
    errors.description = "Description must be 300 characters or fewer";
  }

  const socialError = validateSocialLinks(input.socialLinks);
  if (socialError) {
    errors.socialLinks = socialError;
  }

  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
