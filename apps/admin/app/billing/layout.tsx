import { redirect } from "next/navigation";

// Billing section is temporarily disabled — print invoices from booking details instead.
// Remove this redirect (and uncomment the sidebar Billing link) to re-enable.
export default function BillingLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/bookings");
}
