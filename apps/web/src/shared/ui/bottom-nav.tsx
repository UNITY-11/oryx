"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Phone, Scissors } from "lucide-react";

const leftNavItem = {
  name: "Services",
  href: "/services",
  icon: Scissors,
};

const centerNavItem = {
  name: "Home",
  href: "/",
  icon: Home,
};

const rightNavItem = {
  name: "Contact",
  href: "/contact",
  icon: Phone,
};

const desktopNavItems = [centerNavItem, leftNavItem, rightNavItem];

function SideLink({
  href,
  name,
  icon: Icon,
  isActive,
}: {
  href: string;
  name: string;
  icon: typeof Home;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full flex-row items-center justify-start space-x-4 rounded-2xl px-4 py-3 transition-colors focus:outline-none ${
        isActive
          ? "text-primary bg-background/10"
          : "text-background hover:text-primary hover:bg-background/5"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-sm font-medium">{name}</span>
    </Link>
  );
}

function MobileTab({
  href,
  name,
  icon: Icon,
  isActive,
  variant = "default",
}: {
  href: string;
  name: string;
  icon: typeof Home;
  isActive: boolean;
  variant?: "default" | "center";
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors focus:outline-none ${
        isActive ? "text-primary" : "text-background hover:text-primary"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center">
        {variant === "center" ? (
          <div className="shadow-spa bg-background flex h-10 w-10 items-center justify-center rounded-full">
            <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
        )}
      </div>
      <span className="text-[10px] leading-none font-medium">{name}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [hideForService, setHideForService] = useState(false);

  useEffect(() => {
    if (!pathname.startsWith("/service/")) {
      setHideForService(false);
      return;
    }

    const id = pathname.split("/")[2];
    if (!id) {
      setHideForService(false);
      return;
    }

    let cancelled = false;
    fetch(`/api/catalog/${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{ isProduct?: boolean }>;
      })
      .then((item) => {
        if (!cancelled) {
          setHideForService(Boolean(item) && !item?.isProduct);
        }
      })
      .catch(() => {
        if (!cancelled) setHideForService(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (hideForService) {
    return null;
  }

  const isHomeActive = pathname === centerNavItem.href;
  const isServicesActive = pathname === leftNavItem.href;
  const isContactActive = pathname === rightNavItem.href;

  return (
    <>
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-[100] md:hidden"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="mx-auto max-w-md px-4">
          <div className="flex items-stretch rounded-2xl border border-white/80 bg-white px-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <MobileTab
              href={leftNavItem.href}
              name={leftNavItem.name}
              icon={leftNavItem.icon}
              isActive={isServicesActive}
            />
            <MobileTab
              href={centerNavItem.href}
              name={centerNavItem.name}
              icon={centerNavItem.icon}
              isActive={isHomeActive}
              variant="center"
            />
            <MobileTab
              href={rightNavItem.href}
              name={rightNavItem.name}
              icon={rightNavItem.icon}
              isActive={isContactActive}
            />
          </div>
        </div>
      </nav>

      <nav className="hidden h-full w-full flex-col bg-transparent pt-12 md:flex">
        <div className="mb-12 flex flex-col items-center justify-center">
          <h1 className="text-surface font-serif text-4xl">ORYX</h1>
          <p className="text-text-secondary mt-1 text-xs tracking-widest uppercase">
            Spa & Salon
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-6 px-8">
          {desktopNavItems.map((item) => (
            <SideLink
              key={item.href}
              href={item.href}
              name={item.name}
              icon={item.icon}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
