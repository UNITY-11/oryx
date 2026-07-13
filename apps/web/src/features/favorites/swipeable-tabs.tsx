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
        <div className="flex flex-col items-center justify-center h-full px-6 text-center space-y-6 pt-24 animate-in fade-in duration-500">
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
      <div className="space-y-6 pt-6 pb-24 px-6 md:px-0 max-w-2xl mx-auto">
        {items.map(item => {
          const favorite = isFavorite(item.id);
          
          return (
            <div 
              key={item.id} 
              className="relative rounded-3xl overflow-hidden shadow-lg border border-primary/10 group cursor-pointer transition-all active:scale-[0.98]"
              onClick={() => router.push(item.isProduct ? `/product/${item.id}` : `/session/${item.id}`)}
            >
              <div className="h-64 w-full relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Floating Heart Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item);
                  }}
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all z-10 shadow-sm
                    ${favorite ? 'bg-white text-[#E5C37A]' : 'bg-black/30 text-white hover:bg-white/30'}
                  `}
                >
                  <Heart className={`w-5 h-5 transition-colors ${favorite ? 'fill-[#E5C37A]' : ''}`} />
                </button>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  <div className="flex justify-between items-end">
                    <div className="flex-1 pr-4">
                      <h3 className="font-serif text-2xl text-white mb-1 leading-tight shadow-sm drop-shadow-md">{item.name}</h3>
                      <p className="text-white/80 text-sm line-clamp-1 flex items-center drop-shadow-sm">
                        {item.category}
                        <span className="mx-2 opacity-50">•</span>
                        {item.duration || "Item"}
                      </p>
                    </div>
                    <div className="shrink-0 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                      <span className="font-medium text-white shadow-sm drop-shadow-sm">QAR {item.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Tabs */}
      <div className="flex w-full border-b border-primary/20 mt-2 px-6 relative shrink-0">
        <button 
          onClick={() => setActiveTab("services")}
          className={`flex-1 pb-4 text-[15px] font-medium transition-colors ${activeTab === "services" ? "text-primary" : "text-text-secondary"}`}
        >
          Services
        </button>
        <button 
          onClick={() => setActiveTab("products")}
          className={`flex-1 pb-4 text-[15px] font-medium transition-colors ${activeTab === "products" ? "text-primary" : "text-text-secondary"}`}
        >
          Products
        </button>
        {/* Animated indicator */}
        <div 
          className="absolute bottom-0 h-0.5 bg-primary transition-transform duration-300 w-[calc(50%-1.5rem)]"
          style={{ transform: activeTab === "products" ? "translateX(100%)" : "translateX(0%)" }}
        />
      </div>

      {/* Swipable Area */}
      <div 
        className="flex-1 overflow-hidden relative bg-surface md:bg-transparent"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ transform: activeTab === "products" ? "translateX(-50%)" : "translateX(0%)" }}
        >
          {/* Services Tab */}
          <div className="w-1/2 h-full overflow-y-auto scrollbar-hide relative pb-20 md:pb-8">
            <ItemList items={services} />
          </div>

          {/* Products Tab */}
          <div className="w-1/2 h-full overflow-y-auto scrollbar-hide relative pb-20 md:pb-8">
            <ItemList items={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
