import { fetchServerBookingsPage } from "@/features/bookings/api-server";
import { BookingsClient } from "@/features/bookings/ui/bookings-client";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const initialData = await fetchServerBookingsPage(1, 20);
  return <BookingsClient initialData={initialData} />;
}
