"use client";

import { useCustomers } from "@features/customers/api/use-customers";
import { CustomersList } from "@features/customers/ui/customers-list";

export default function CustomersPage() {
  const {
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
    />
  );
}
