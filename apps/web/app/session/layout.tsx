import { redirect } from "next/navigation";

// Session details are temporarily hidden on the customer site.
export default function SessionLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}
