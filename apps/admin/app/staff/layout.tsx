import { cookies } from "next/headers";
import { PinLockModal } from "@/shared/ui/pin-lock-modal";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  // Read the secure cookie to check if the admin PIN has been entered
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
