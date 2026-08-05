import { redirect } from "next/navigation";

// Profile is temporarily hidden on the customer site.
export default function ProfileLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}
