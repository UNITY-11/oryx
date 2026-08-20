import { fetchServices } from "@/features/catalog/sanity";
import { ServicesPageClient } from "@/features/catalog/services-page-client";

export const revalidate = 3600; // ISR fallback (1 hour)

export default async function ServicesPage() {
  const services = await fetchServices();
  return <ServicesPageClient initialServices={services} />;
}
