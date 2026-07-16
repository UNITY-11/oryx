"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { Brush, Calendar, Home, Phone, Scissors, Search } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide on detail pages, EXCEPT for products
  if (pathname.startsWith("/service/")) {
    const id = pathname.split("/")[2];
    const item = ALL_MOCK_ITEMS.find((i) => i.id === id);
    if (!item?.isProduct) {
      return null;
    }
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
      className="w-full rounded-t-4xl bg-white/90 backdrop-blur-xl md:flex md:h-full md:flex-col md:rounded-none md:bg-transparent md:pt-12"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
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
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 flex flex-col items-center justify-center focus:outline-none md:relative md:top-0 md:w-full"
              >
                <div
                  className={`shadow-spa flex h-14 w-14 items-center justify-center rounded-full transition-colors md:h-12 md:w-full md:rounded-2xl ${isActive ? "bg-primary md:bg-primary-dark" : "bg-primary md:bg-primary"} md:space-x-3`}
                >
                  <Icon
                    className="text-surface h-6 w-6 md:h-5 md:w-5"
                    strokeWidth={2.5}
                  />
                  <span className="text-surface hidden text-sm font-medium md:block">
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-12 flex-col items-center justify-center space-y-1 transition-colors focus:outline-none md:w-full md:flex-row md:justify-start md:space-y-0 md:space-x-4 md:rounded-2xl md:px-4 md:py-3 ${isActive ? "text-primary md:bg-primary/10" : "text-text-secondary hover:text-primary-dark md:hover:bg-primary/5"}`}
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
