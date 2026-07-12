import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function ProductsPage() {
  const products = ALL_MOCK_ITEMS.filter((item) => item.isProduct);

  return (
    <div className="flex flex-col h-full pt-6">
      <div className="px-6 pb-4">
        <h1 className="font-serif text-3xl font-medium text-primary-dark">Products</h1>
        <p className="mt-2 text-text-secondary text-sm">Discover our premium spa products.</p>
      </div>

      <div className="px-6 grid grid-cols-2 gap-4 pb-32">
        {products.map((item) => (
          <Link 
            key={item.id}
            href={`/service/${item.id}`}
            className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm transition-transform group-hover:scale-[1.02]"
          >
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex flex-col">
              <h3 className="font-serif text-white font-medium text-sm leading-tight drop-shadow-md line-clamp-1">{item.name}</h3>
              <span className="font-sans font-semibold text-primary mt-1 text-sm">${item.price}</span>
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="col-span-2 text-center text-text-secondary py-8">No products available.</p>
        )}
      </div>
    </div>
  );
}
