"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, Scissors, Brush, User, Phone } from "lucide-react";
import { useUserStore } from "@/shared/store";

export function TopNav() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  const leftNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Scissors },
    { name: "Products", href: "/products", icon: Brush },
    { name: "Booking", href: "/booking", icon: Calendar },
  ];

  const tabletNavItems = [
    ...leftNavItems,
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  if (pathname.startsWith("/service/")) {
    return null;
  }

  return (
    <nav className="hidden md:flex bg-white border-b border-background/10 px-8 py-4 items-center justify-between z-50 shrink-0 shadow-sm relative w-full lg:w-full lg:mx-0 lg:mt-0 lg:rounded-none md:w-[calc(100%-4rem)] md:mx-auto md:mt-6 md:rounded-full">

      {/* Left side: Links (Desktop) */}
      <div className="hidden lg:flex items-center space-x-3 flex-1">
        {leftNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors text-background ${isActive
                ? 'border-background bg-background/5'
                : 'border-transparent hover:border-background/30 hover:bg-gray-50'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Logo: Left on md, Center on lg */}
      <div className="flex flex-col justify-center flex-1 lg:flex-none items-start lg:items-center shrink-0">
        <Link href="/">
          <img src="/images/oryx-logo.png" alt="ORYX Logo" className="h-12 w-auto object-contain brightness-75 contrast-125" />
        </Link>
      </div>

      {/* Right side: Search, Favorites & Profile */}
      <div className="flex items-center justify-end space-x-4 flex-1">
        <div className="relative w-48 xl:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-background" />
          <input
            type="text"
            placeholder="Search treatments or products..."
            className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-9 pr-4 text-sm placeholder:text-background focus:ring-2 focus:ring-background outline-none transition-shadow"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link href="/profile" className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-background hover:text-[#c29a63] transition-colors">
            {user ? (
              <span className="font-semibold text-lg">{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="w-5 h-5" />
            )}
          </Link>
        </div>
      </div>

      {/* Tablet Floating Dock (md only) */}
      <div className="hidden md:flex lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-6 py-3 items-center space-x-6 z-[100]">
        {tabletNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-primary hover:bg-gray-50'}`}
            >
              <Icon className="w-6 h-6 mb-1.5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
