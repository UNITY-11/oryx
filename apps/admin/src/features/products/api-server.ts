import { PRODUCTS_LIST_QUERY } from "@/features/products/sanity-queries";
import type { Product } from "@/features/products/types";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function fetchServerProducts(): Promise<Product[]> {
  const products = await sanityClient.fetch<Product[]>(PRODUCTS_LIST_QUERY);
  return products;
}
