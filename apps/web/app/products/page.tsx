import Link from "next/link";
import { fetchProducts } from "@/features/catalog/sanity";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  let error: string | null = null;

  try {
    products = await fetchProducts();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load products";
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-screen-2xl flex-col pt-6 md:pt-24">
      <div className="mt-4 grid grid-cols-2 gap-4 px-6 pb-6 md:mt-12 md:grid-cols-3 md:px-12 lg:grid-cols-2 lg:gap-8 lg:px-16">
        {error && (
          <p className="col-span-2 py-8 text-center text-red-500 md:col-span-3 lg:col-span-2">
            {error}
          </p>
        )}
        {!error &&
          products.map((item) => (
            <Link
              key={item.id}
              href={`/service/${item.id}`}
              className="bg-surface flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-square lg:w-1/2 lg:shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-3 md:p-6 lg:w-1/2 lg:p-8">
                <h3 className="text-text-primary line-clamp-2 font-serif text-sm leading-tight font-medium md:text-xl lg:text-2xl">
                  {item.name}
                </h3>
              </div>
            </Link>
          ))}
        {!error && products.length === 0 && (
          <p className="text-text-secondary col-span-2 py-8 text-center md:col-span-3 lg:col-span-4">
            No products available.
          </p>
        )}
      </div>
    </div>
  );
}
