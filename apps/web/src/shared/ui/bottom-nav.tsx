"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brush, Calendar, Home, Phone, Scissors } from "lucide-react";

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
          // Hide bottom nav on service detail pages, keep it for products
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

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Scissors },
    { name: "Contact", href: "/contact", icon: Phone, isCenter: true },
    { name: "Products", href: "/products", icon: Brush },
    { name: "Booking", href: "/booking", icon: Calendar },
  ];

  return (
    <nav
      className="relative w-full rounded-t-4xl bg-white backdrop-blur-xl md:flex md:h-full md:flex-col md:rounded-none md:bg-transparent md:pt-12"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Flawless S-curve hump that merges with the button's border */}
      <svg
        className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-[100px] h-[16px] text-white pointer-events-none md:hidden"
        viewBox="0 0 110 16"
        fill="white"
      >
        <path d="M0 16 Q 15 16 25 8 T 55 0 T 85 8 T 110 16 Z" />
      </svg>
      {/* Desktop Logo */}
      <div className="mb-12 hidden flex-col items-center justify-center md:flex">
        <h1 className="text-surface font-serif text-4xl">ORYX</h1>
        <p className="text-text-secondary mt-1 text-xs tracking-widest uppercase">
          Spa & Salon
        </p>
      </div>

      <div className="flex h-16 w-full items-center justify-between px-6 md:h-auto md:flex-col md:items-stretch md:gap-6 md:px-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <div key={item.href} className="relative -top-4 flex flex-col items-center justify-center md:top-0 md:w-full shrink-0">
                <Link
                  href={item.href}
                  className="relative flex flex-col items-center justify-center focus:outline-none rounded-full border-[6px] border-white bg-white md:border-none md:bg-transparent z-10"
                >
                  <div
                    className={`shadow-spa flex h-14 w-14 items-center justify-center rounded-full transition-colors md:h-12 md:w-full md:rounded-2xl ${isActive ? "bg-[#e8baa0] md:bg-[#c29a63]" : "bg-[#e8baa0] md:bg-[#e8baa0]"} md:space-x-3`}
                  >
                    <Icon
                      className="text-white h-6 w-6 md:h-5 md:w-5"
                      strokeWidth={2.5}
                    />
                    <span className="text-white hidden text-sm font-medium md:block">
                      {item.name}
                    </span>
                  </div>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-12 flex-col items-center justify-center space-y-1 transition-colors focus:outline-none md:w-full md:flex-row md:justify-start md:space-y-0 md:space-x-4 md:rounded-2xl md:px-4 md:py-3 ${isActive ? "text-[#c8a24a] md:bg-[#e8baa0]/10" : "text-[#e8baa0] hover:text-[#c8a24a] md:hover:bg-[#e8baa0]/5"}`}
            >
              <Icon
                className="h-6 w-6 transition-transform hover:scale-110 md:h-5 md:w-5 md:hover:scale-100"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium md:text-sm md:font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
