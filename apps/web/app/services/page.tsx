import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import Link from "next/link";
import { Scissors } from "lucide-react";

export default function ServicesPage() {
  const services = ALL_MOCK_ITEMS.filter((item) => !item.isProduct);

  return (
    <div className="flex flex-col h-full pt-6 md:pt-36 max-w-screen-2xl mx-auto w-full">
      <div className="px-6 md:px-12 lg:px-16 pb-4">
        <h1 className="font-serif text-3xl md:text-5xl font-medium text-primary-dark">Services</h1>
        <p className="mt-2 md:mt-4 text-text-secondary text-sm md:text-lg">Explore our signature spa treatments.</p>
      </div>

      <div className="px-6 md:px-12 lg:px-16 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 pb-6 mt-4 md:mt-12">
        {services.map((item) => (
          <Link 
            key={item.id}
            href={`/service/${item.id}`}
            className="group block"
          >
            <div className="relative h-56 md:h-80 w-full rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02]">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 md:bottom-8 left-2 right-2 md:left-6 md:right-6 text-center md:text-left">
                <h3 className="font-serif text-white font-medium text-sm md:text-2xl leading-tight drop-shadow-md">
                  {item.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
        {services.length === 0 && (
          <p className="col-span-2 text-center text-text-secondary py-8">No services available.</p>
        )}
      </div>
    </div>
  );
}
