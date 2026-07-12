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
            className="flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="relative aspect-square">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-3 flex flex-col">
              <h3 className="font-serif text-text-primary font-medium text-sm leading-tight line-clamp-2">{item.name}</h3>
              <span className="font-sans font-semibold text-primary-dark mt-1.5 text-sm">${item.price}</span>
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
