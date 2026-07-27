import { redirect } from "next/navigation";

// Settings admin UI is temporarily disabled — not in use right now.
// Remove this redirect (and uncomment the sidebar Settings link) to re-enable.
export default function SettingsLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}
