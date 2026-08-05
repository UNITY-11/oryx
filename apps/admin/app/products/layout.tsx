import { redirect } from "next/navigation";

// Products admin UI is temporarily disabled — not in use right now.
// Remove this redirect (and uncomment the sidebar Products link) to re-enable.
export default function ProductsLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}
