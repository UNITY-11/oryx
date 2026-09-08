import { notFound } from "next/navigation";
import { fetchItemById } from "@/features/catalog/sanity";
import { ServiceDetailClient } from "@/features/catalog/service-detail-client";

export const revalidate = 60; // ISR fallback; admin triggers on-demand revalidation

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await fetchItemById(id);

  if (!item) {
    notFound();
  }

  return <ServiceDetailClient item={item} />;
}
