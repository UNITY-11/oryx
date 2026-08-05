export type SocialPlatform =
  | "Facebook"
  | "Instagram"
  | "X"
  | "TikTok"
  | "YouTube"
  | "LinkedIn"
  | "Snapchat"
  | "Other";

export interface SocialLink {
  id: string;
  platform: SocialPlatform | string;
  url: string;
}

export interface CompanyDetails {
  id: string;
  name: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  socialLinks: SocialLink[];
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  mapUrl: string;
  mapEmbedUrl: string;
  updatedAt: string | null;
}
