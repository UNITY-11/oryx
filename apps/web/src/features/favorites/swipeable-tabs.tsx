"use client";

import { useState, useRef, TouchEvent, useEffect } from "react";
import { Item } from "@/shared/types";
import { Heart, Sparkles, ArrowRight } from "lucide-react";
import { useFavoritesStore } from "@/shared/store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SwipableFavorites() {
  const [activeTab, setActiveTab] = useState<"services" | "products">("services");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  // Use the actual Zustand store for favorites
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Touch gesture state
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEnd.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeTab === "services") {
      setActiveTab("products");
    } else if (isRightSwipe && activeTab === "products") {
      setActiveTab("services");
    }
  };

  const services = favorites.filter(i => !i.isProduct);
  const products = favorites.filter(i => i.isProduct);

  const ItemList = ({ items }: { items: Item[] }) => {
    if (!isMounted) return null;

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-6 text-center space-y-6 animate-in fade-in duration-500" style={{ minHeight: "calc(100vh - 300px)" }}>
          <div className="relative">
            <Heart className="w-20 h-20 text-[#E5C37A]/20" />
            <Heart className="w-20 h-20 text-[#E5C37A] absolute inset-0 animate-pulse opacity-50" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-primary-dark mb-2">No Favorites Yet</h3>
            <p className="text-text-secondary text-sm max-w-[250px] mx-auto">
              Discover our signature treatments and curated products to build your perfect spa experience.
            </p>
          </div>
          <Link href="/services" className="bg-[#E5C37A] text-white px-8 py-3.5 rounded-full font-medium shadow-md hover:opacity-90 transition-all flex items-center">
            Explore Collection <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-6 pb-24 px-4 md:px-0 max-w-5xl mx-auto">
        {items.map(item => {
          const favorite = isFavorite(item.id);
          
          return (
            <div 
              key={item.id} 
              className="relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-white shadow-sm border border-primary/10 group cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
              onClick={() => router.push(item.isProduct ? `/product/${item.id}` : `/session/${item.id}`)}
            >
              <div className="h-40 md:h-56 w-full relative overflow-hidden">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                
                {/* Floating Heart Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item);
                  }}
                  className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 rounded-full backdrop-blur-md transition-all z-10 shadow-sm
                    ${favorite ? 'bg-white text-[#E5C37A]' : 'bg-black/20 text-white hover:bg-white/30'}
                  `}
                >
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${favorite ? 'fill-[#E5C37A]' : ''}`} />
                </button>
              </div>
                
              {/* Content Below Image */}
              <div className="p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-[13px] md:text-lg text-primary-dark leading-snug truncate">{item.name}</h3>
                </div>
                <div className="mt-2 md:mt-3">
                  <p className="text-[#E5C37A] font-bold text-sm md:text-base">QAR {item.price}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Tabs */}
      <div className="w-full px-6 md:px-8 mt-4 shrink-0 relative">
        <div className="flex w-full md:max-w-md relative z-10">
          <button 
            onClick={() => setActiveTab("services")}
            className={`flex-1 pb-4 text-[15px] md:text-base font-medium transition-colors ${activeTab === "services" ? "text-[#E5C37A]" : "text-text-secondary"}`}
            style={activeTab === "services" ? { borderBottom: "2px solid #E5C37A", color: "#E5C37A" } : { borderBottom: "2px solid transparent" }}
          >
            Services
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`flex-1 pb-4 text-[15px] md:text-base font-medium transition-colors ${activeTab === "products" ? "text-[#E5C37A]" : "text-text-secondary"}`}
            style={activeTab === "products" ? { borderBottom: "2px solid #E5C37A", color: "#E5C37A" } : { borderBottom: "2px solid transparent" }}
          >
            Products
          </button>
        </div>
        {/* Full width bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#9a8276] opacity-20 z-0" />
      </div>

      {/* Swipable Area */}
      <div 
        className="flex-1 overflow-hidden relative bg-transparent flex flex-col min-h-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex-1 flex w-[200%] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] min-h-0"
          style={{ transform: activeTab === "products" ? "translateX(-50%)" : "translateX(0%)" }}
        >
          {/* Services Tab */}
          <div className="w-1/2 flex-1 overflow-y-auto scrollbar-hide relative pb-20 md:pb-8 flex flex-col min-h-0">
            <ItemList items={services} />
          </div>

          {/* Products Tab */}
          <div className="w-1/2 flex-1 overflow-y-auto scrollbar-hide relative pb-20 md:pb-8 flex flex-col min-h-0">
            <ItemList items={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
