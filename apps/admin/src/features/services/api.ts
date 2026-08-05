import { parseOrThrow, uploadImage } from "@/shared/lib/api-helpers";
import {
  buildFetchPageQuery,
  type PaginatedResponse,
} from "@/shared/lib/pagination";

import type { Service } from "./types";
import type { ServiceFieldErrors } from "./validation";

export async function fetchServices(): Promise<Service[]> {
  const res = await fetch("/api/services", { cache: "no-store" });
  return parseOrThrow<Service[]>(res, "Failed to load services");
}

export async function fetchServicesPage(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<
  PaginatedResponse<Service, { activeCount: number; inactiveCount: number }>
> {
  const qs = buildFetchPageQuery(params);
  const res = await fetch(`/api/services?${qs}`, { cache: "no-store" });
  return parseOrThrow(res, "Failed to load services");
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

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = new Error(
      body?.error ?? "Failed to create service"
    ) as Error & {
      fieldErrors?: ServiceFieldErrors;
    };
    if (body?.errors) err.fieldErrors = body.errors;
    throw err;
  }

  return res.json();
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

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = new Error(
      body?.error ?? "Failed to update service"
    ) as Error & {
      fieldErrors?: ServiceFieldErrors;
    };
    if (body?.errors) err.fieldErrors = body.errors;
    throw err;
  }

  return res.json();
}

export async function deleteService(id: string): Promise<void> {
  const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
  await parseOrThrow<{ success: boolean }>(res, "Failed to delete service");
}

export { uploadImage as uploadServiceImage };
