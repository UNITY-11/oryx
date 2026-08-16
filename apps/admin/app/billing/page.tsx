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
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev,
    hasNext,
    totalRevenue,
    startedCount,
    completedCount,
    selectedLines,
    selectedSummary,
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
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      totalItems={totalItems}
      from={from}
      to={to}
      hasPrev={hasPrev}
      hasNext={hasNext}
      totalRevenue={totalRevenue}
      startedCount={startedCount}
      completedCount={completedCount}
      selectedLines={selectedLines}
      selectedSummary={selectedSummary}
    />
  );
}
