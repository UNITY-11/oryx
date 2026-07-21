"use client";

import { useBillingData } from "@features/billing/api/use-billing-data";
import { BillingDashboard } from "@features/billing/ui/billing-dashboard";

export default function BillingPage() {
  const {
    search,
    setSearch,
    filter,
    setFilter,
    selected,
    setSelected,
    showPrintModal,
    setShowPrintModal,
    bookings,
    services,
    loading,
    error,
    handleComplete,
    handleWhatsApp,
    billable,
    totalRevenue,
    startedCount,
    completedCount,
    selectedLines,
    selectedTotal
  } = useBillingData();

  return (
    <BillingDashboard
      search={search}
      setSearch={setSearch}
      filter={filter}
      setFilter={setFilter}
      selected={selected}
      setSelected={setSelected}
      showPrintModal={showPrintModal}
      setShowPrintModal={setShowPrintModal}
      bookings={bookings}
      services={services}
      loading={loading}
      error={error}
      handleComplete={handleComplete}
      handleWhatsApp={handleWhatsApp}
      billable={billable}
      totalRevenue={totalRevenue}
      startedCount={startedCount}
      completedCount={completedCount}
      selectedLines={selectedLines}
      selectedTotal={selectedTotal}
    />
  );
}
