import type { Product } from "./mock-data";
import { parseOrThrow, uploadImage } from "@/shared/lib/api-helpers";

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  return parseOrThrow<Product[]>(res, "Failed to load products");
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
  return parseOrThrow<Product>(res, "Failed to load product");
}

export async function createProduct(
  payload: Partial<Omit<Product, "id">>
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Product>(res, "Failed to create product");
}

export async function updateProduct(
  id: string,
  payload: Partial<Product>
): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Product>(res, "Failed to update product");
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  await parseOrThrow<{ success: boolean }>(res, "Failed to delete product");
}

export { uploadImage as uploadProductImage };
