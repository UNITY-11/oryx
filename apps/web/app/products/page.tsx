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
            className="flex flex-col bg-gray-50 rounded-2xl overflow-hidden group border border-gray-100"
          >
            <div className="relative aspect-square w-full bg-white">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
            </div>
            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-medium text-sm text-text-primary line-clamp-1">{item.name}</h3>
                <span className="font-medium text-primary mt-1 block">${item.price}</span>
              </div>
              <button className="mt-3 bg-white border border-gray-200 text-text-primary text-xs font-medium py-2 rounded-lg flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                <ShoppingBag className="w-3.5 h-3.5 mr-1" /> View Detail
              </button>
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
