import { redirect } from "next/navigation";

// Staff admin UI is temporarily disabled — not in use right now.
// To re-enable: remove this redirect, uncomment the sidebar Staff link,
// and restore the PIN-lock layout below.
export default function StaffLayout({
  children: _children,
}: {
  children: React.ReactNode;
}) {
  redirect("/");
}

/*
import { cookies } from "next/headers";
import { PinLockModal } from "@/shared/ui/pin-lock-modal";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_pin_auth")?.value === "true";

  return (
    <>
      <div className={!isAuth ? "pointer-events-none filter blur-sm h-full w-full relative transition-all duration-300" : "h-full w-full relative"}>
        {children}
      </div>
      {!isAuth && <PinLockModal />}
    </>
  );
}
*/
