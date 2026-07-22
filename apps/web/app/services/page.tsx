import Link from "next/link";
import { fetchServices } from "@/features/catalog/sanity";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof fetchServices>> = [];
  let error: string | null = null;

  try {
    services = await fetchServices();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load services";
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-screen-2xl flex-col pt-6 md:pt-24">
      <div className="mt-4 grid grid-cols-2 gap-4 px-6 pb-6 md:mt-12 md:grid-cols-3 md:gap-8 md:px-12 lg:px-16">
        {error && (
          <p className="col-span-2 py-8 text-center text-red-500 md:col-span-3">
            {error}
          </p>
        )}
        {!error &&
          services.map((item) => (
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
        {!error && services.length === 0 && (
          <p className="text-text-secondary col-span-2 py-8 text-center md:col-span-3">
            No services available.
          </p>
        )}
      </div>
    </div>
  );
}
