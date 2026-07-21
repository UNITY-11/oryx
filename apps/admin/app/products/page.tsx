"use client";

import { useProducts } from "../../src/features/products/api/use-products";
import { ProductsGrid } from "../../src/features/products/ui/products-grid";

export default function ProductsPage() {
  const {
    products,
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
    />
  );
}
