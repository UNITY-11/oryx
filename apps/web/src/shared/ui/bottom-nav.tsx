"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Calendar, Scissors, Brush } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide on detail pages
  if (pathname.startsWith("/service/")) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Scissors },
    { name: "Favorites", href: "/favorites", icon: Heart, isCenter: true },
    { name: "Booking", href: "/booking", icon: Calendar },
    { name: "Products", href: "/products", icon: Brush },
  ];

  return (
    <nav className="w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-safe">
      <div className="flex h-20 items-center justify-between px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-6 flex flex-col items-center justify-center focus:outline-none"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-spa transition-colors ${isActive ? 'bg-primary-dark' : 'bg-primary'}`}>
                  <Icon className="h-6 w-6 text-surface" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 w-12 focus:outline-none ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary-dark'}`}
            >
              <Icon className="h-6 w-6 transition-transform hover:scale-110" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
