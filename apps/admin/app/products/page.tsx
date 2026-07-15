"use client";

import { useState } from "react";
import { Search, ImageIcon, Package, ChevronDown } from "lucide-react";
import Link from "next/link";
import { MOCK_PRODUCTS, Product, ProductCategory } from "../../src/features/products/mock-data";

const CATEGORY_FILTERS: Array<ProductCategory | "All"> = [
  "All", "Skincare", "Body Care", "Hair Care", "Aromatherapy", "Accessories", "Supplements",
];

export default function ProductsPage() {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [sortBy, setSortBy] = useState("Default");
  const [isSortOpen, setIsSortOpen] = useState(false);

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
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <div className="p-4 md:p-6 border-b border-primary/10 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent border border-primary rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-primary-dark placeholder:text-primary/70 text-sm"
              />
            </div>
            <div className="relative w-full sm:w-48 shrink-0 z-40">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full flex items-center justify-between pl-5 pr-4 py-3 bg-white border border-primary/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-primary-dark text-sm cursor-pointer hover:bg-primary/5 transition-all font-medium shadow-sm"
              >
                <span className="truncate">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-full min-w-[180px] bg-white rounded-2xl shadow-xl border border-primary/10 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
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

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  categoryFilter === cat
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-text-secondary border-primary/10 hover:bg-primary/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="overflow-auto scrollbar-hide flex-1 p-4 md:p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
              <Package className="w-10 h-10 mb-3 text-primary/20" />
              <p>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">

              {/* Add Product Card */}
              <Link
                href="/products/new"
                className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all text-primary/50 hover:text-primary"
                style={{ aspectRatio: "3/4" }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                  <span className="text-2xl font-light leading-none">+</span>
                </div>
                <span className="text-sm font-medium text-center px-4">Add Product</span>
              </Link>

              {/* Product Cards — image only */}
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all bg-gradient-to-br from-primary/10 to-primary/5"
                  style={{ aspectRatio: "3/4" }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-10 h-10 text-primary/20" />
                    </div>
                  )}

                  {/* Stock badge */}
                  {product.quantity === 0 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-red-500 px-2 py-1 rounded-full border border-red-100">
                      Out of stock
                    </div>
                  )}
                  {product.quantity > 0 && product.quantity <= 10 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-amber-600 px-2 py-1 rounded-full border border-amber-100">
                      Low stock
                    </div>
                  )}

                  {/* Name on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-semibold leading-tight">{product.name}</p>
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
        <div className="px-6 py-3 border-t border-primary/5 shrink-0 flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3 text-primary" />
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
