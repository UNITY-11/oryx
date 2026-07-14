"use client";

import { Item, ItemVariant } from "@/shared/types";
import { useCartStore } from "@/shared/store";
import { ChevronLeft, ChevronDown, Clock, ClipboardList, Check } from "lucide-react";
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
    addItem(item, selectedVariant, selectedAddons);
    router.push("/booking");
  };

  if (item.isProduct) {
    return (
      <div className="absolute inset-0 z-40 bg-surface overflow-y-auto pb-24 px-6 md:px-24 pt-8 md:pt-12 text-center flex flex-col items-center">
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 md:top-8 md:left-8 bg-black/5 border border-primary/20 p-2.5 md:p-3 rounded-full text-primary-dark hover:bg-primary/10 transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <h1 className="font-serif text-3xl md:text-5xl font-medium text-primary-dark mb-8 mt-12 md:mt-0 max-w-4xl">{item.name}</h1>
        
        <div className="w-full max-w-2xl aspect-square rounded-[40px] overflow-hidden mb-12 shadow-sm border border-primary/10">
           <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>

        <div className="max-w-2xl w-full text-left bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-primary/10 mb-20">
          <h2 className="font-serif text-2xl md:text-3xl text-primary-dark mb-4">About the Product</h2>
          <p className="text-text-secondary leading-relaxed text-lg md:text-xl">{item.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col md:flex-row bg-surface overflow-hidden">
      {/* Left Column (Desktop) / Header Image (Mobile) */}
      <div className="relative h-[30vh] md:h-full md:w-1/2 flex-none md:p-6 lg:p-8">
        <div className="w-full h-full relative md:rounded-[40px] overflow-hidden md:shadow-lg">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />

          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/20 p-2.5 md:p-3 rounded-full backdrop-blur-md text-white hover:bg-white/30 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>



          <div className="absolute bottom-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-6 right-6 md:left-12 md:right-12">
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-medium text-white mb-2 md:mb-6 leading-tight">{item.name}</h1>
            {currentDuration && (
              <div className="flex items-center text-sm md:text-lg text-white/90">
                <Clock className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-3" />
                {currentDuration} minutes
              </div>
            )}
            
            {/* Desktop Description */}
            <div className="hidden md:block mt-8">
              <p className="text-white/80 text-lg leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Desktop) / Content Container (Mobile) */}
      <div
        className="flex-1 md:w-1/2 bg-gray-50 md:bg-white rounded-t-4xl md:rounded-none -mt-6 md:mt-0 relative z-10 px-6 md:px-16 pt-8 md:pt-16 pb-42 md:pb-40 overflow-y-auto overscroll-contain scrollbar-hide"
        data-lenis-prevent
      >
        {/* Mobile Description */}
        <div className="md:hidden prose prose-sm text-text-secondary leading-relaxed mb-8">
          <p className="text-[15px]">{item.description}</p>
        </div>

        {/* Variants */}
        {item.variants && item.variants.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h3 className="font-serif text-lg md:text-2xl text-primary-dark mb-4 md:mb-6">Select Duration</h3>
            <div className="space-y-3 md:space-y-4">
              {item.variants.map(variant => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <div
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center justify-between shadow-sm border transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-primary/50 ring-1 md:ring-2 ring-primary/20' : 'border-gray-100 md:border-gray-200'
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary text-[15px] md:text-lg mb-1">{variant.name}</span>
                      <span className="font-semibold text-text-primary text-sm md:text-base">QAR {variant.price}</span>
                    </div>
                    <button
                      className={`px-5 md:px-8 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border text-sm md:text-base font-medium transition-colors ${isSelected
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

            {/* Scroll Indicator */}
            {item.addons && item.addons.length > 0 && (
              <div className="flex justify-center mt-8 text-primary/40 animate-bounce">
                <ChevronDown className="w-6 h-6" />
              </div>
            )}
          </div>
        )}

        {/* Addons */}
        {item.addons && item.addons.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h3 className="font-serif text-lg md:text-2xl text-primary-dark mb-4 md:mb-6">Enhance Your Experience</h3>
            <div className="space-y-3 md:space-y-4">
              {item.addons.map(addon => {
                const isSelected = selectedAddons.some(a => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-6 flex items-center justify-between shadow-sm border transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-primary/50 ring-1 md:ring-2 ring-primary/20' : 'border-gray-100 md:border-gray-200'
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary text-[15px] md:text-lg mb-1">{addon.name}</span>
                      <span className="font-semibold text-text-primary text-sm md:text-base">+ QAR {addon.price}</span>
                    </div>
                    <button
                      className={`px-5 md:px-8 py-1.5 md:py-2.5 rounded-lg md:rounded-xl border text-sm md:text-base font-medium transition-colors ${isSelected
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
      <div className="fixed md:absolute bottom-0 left-0 md:left-1/2 right-0 p-6 md:p-8 md:px-16 bg-white/90 md:bg-white backdrop-blur-xl border-t border-primary/10 z-50">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <span className="text-text-secondary text-sm md:text-lg font-medium">Total</span>
          <span className="font-serif text-2xl md:text-3xl font-bold text-primary-dark">QAR {totalPrice}</span>
        </div>
        <button
          onClick={handleAdd}
          className="w-full bg-primary text-white py-4 md:py-5 rounded-full font-medium text-lg md:text-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98]"
        >
          <ClipboardList className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
          Add to Booking
        </button>
      </div>
    </div>
  );
}
