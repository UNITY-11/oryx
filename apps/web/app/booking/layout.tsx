import { redirect } from "next/navigation";

// Booking is temporarily hidden on the customer site.
export default function BookingLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}
