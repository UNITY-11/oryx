import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { ServiceDetailClient } from "@/features/catalog/service-detail-client";
import { notFound } from "next/navigation";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = ALL_MOCK_ITEMS.find((i) => i.id === id);

  if (!item) {
    notFound();
  }

  return <ServiceDetailClient item={item} />;
}
