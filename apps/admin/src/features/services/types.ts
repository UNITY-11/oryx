export type ServiceCategory =
  "Massage" | "Facial" | "Body Treatment" | "Hair" | "Nails" | "Package";
export type ServiceStatus = "Active" | "Inactive";

export interface Addon {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
}

export interface PricingTier {
  id: string;
  label: string; // e.g. "60 min", "90 min"
  price: number;
  duration: number;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  status: ServiceStatus;
  description: string;
  shortDescription: string;
  image: string | null;
  pricingTiers: PricingTier[];
  addons: Addon[];
  preparationTime: number; // minutes before appointment
  cleanupTime: number; // minutes after appointment
  maxCapacity: number;
  tags: string[];
  createdAt: string;
}
