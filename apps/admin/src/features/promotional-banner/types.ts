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

export type PromotionalBannerInput = Omit<
  PromotionalBannerDetails,
  "id" | "updatedAt"
>;

export const EMPTY_PROMOTIONAL_BANNER: PromotionalBannerInput = {
  title: "",
  description: "",
  image: "",
  status: "Inactive",
  socialLinks: [],
};
