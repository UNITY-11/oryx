export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  tier: CustomerTier;
  totalSpent: number;
  lastVisit: string;
  status: "Active" | "Inactive";
  age?: string;
}

export type CustomerTier = "Bronze" | "Silver" | "Gold" | "Platinum";
