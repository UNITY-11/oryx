"use client";

import { useState, useEffect, Suspense } from "react";
import { Search, ImageIcon, Star } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MOCK_SERVICES, Service, ServiceCategory } from "../../src/features/services/mock-data";
import { AddServiceModal } from "../../src/features/services/add-service-modal";

const CATEGORY_FILTERS: Array<ServiceCategory | "All"> = [
  "All", "Massage", "Facial", "Body Treatment", "Hair", "Nails", "Package",
];

function ServicesContent() {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | "All">("All");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams]);

  const handleAddService = (newService: Service) => {
    setServices([newService, ...services]);
    router.push("/services");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/services");
  };

  const filtered = services
    .filter((s) => categoryFilter === "All" || s.category === categoryFilter)
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <div className="p-4 md:p-6 border-b border-primary/10 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border border-primary rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-primary-dark placeholder:text-primary/70 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  categoryFilter === cat
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-text-secondary border-primary/10 hover:bg-primary/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="overflow-auto scrollbar-hide flex-1 p-4 md:p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
              <ImageIcon className="w-10 h-10 mb-3 text-primary/20" />
              <p>No services found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {/* Add Service Card */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all text-primary/50 hover:text-primary"
                style={{ aspectRatio: "3/4" }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                  <span className="text-2xl font-light leading-none">+</span>
                </div>
                <span className="text-sm font-medium text-center px-4">Add Service</span>
              </button>

              {/* Service Cards — image only, no labels or price */}
              {filtered.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all bg-gradient-to-br from-primary/10 to-primary/5"
                  style={{ aspectRatio: "3/4" }}
                >
                  {/* Full-bleed image */}
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-primary/20" />
                    </div>
                  )}

                  {/* Name appears only on hover at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-semibold leading-tight">{service.name}</p>
                  </div>

                  {/* Inactive dim overlay */}
                  {service.status === "Inactive" && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-3 border-t border-primary/5 shrink-0 flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary" />
            {services.filter((s) => s.status === "Active").length} Active
          </span>
          <span>{services.filter((s) => s.status === "Inactive").length} Inactive</span>
          <span className="ml-auto">{filtered.length} shown</span>
        </div>
      </div>

      <AddServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddService={handleAddService}
      />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
