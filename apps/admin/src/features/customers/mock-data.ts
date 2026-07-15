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

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cus-1",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+974 5555 1234",
    avatar: null,
    tier: "Gold",
    totalSpent: 4500,
    lastVisit: "2026-07-10",
    status: "Active",
    age: "32",
  },
  {
    id: "cus-2",
    name: "Aisha Al-Thani",
    email: "aisha.althani@example.com",
    phone: "+974 3333 5678",
    avatar: null,
    tier: "Platinum",
    totalSpent: 12500,
    lastVisit: "2026-07-12",
    status: "Active",
  },
  {
    id: "cus-3",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    phone: "+974 6666 9012",
    avatar: null,
    tier: "Silver",
    totalSpent: 1200,
    lastVisit: "2026-06-25",
    status: "Active",
  },
  {
    id: "cus-4",
    name: "Fatima Hassan",
    email: "fatima.h@example.com",
    phone: "+974 7777 3456",
    avatar: null,
    tier: "Bronze",
    totalSpent: 450,
    lastVisit: "2026-07-01",
    status: "Inactive",
  },
];
