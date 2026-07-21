import { useState, useEffect } from "react";
import { fetchCustomers } from "../api";
import { Customer, CustomerTier } from "../mock-data";

export const TIER_FILTERS: Array<CustomerTier | "All"> = [
  "All",
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
];

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<CustomerTier | "All">("All");

  useEffect(() => {
    fetchCustomers()
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers
    .filter((c) => tierFilter === "All" || c.tier === tierFilter)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

  const activeCount = customers.filter((c) => c.status === "Active").length;
  const inactiveCount = customers.filter((c) => c.status === "Inactive").length;

  return {
    customers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    tierFilter,
    setTierFilter,
    filtered,
    activeCount,
    inactiveCount,
  };
}
