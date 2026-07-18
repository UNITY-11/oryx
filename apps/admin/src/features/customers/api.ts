import type { Customer } from "./mock-data";

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

export async function uploadCustomerAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await parseOrThrow<{ url: string }>(
    res,
    "Failed to upload avatar"
  );
  return data.url;
}
