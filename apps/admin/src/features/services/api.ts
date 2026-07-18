import type { Service } from "./mock-data";

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

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch("/api/services", { cache: "no-store" });
  return parseOrThrow<Service[]>(res, "Failed to load services");
}

export async function fetchService(id: string): Promise<Service> {
  const res = await fetch(`/api/services/${id}`, { cache: "no-store" });
  return parseOrThrow<Service>(res, "Failed to load service");
}

export async function createService(
  payload: Partial<Omit<Service, "id">>
): Promise<Service> {
  const res = await fetch("/api/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Service>(res, "Failed to create service");
}

export async function updateService(
  id: string,
  payload: Partial<Service>
): Promise<Service> {
  const res = await fetch(`/api/services/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Service>(res, "Failed to update service");
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
  await parseOrThrow<{ success: boolean }>(res, "Failed to delete service");
}

export async function uploadServiceImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await parseOrThrow<{ url: string }>(
    res,
    "Failed to upload image"
  );
  return data.url;
}
