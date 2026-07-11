"use client";

import { useState, useRef, TouchEvent } from "react";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { Item } from "@/shared/types";
import { Heart } from "lucide-react";

export function SwipableFavorites() {
  const [activeTab, setActiveTab] = useState<"services" | "products">("services");
  
  // Touch gesture state
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
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

  // Mock favorites for demonstration
  const favoriteItems = ALL_MOCK_ITEMS.slice(0, 3);
  const services = favoriteItems.filter(i => !i.isProduct);
  const products = favoriteItems.filter(i => i.isProduct);

  const ItemList = ({ items }: { items: Item[] }) => (
    <div className="space-y-4 pt-4">
      {items.map(item => (
        <div key={item.id} className="relative flex bg-surface rounded-soft overflow-hidden shadow-sm h-28">
          <img src={item.imageUrl} alt={item.name} className="w-28 h-full object-cover" />
          <div className="p-3 flex flex-col justify-between flex-1">
            <div>
              <h3 className="font-medium text-sm text-text-primary line-clamp-1">{item.name}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 mt-1">{item.description}</p>
            </div>
            <span className="font-medium text-primary">${item.price}</span>
          </div>
          <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-primary">
            <Heart className="w-4 h-4 fill-primary" />
          </button>
        </div>
      ))}
      {items.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-text-secondary">
          <Heart className="w-12 h-12 mb-3 opacity-20" />
          <p>No favorites yet.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Tabs */}
      <div className="flex w-full border-b border-primary/20 mt-4 relative">
        <button 
          onClick={() => setActiveTab("services")}
          className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "services" ? "text-primary" : "text-text-secondary"}`}
        >
          Services
        </button>
        <button 
          onClick={() => setActiveTab("products")}
          className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === "products" ? "text-primary" : "text-text-secondary"}`}
        >
          Products
        </button>
        {/* Animated indicator */}
        <div 
          className="absolute bottom-0 h-0.5 bg-primary transition-transform duration-300 w-1/2"
          style={{ transform: activeTab === "products" ? "translateX(100%)" : "translateX(0%)" }}
        />
      </div>

      {/* Swipable Area */}
      <div 
        className="flex-1 overflow-hidden relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex w-[200%] h-full transition-transform duration-300 ease-in-out"
          style={{ transform: activeTab === "products" ? "translateX(-50%)" : "translateX(0%)" }}
        >
          <div className="w-1/2 px-6 h-full overflow-y-auto pb-24">
            <ItemList items={services} />
          </div>
          <div className="w-1/2 px-6 h-full overflow-y-auto pb-24">
            <ItemList items={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
