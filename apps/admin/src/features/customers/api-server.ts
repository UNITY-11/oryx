import { CUSTOMERS_LIST_QUERY } from "@/features/customers/sanity-queries";
import type { Customer } from "@/features/customers/types";
import { sanityClient } from "@/shared/lib/sanity/client";

export async function fetchServerCustomers(): Promise<Customer[]> {
  const customers = await sanityClient.fetch<Customer[]>(CUSTOMERS_LIST_QUERY);
  return customers;
}
