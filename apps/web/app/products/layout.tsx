import { redirect } from "next/navigation";

// Products are temporarily hidden on the customer site.
// Remove this redirect to re-enable /products.
export default function ProductsLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}
