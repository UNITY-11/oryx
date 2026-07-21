import type { Service } from "./mock-data";
import { parseOrThrow, uploadImage } from "@/shared/lib/api-helpers";

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

export { uploadImage as uploadServiceImage };
