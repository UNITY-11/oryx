import { useState, useEffect } from "react";
import { fetchServices } from "../api";
import { Service, ServiceCategory } from "../mock-data";

export const CATEGORY_FILTERS: Array<ServiceCategory | "All"> = [
  "All",
  "Massage",
  "Facial",
  "Body Treatment",
  "Hair",
  "Nails",
  "Package",
];

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | "All">("All");

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = services
    .filter((s) => categoryFilter === "All" || s.category === categoryFilter)
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeCount = services.filter((s) => s.status === "Active").length;
  const inactiveCount = services.filter((s) => s.status === "Inactive").length;

  return {
    services,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    filtered,
    activeCount,
    inactiveCount,
  };
}
