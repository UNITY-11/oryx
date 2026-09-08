import { fetchCatalogItems, fetchHeroItems } from "@/features/catalog/sanity";
import { HomePageClient } from "@/features/home/home-page-client";

export const revalidate = 60; // ISR fallback; admin triggers on-demand revalidation

export default async function HomePage() {
  const [items, slides] = await Promise.all([
    fetchCatalogItems(),
    fetchHeroItems(),
  ]);

  return <HomePageClient initialItems={items} initialSlides={slides} />;
}
