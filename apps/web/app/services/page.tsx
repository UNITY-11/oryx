import Link from "next/link";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { Scissors } from "lucide-react";

export default function ServicesPage() {
  const services = ALL_MOCK_ITEMS.filter((item) => !item.isProduct);

  return (
    <div className="mx-auto flex h-full w-full max-w-screen-2xl flex-col pt-6 md:pt-36">
      <div className="px-6 pb-4 md:px-12 lg:px-16">
        <h1 className="text-surface font-serif text-3xl font-medium md:text-5xl">
          Services
        </h1>
        <p className="text-text-secondary mt-2 text-sm md:mt-4 md:text-lg">
          Explore our signature spa treatments.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 px-6 pb-6 md:mt-12 md:grid-cols-3 md:gap-8 md:px-12 lg:px-16">
        {services.map((item) => (
          <Link
            key={item.id}
            href={`/service/${item.id}`}
            className="group block"
          >
            <div className="relative h-56 w-full overflow-hidden rounded-2xl shadow-sm transition-transform group-hover:scale-[1.02] md:h-80">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute right-2 bottom-4 left-2 text-center md:right-6 md:bottom-8 md:left-6 md:text-left">
                <h3 className="font-serif text-sm leading-tight font-medium text-white drop-shadow-md md:text-2xl">
                  {item.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
        {services.length === 0 && (
          <p className="text-text-secondary col-span-2 py-8 text-center">
            No services available.
          </p>
        )}
      </div>
    </div>
  );
}
