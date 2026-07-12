"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Flower2, Droplets, Scissors } from "lucide-react";
import { HeroCarousel } from "@/features/catalog/hero-carousel";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { Item } from "@/shared/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = ALL_MOCK_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header & Search */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex justify-center items-center mb-4">
          <h1 className="font-serif text-3xl font-bold tracking-widest text-primary-dark">ORYX</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search treatments or products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="px-6 pb-6 space-y-8 flex-1">
        {/* Hero Carousel */}
        {!searchQuery && (
          <section className="mt-2">
            <HeroCarousel />
          </section>
        )}

        {/* Categories Section */}
        {!searchQuery && (
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif text-xl text-primary-dark">Categories</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "Massage", icon: <Flower2 className="w-6 h-6" /> },
                { name: "Facial", icon: <Sparkles className="w-6 h-6" /> },
                { name: "Nails", icon: <Scissors className="w-6 h-6" /> },
                { name: "Therapy", icon: <Droplets className="w-6 h-6" /> },
              ].map((cat, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary mt-2">{cat.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banner */}
        {!searchQuery && (
          <section>
            <div className="w-full bg-primary/10 rounded-3xl p-5 flex items-center justify-between border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="relative z-10">
                <span className="text-xs font-bold text-primary tracking-wider uppercase mb-1 block">Special Offer</span>
                <h3 className="font-serif text-lg text-primary-dark mb-1">Get 20% Off Your First Visit</h3>
                <p className="text-xs text-text-secondary">Use code <strong className="text-primary-dark bg-white px-2 py-0.5 rounded ml-1">ORYX20</strong> at checkout.</p>
              </div>
            </div>
          </section>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section>
            <h2 className="font-serif text-xl text-primary-dark mb-4">Search Results</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {filteredItems.map(item => (
                <Link href={`/service/${item.id}`} key={item.id} className="flex-none w-44 group block">
                  <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02]">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <h3 className="absolute bottom-4 left-4 right-4 font-serif text-white font-medium text-lg leading-tight drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-center text-text-secondary py-8 w-full">No items found.</p>
              )}
            </div>
          </section>
        )}

        {/* Featured Services */}
        {!searchQuery && (
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif text-xl text-primary-dark">Featured Services</h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {filteredItems.filter(item => !item.isProduct).map(item => (
                <Link href={`/service/${item.id}`} key={item.id} className="flex-none w-44 group block">
                  <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02]">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <h3 className="absolute bottom-4 left-4 right-4 font-serif text-white font-medium text-lg leading-tight drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        {!searchQuery && (
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif text-xl text-primary-dark">Shop Products</h2>
              <Link href="/products" className="text-sm text-primary font-medium">Show All</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.filter(item => item.isProduct).slice(0, 6).map(item => (
                <Link href={`/service/${item.id}`} key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm transition-transform group-hover:scale-[1.02]">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                    <h3 className="font-serif text-white font-medium text-sm leading-tight drop-shadow-md line-clamp-1">{item.name}</h3>
                    <span className="font-sans font-semibold text-primary mt-1 text-sm">${item.price}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/products" className="mt-4 w-full block text-center py-3 rounded-2xl border border-gray-200 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              View All Products
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
