import { fetchServerBookings } from "@/features/bookings/api-server";
import { fetchServerCustomers } from "@/features/customers/api-server";
import { AdminDashboardClient } from "@/features/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [bookings, customers] = await Promise.all([
    fetchServerBookings(),
    fetchServerCustomers(),
  ]);

  const activeCustomerCount = customers.filter(
    (cust) => cust.status === "Active"
  ).length;

  return (
    <AdminDashboardClient
      initialBookings={bookings}
      initialCustomerCount={activeCustomerCount}
    />
  );
}
