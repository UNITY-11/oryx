"use client";

import { Item, ItemVariant } from "@/shared/types";
import { useCartStore } from "@/shared/store";
import { ChevronLeft, Clock, ClipboardList, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ServiceDetailClient({ item }: { item: Item }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.items);

  const existingCartItem = cartItems.find(i => i.item.id === item.id);

  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | undefined>(
    existingCartItem?.selectedVariant || (item.variants && item.variants.length > 0 ? item.variants[0] : undefined)
  );

  const [selectedAddons, setSelectedAddons] = useState<ItemVariant[]>(
    existingCartItem?.selectedAddons || []
  );

  const toggleAddon = (addon: ItemVariant) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const currentPrice = selectedVariant ? selectedVariant.price : item.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = currentPrice + addonsTotal;

  const currentDuration = selectedVariant ? selectedVariant.duration : item.duration;

  const handleAdd = () => {
    clearCart();
    addItem(item, selectedVariant, selectedAddons);
    router.push("/booking");
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-surface overflow-hidden">
      {/* Header Image */}
      <div className="relative h-[25vh] w-full flex-none">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-12 left-6 bg-white/20 p-2.5 rounded-full backdrop-blur-md text-white hover:bg-white/30 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-10 left-6 right-6">
          <h1 className="font-serif text-3xl font-medium text-white mb-2 leading-tight">{item.name}</h1>
          {currentDuration && (
            <div className="flex items-center text-sm text-white/80">
              <Clock className="w-4 h-4 mr-1.5" />
              {currentDuration} minutes
            </div>
          )}
        </div>
      </div>

      {/* Content Container (Overlapping) */}
      <div
        className="flex-1 bg-gray-50 rounded-t-4xl -mt-6 relative z-10 px-6 pt-8 pb-42 overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        <div className="prose prose-sm text-text-secondary leading-relaxed mb-8">
          <p className="text-[15px]">{item.description}</p>
        </div>

        {/* Variants */}
        {item.variants && item.variants.length > 0 && (
          <div className="mb-8">
            <h3 className="font-serif text-lg text-primary-dark mb-4">Select Duration</h3>
            <div className="space-y-3">
              {item.variants.map(variant => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <div
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border transition-all cursor-pointer ${isSelected ? 'border-primary/50 ring-1 ring-primary/20' : 'border-gray-100'
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary text-[15px] mb-1">{variant.name}</span>
                      <span className="font-semibold text-text-primary text-sm">${variant.price}</span>
                    </div>
                    <button
                      className={`px-5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isSelected
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-gray-200 text-text-secondary'
                        }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Addons */}
        {item.addons && item.addons.length > 0 && (
          <div className="mb-8">
            <h3 className="font-serif text-lg text-primary-dark mb-4">Enhance Your Experience</h3>
            <div className="space-y-3">
              {item.addons.map(addon => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border transition-all cursor-pointer ${isSelected ? 'border-primary/50 ring-1 ring-primary/20' : 'border-gray-100'
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary text-[15px] mb-1">{addon.name}</span>
                      <span className="font-semibold text-text-primary text-sm">+${addon.price}</span>
                    </div>
                    <button
                      className={`px-5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isSelected
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-gray-200 text-text-secondary'
                        }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-primary/10 z-50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-secondary text-sm font-medium">Total</span>
          <span className="font-serif text-2xl font-bold text-primary-dark">${totalPrice}</span>
        </div>
        <button
          onClick={handleAdd}
          className="w-full bg-primary text-white py-4 rounded-full font-medium text-lg flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98]"
        >
          <ClipboardList className="w-5 h-5 mr-2" />
          Add to Booking
        </button>
      </div>
    </div>
  );
}
