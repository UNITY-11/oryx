"use client";

import { useServices } from "@features/services/api/use-services";
import { ServicesGrid } from "@features/services/ui/services-grid";

export default function ServicesPage() {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filtered,
    setFiltered,
    activeCount,
    inactiveCount,
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev,
    hasNext,
  } = useServices();

  return (
    <ServicesGrid
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filtered={filtered}
      onItemsDeleted={(ids) =>
        setFiltered((prev) => prev.filter((s) => !ids.includes(s.id)))
      }
      activeCount={activeCount}
      inactiveCount={inactiveCount}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      totalItems={totalItems}
      from={from}
      to={to}
      hasPrev={hasPrev}
      hasNext={hasNext}
    />
  );
}
