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
      onRetry={reload}
    />
  );
}
