"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronDown,
  ImageIcon,
  Loader2,
  Package,
  Search,
} from "lucide-react";

import { fetchProducts } from "../../src/features/products/api";
import {
  Product,
  ProductCategory,
} from "../../src/features/products/mock-data";

const CATEGORY_FILTERS: Array<ProductCategory | "All"> = [
  "All",
  "Skincare",
  "Body Care",
  "Hair Care",
  "Aromatherapy",
  "Accessories",
  "Supplements",
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">(
    "All"
  );
  const [sortBy, setSortBy] = useState("Default");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const sortOptions = [
    { value: "Default", label: "Sort: Default" },
    { value: "StockHigh", label: "Stock: High to Low" },
    { value: "StockLow", label: "Stock: Low to High" },
  ];

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

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* Top Bar */}
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between gap-4 border-b p-4 md:flex-row md:p-6">
          <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:flex-row md:w-auto">
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-3 pr-4 pl-12 text-sm focus:ring-1 focus:outline-none"
              />
            </div>
            <div className="relative z-40 w-full shrink-0 sm:w-48">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="border-primary/20 focus:ring-primary/30 text-primary-dark hover:bg-primary/5 flex w-full cursor-pointer items-center justify-between rounded-full border bg-white py-3 pr-4 pl-5 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:outline-none"
              >
                <span className="truncate">
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </span>
                <ChevronDown
                  className={`text-primary h-4 w-4 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="border-primary/10 animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-40 mt-2 w-full min-w-[180px] overflow-hidden rounded-2xl border bg-white shadow-xl duration-200">
                    <div className="py-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-5 py-2.5 text-left text-sm transition-colors ${
                            sortBy === option.value
                              ? "bg-primary/10 text-primary-dark font-bold"
                              : "text-text-secondary hover:bg-primary/5 hover:text-primary-dark font-medium"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="scrollbar-hide flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "text-primary-dark border-primary/10 hover:bg-primary/10 bg-primary/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-red-500">
              <AlertCircle className="mb-3 h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <Package className="text-primary/20 mb-3 h-10 w-10" />
              <p>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {/* Add Product Card */}
              <Link
                href="/products/new"
                className="group border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/50 hover:text-primary flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all"
                style={{ aspectRatio: "1/1" }}
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                  <span className="text-2xl leading-none font-light">+</span>
                </div>
                <span className="px-4 text-center text-sm font-medium">
                  Add Product
                </span>
              </Link>

              {/* Product Cards — image only */}
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group from-primary/10 to-primary/5 relative overflow-hidden rounded-3xl bg-gradient-to-br shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ aspectRatio: "1/1" }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="text-primary/20 h-10 w-10" />
                    </div>
                  )}

                  {/* Stock badge */}
                  {product.quantity === 0 && (
                    <div className="absolute top-3 right-3 rounded-full border border-red-100 bg-white/90 px-2 py-1 text-xs font-semibold text-red-500 backdrop-blur-sm">
                      Out of stock
                    </div>
                  )}
                  {product.quantity > 0 && product.quantity <= 10 && (
                    <div className="absolute top-3 right-3 rounded-full border border-amber-100 bg-white/90 px-2 py-1 text-xs font-semibold text-amber-600 backdrop-blur-sm">
                      Low stock
                    </div>
                  )}

                  {/* Name on hover */}
                  <div className="from-primary-dark/70 absolute inset-0 flex items-end bg-gradient-to-t via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-sm leading-tight font-semibold text-white">
                      {product.name}
                    </p>
                  </div>

                  {/* Inactive dim */}
                  {product.status === "Inactive" && (
                    <div className="absolute inset-0 bg-white/40" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="border-primary/5 text-text-secondary flex shrink-0 items-center gap-4 border-t px-6 py-3 text-xs">
          <span className="flex items-center gap-1">
            <Package className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span className="text-amber-600">{lowStockCount} Low Stock</span>
          <span className="text-red-500">{outOfStockCount} Out of Stock</span>
          <span className="ml-auto">{filtered.length} shown</span>
        </div>
      </div>
    </div>
  );
}
