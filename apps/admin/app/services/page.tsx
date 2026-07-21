"use client";

import { useServices } from "../../src/features/services/api/use-services";
import { ServicesGrid } from "../../src/features/services/ui/services-grid";

export default function ServicesPage() {
  const {
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
  } = useServices();

  return (
    <ServicesGrid
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
      filtered={filtered}
      activeCount={activeCount}
      inactiveCount={inactiveCount}
    />
  );
}
