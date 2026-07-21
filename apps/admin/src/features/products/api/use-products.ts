import { useState, useEffect } from "react";
import { fetchProducts } from "../api";
import { Product, ProductCategory } from "../mock-data";

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
  { value: "StockHigh", label: "Stock: High to Low" },
  { value: "StockLow", label: "Stock: Low to High" },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [sortBy, setSortBy] = useState("Default");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products
    .filter((p) => categoryFilter === "All" || p.category === categoryFilter)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "StockHigh") return b.quantity - a.quantity;
      if (sortBy === "StockLow") return a.quantity - b.quantity;
      return 0;
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
  };
}
