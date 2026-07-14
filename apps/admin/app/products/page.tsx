"use client";

import { useState } from "react";
import { Search, ImageIcon, Package } from "lucide-react";
import Link from "next/link";
import { MOCK_PRODUCTS, Product, ProductCategory } from "../../src/features/products/mock-data";

const CATEGORY_FILTERS: Array<ProductCategory | "All"> = [
  "All", "Skincare", "Body Care", "Hair Care", "Aromatherapy", "Accessories", "Supplements",
];

export default function ProductsPage() {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");

  const filtered = products
    .filter((p) => categoryFilter === "All" || p.category === categoryFilter)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeCount = products.filter((p) => p.status === "Active").length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <div className="p-4 md:p-6 border-b border-primary/10 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border border-primary rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-primary-dark placeholder:text-primary/70 text-sm"
            />
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
                  {product.stock === 0 && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-red-500 px-2 py-1 rounded-full border border-red-100">
                      Out of stock
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 10 && (
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
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
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
