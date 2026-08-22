import { fetchServerBookings } from "@/features/bookings/api-server";
import { fetchServerCustomers } from "@/features/customers/api-server";
import { AdminDashboardClient } from "@/features/dashboard/dashboard-client";
import { fetchServerProducts } from "@/features/products/api-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [bookings, customers, products] = await Promise.all([
    fetchServerBookings(),
    fetchServerCustomers(),
    fetchServerProducts(),
  ]);

  const activeCustomerCount = customers.filter(
    (cust) => cust.status === "Active"
  ).length;

  const activeProductCount = products.filter(
    (prod) => prod.status === "Active"
  ).length;

  return (
    <AdminDashboardClient
      initialBookings={bookings}
      initialCustomerCount={activeCustomerCount}
      initialActiveProductCount={activeProductCount}
    />
  );
}
