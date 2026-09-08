import { fetchServices } from "@/features/catalog/sanity";
import { ServicesPageClient } from "@/features/catalog/services-page-client";

export const revalidate = 60; // ISR fallback; admin triggers on-demand revalidation

export default async function ServicesPage() {
  const services = await fetchServices();
  return <ServicesPageClient initialServices={services} />;
}
