import { useEffect, useState } from "react";

import { fetchProducts } from "../api";
import { Product, ProductCategory } from "../types";

export const CATEGORY_FILTERS: Array<ProductCategory | "All"> = [
  "All",
  "Skincare",
  "Body Care",
  "Hair Care",
  "Aromatherapy",
  "Accessories",
  "Supplements",
];

export const SORT_OPTIONS = [
  { value: "Default", label: "Sort: Default" },
  { value: "StockHigh", label: "Quantity: High → Low" },
  { value: "StockLow", label: "Quantity: Low → High" },
];

/** Stock level bands for quantity badges */
export function getStockLevel(quantity: number): "low" | "medium" | "good" {
  const qty = Number(quantity) || 0;
  if (qty <= 10) return "low";
  if (qty <= 30) return "medium";
  return "good";
}

export function getStockBadgeClasses(quantity: number): string {
  const level = getStockLevel(quantity);
  if (level === "low") {
    return "border-red-200 bg-red-500 text-white";
  }
  if (level === "medium") {
    return "border-amber-200 bg-amber-400 text-amber-950";
  }
  return "border-green-200 bg-green-500 text-white";
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">(
    "All"
  );
  const [sortBy, setSortBy] = useState("Default");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const reload = () => {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = products
    .filter((p) => categoryFilter === "All" || p.category === categoryFilter)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const qtyA = Number(a.quantity) || 0;
      const qtyB = Number(b.quantity) || 0;
      if (sortBy === "StockHigh") {
        if (qtyB !== qtyA) return qtyB - qtyA;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "StockLow") {
        if (qtyA !== qtyB) return qtyA - qtyB;
        return a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

  const activeCount = products.filter((p) => p.status === "Active").length;
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= 10
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  return {
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
    reload,
  };
}
