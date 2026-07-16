import Link from "next/link";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { ShoppingBag } from "lucide-react";

export default function ProductsPage() {
  const products = ALL_MOCK_ITEMS.filter((item) => item.isProduct);

  return (
    <div className="mx-auto flex h-full w-full max-w-screen-2xl flex-col pt-6 md:pt-36">
      <div className="px-6 pb-4 md:px-12 lg:px-16">
        <h1 className="text-surface font-serif text-3xl font-medium md:text-5xl">
          Products
        </h1>
        <p className="text-text-secondary mt-2 text-sm md:mt-4 md:text-lg">
          Discover our premium spa products.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 px-6 pb-6 md:mt-12 md:grid-cols-3 md:gap-4 md:px-12 lg:px-16">
        {products.map((item) => (
          <Link
            key={item.id}
            href={`/service/${item.id}`}
            className="bg-surface flex flex-col overflow-hidden rounded-2xl shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="relative aspect-square">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col p-3 md:p-6">
              <h3 className="text-text-primary line-clamp-1 font-serif text-sm leading-tight font-medium md:text-xl">
                {item.name}
              </h3>
            </div>
          </Link>
        ))}
        {products.length === 0 && (
          <p className="text-text-secondary col-span-2 py-8 text-center md:col-span-3">
            No products available.
          </p>
        )}
      </div>
    </div>
  );
}
