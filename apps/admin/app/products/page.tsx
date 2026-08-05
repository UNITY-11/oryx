"use client";

import { useProducts } from "@features/products/api/use-products";
import { ProductsGrid } from "@features/products/ui/products-grid";

export default function ProductsPage() {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    isSortOpen,
    setIsSortOpen,
    filtered,
    activeCount,
    lowStockCount,
    outOfStockCount,
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev,
    hasNext,
    reload,
  } = useProducts();

  return (
    <ProductsGrid
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
      sortBy={sortBy}
      setSortBy={setSortBy}
      isSortOpen={isSortOpen}
      setIsSortOpen={setIsSortOpen}
      filtered={filtered}
      activeCount={activeCount}
      lowStockCount={lowStockCount}
      outOfStockCount={outOfStockCount}
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
