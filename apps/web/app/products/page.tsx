import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function ProductsPage() {
  const products = ALL_MOCK_ITEMS.filter((item) => item.isProduct);

  return (
    <div className="flex flex-col h-full pt-6 md:pt-36 max-w-screen-2xl mx-auto w-full">
      <div className="px-6 md:px-12 lg:px-16 pb-4">
        <h1 className="font-serif text-3xl md:text-5xl font-medium text-primary-dark">Products</h1>
        <p className="mt-2 md:mt-4 text-text-secondary text-sm md:text-lg">Discover our premium spa products.</p>
      </div>

      <div className="px-6 md:px-12 lg:px-16 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 pb-6 mt-4 md:mt-12">
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
            <div className="p-3 md:p-6 flex flex-col">
              <h3 className="font-serif text-text-primary font-medium text-sm md:text-xl leading-tight line-clamp-1">{item.name}</h3>
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="col-span-2 md:col-span-3 text-center text-text-secondary py-8">No products available.</p>
        )}
      </div>
    </div>
  );
}
