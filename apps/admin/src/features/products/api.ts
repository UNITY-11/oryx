import type { Product } from "./mock-data";

async function parseOrThrow<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? fallbackMessage);
  }
  return res.json();
}

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

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await parseOrThrow<{ url: string }>(
    res,
    "Failed to upload image"
  );
  return data.url;
}
