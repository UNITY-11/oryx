import { sanityClient } from "@/shared/lib/sanity/client";
import { PROMOTIONAL_BANNER_PROJECTION } from "@repo/sanity";

import type { PromotionalBannerDetails } from "./types";

const PROMOTIONAL_BANNER_DOC_ID = "promotionalBanner";

export const PROMOTIONAL_BANNER_QUERY = `*[_type == "promotionalBanner" && _id == "${PROMOTIONAL_BANNER_DOC_ID}" && status == "Active"][0] ${PROMOTIONAL_BANNER_PROJECTION}`;

export async function fetchPromotionalBanner(): Promise<PromotionalBannerDetails | null> {
  return sanityClient.fetch<PromotionalBannerDetails | null>(
    PROMOTIONAL_BANNER_QUERY
  );
}
