import { redirect } from "next/navigation";

// Coupons admin UI is temporarily disabled — not in use right now.
// Remove this redirect (and uncomment the sidebar Coupons link) to re-enable.
export default function CouponsLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}
