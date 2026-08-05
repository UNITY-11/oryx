import type { SocialLink } from "@/features/company/types";

export const PROMOTIONAL_BANNER_DOC_ID = "promotionalBanner";

export interface PromotionalBannerDetails {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "Active" | "Inactive";
  socialLinks: SocialLink[];
  updatedAt: string | null;
}
