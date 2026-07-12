import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import Link from "next/link";
import { Scissors } from "lucide-react";

export default function ServicesPage() {
  const services = ALL_MOCK_ITEMS.filter((item) => !item.isProduct);

  return (
    <div className="flex flex-col h-full pt-6">
      <div className="px-6 pb-4">
        <h1 className="font-serif text-3xl font-medium text-primary-dark">Services</h1>
        <p className="mt-2 text-text-secondary text-sm">Explore our signature spa treatments.</p>
      </div>

      <div className="px-6 grid grid-cols-2 gap-4 pb-32">
        {services.map((item) => (
          <Link 
            key={item.id}
            href={`/service/${item.id}`}
            className="group block"
          >
            <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02]">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-2 right-2 text-center">
                <h3 className="font-serif text-white font-medium text-sm leading-tight drop-shadow-md">
                  {item.name}
                </h3>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="font-sans font-semibold text-primary-dark text-sm">${item.price}</span>
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
