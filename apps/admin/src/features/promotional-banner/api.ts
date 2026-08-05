import { parseOrThrow } from "@/shared/lib/api-helpers";

import type { PromotionalBannerDetails, PromotionalBannerInput } from "./types";
import type { FieldErrors } from "./validation";

export async function fetchPromotionalBanner(): Promise<PromotionalBannerDetails | null> {
  const res = await fetch("/api/promotional-banner");
  const data = await parseOrThrow<{ banner: PromotionalBannerDetails | null }>(
    res,
    "Failed to load promotional banner"
  );
  return data.banner;
}

export async function savePromotionalBanner(
  input: PromotionalBannerInput
): Promise<PromotionalBannerDetails> {
  const res = await fetch("/api/promotional-banner", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = new Error(
      body?.error ?? "Failed to save promotional banner"
    ) as Error & {
      fieldErrors?: FieldErrors;
    };
    if (body?.errors) err.fieldErrors = body.errors;
    throw err;
  }

  return res.json();
}
