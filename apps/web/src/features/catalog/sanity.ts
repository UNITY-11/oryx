import { sanityClient } from "@/shared/lib/sanity/client";
import { Category, Item } from "@/shared/types";
import { SERVICE_PROJECTION, PRODUCT_PROJECTION } from "@repo/sanity";

const PLACEHOLDER_IMAGE = "/images/services/image.png";

type SanityPricingTier = {
  id?: string;
  label?: string;
  price?: number;
  duration?: number;
};

type SanityAddon = {
  id?: string;
  name?: string;
  price?: number;
  duration?: number;
};

type SanityService = {
  id: string;
  name: string;
  category?: string;
  status?: string;
  description?: string;
  shortDescription?: string;
  image?: string | null;
  pricingTiers?: SanityPricingTier[];
  addons?: SanityAddon[];
};

type SanityProduct = {
  id: string;
  name: string;
  brand?: string;
  volumeOrWeight?: string;
  quantity?: number;
  price?: number;
  category?: string;
  image?: string | null;
  status?: string;
};

export const ACTIVE_SERVICES_QUERY = `*[_type == "service" && status == "Active"] | order(name asc) ${SERVICE_PROJECTION}`;
export const ACTIVE_PRODUCTS_QUERY = `*[_type == "product" && status == "Active"] | order(name asc) ${PRODUCT_PROJECTION}`;
export const SERVICE_BY_ID_QUERY = `*[_type == "service" && _id == $id][0] ${SERVICE_PROJECTION}`;
export const PRODUCT_BY_ID_QUERY = `*[_type == "product" && _id == $id][0] ${PRODUCT_PROJECTION}`;

import { HERO_PROJECTION } from "@repo/sanity";
export const HERO_LIST_QUERY = `*[_type == "hero"] | order(order asc) ${HERO_PROJECTION}`;

function asCategory(value: string | undefined, fallback: Category): Category {
  return (value as Category) || fallback;
}

export function mapServiceToItem(service: SanityService): Item {
  const tiers = service.pricingTiers ?? [];
  const firstTier = tiers[0];
  const variants =
    tiers.length > 0
      ? tiers.map((tier, index) => ({
          id: tier.id || `tier-${index}`,
          name: tier.label || `${tier.duration ?? 60} min`,
          price: tier.price ?? 0,
          duration: tier.duration,
        }))
      : undefined;

  const addons =
    (service.addons ?? []).length > 0
      ? (service.addons ?? []).map((addon, index) => ({
          id: addon.id || `addon-${index}`,
          name: addon.name || "Add-on",
          price: addon.price ?? 0,
          duration: addon.duration,
        }))
      : undefined;

  return {
    id: service.id,
    name: service.name,
    description: service.description || service.shortDescription || "",
    price: firstTier?.price ?? 0,
    duration: firstTier?.duration,
    category: asCategory(service.category, "Massage"),
    imageUrl: service.image || PLACEHOLDER_IMAGE,
    isProduct: false,
    variants,
    addons,
  };
}

export function mapProductToItem(product: SanityProduct): Item {
  const details = [product.brand, product.volumeOrWeight]
    .filter(Boolean)
    .join(" · ");
  return {
    id: product.id,
    name: product.name,
    description: details || product.category || "Spa product",
    price: product.price ?? 0,
    category: asCategory(product.category, "Products"),
    imageUrl: product.image || PLACEHOLDER_IMAGE,
    isProduct: true,
  };
}

export async function fetchCatalogItems(): Promise<Item[]> {
  const [services, products] = await Promise.all([
    sanityClient.fetch<SanityService[]>(ACTIVE_SERVICES_QUERY),
    sanityClient.fetch<SanityProduct[]>(ACTIVE_PRODUCTS_QUERY),
  ]);
  return [
    ...(services ?? []).map(mapServiceToItem),
    ...(products ?? []).map(mapProductToItem),
  ];
}

export async function fetchServices(): Promise<Item[]> {
  const services = await sanityClient.fetch<SanityService[]>(
    ACTIVE_SERVICES_QUERY
  );
  return (services ?? []).map(mapServiceToItem);
}

export async function fetchProducts(): Promise<Item[]> {
  const products = await sanityClient.fetch<SanityProduct[]>(
    ACTIVE_PRODUCTS_QUERY
  );
  return (products ?? []).map(mapProductToItem);
}

export async function fetchItemById(id: string): Promise<Item | null> {
  const [service, product] = await Promise.all([
    sanityClient.fetch<SanityService | null>(SERVICE_BY_ID_QUERY, { id }),
    sanityClient.fetch<SanityProduct | null>(PRODUCT_BY_ID_QUERY, { id }),
  ]);
  if (service) return mapServiceToItem(service);
  if (product) return mapProductToItem(product);
  return null;
}

export type HeroItem = {
  id: string;
  type: "image" | "video";
  src: string;
  title: string;
  order: number;
};

export async function fetchHeroItems(): Promise<HeroItem[]> {
  const items = await sanityClient.fetch<HeroItem[]>(HERO_LIST_QUERY);
  return items ?? [];
}

import { COUPON_PROJECTION } from "@repo/sanity";

export const COUPON_LIST_QUERY = `*[_type == "coupon"] | order(_createdAt desc) ${COUPON_PROJECTION}`;

export type Coupon = {
  id: string;
  title: string;
  type: string;
  code: string;
  icon: string;
  createdAt: string;
};

export async function fetchCoupons(): Promise<Coupon[]> {
  const items = await sanityClient.fetch<Coupon[]>(COUPON_LIST_QUERY);
  return items ?? [];
}

