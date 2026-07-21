import type { Customer } from "./mock-data";
import { parseOrThrow, uploadImage } from "@/shared/lib/api-helpers";

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch("/api/customers", { cache: "no-store" });
  return parseOrThrow<Customer[]>(res, "Failed to load customers");
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`, { cache: "no-store" });
  return parseOrThrow<Customer>(res, "Failed to load customer");
}

export async function createCustomer(
  payload: Partial<Omit<Customer, "id">>
): Promise<Customer> {
  const res = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Customer>(res, "Failed to create customer");
}

export async function updateCustomer(
  id: string,
  payload: Partial<Customer>
): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Customer>(res, "Failed to update customer");
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
  await parseOrThrow<{ success: boolean }>(res, "Failed to delete customer");
}

export { uploadImage as uploadCustomerAvatar };
