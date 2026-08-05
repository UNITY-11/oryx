"use client";

import { useCustomers } from "@features/customers/api/use-customers";
import { CustomersList } from "@features/customers/ui/customers-list";

export default function CustomersPage() {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    tierFilter,
    setTierFilter,
    filtered,
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
    reload,
  } = useCustomers();

  return (
    <CustomersList
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      tierFilter={tierFilter}
      setTierFilter={setTierFilter}
      filtered={filtered}
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
      onRetry={reload}
    />
  );
}
