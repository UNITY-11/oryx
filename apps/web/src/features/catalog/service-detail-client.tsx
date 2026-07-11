"use client";

import { Item } from "@/shared/types";
import { useCartStore } from "@/shared/store";
import { ChevronLeft, Clock, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function ServiceDetailClient({ item }: { item: Item }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem(item);
    router.push("/booking");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="relative h-72 w-full">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button 
          onClick={() => router.back()}
          className="absolute top-12 left-6 bg-white/20 p-2 rounded-full backdrop-blur-md text-white hover:bg-white/40 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-6 pb-32">
        <div className="flex justify-between items-start mb-4">
          <h1 className="font-serif text-3xl font-medium text-primary-dark">{item.name}</h1>
          <span className="font-serif text-2xl font-bold text-primary">${item.price}</span>
        </div>
        
        {item.duration && (
          <div className="flex items-center text-sm text-text-secondary mb-6">
            <Clock className="w-4 h-4 mr-1.5" />
            {item.duration} minutes
          </div>
        )}

        <div className="prose prose-sm text-text-secondary leading-relaxed">
          <h3 className="text-primary-dark font-medium mb-2 text-base">Description</h3>
          <p>{item.description}</p>
          <p className="mt-4">
            Our luxury spa treatments use only the finest natural ingredients to ensure a rejuvenating and relaxing experience. Our therapists are highly trained to customize this treatment exactly for your needs.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 pb-safe">
        <button 
          onClick={handleAdd}
          className="w-full bg-primary text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark transition"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Add to Booking
        </button>
      </div>
    </div>
  );
}
