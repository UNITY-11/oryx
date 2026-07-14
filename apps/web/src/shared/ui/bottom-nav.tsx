"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Phone, Calendar, Scissors, Brush } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  // Hide on detail pages
  if (pathname.startsWith("/service/")) {
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
    <nav className="w-full bg-white/90 backdrop-blur-xl rounded-t-4xl md:rounded-none md:bg-transparent md:h-full md:flex md:flex-col md:pt-12" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* Desktop Logo */}
      <div className="hidden md:flex flex-col items-center justify-center mb-12">
        <h1 className="font-serif text-4xl text-primary-dark">ORYX</h1>
        <p className="text-xs tracking-widest text-text-secondary mt-1 uppercase">Spa & Salon</p>
      </div>

      <div className="flex h-16 md:h-auto items-center justify-between px-6 md:flex-col md:gap-6 md:items-stretch md:px-8 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 md:top-0 md:relative md:w-full flex flex-col items-center justify-center focus:outline-none"
              >
                <div className={`flex h-14 w-14 md:h-12 md:w-full md:rounded-2xl items-center justify-center rounded-full shadow-spa transition-colors ${isActive ? 'bg-primary md:bg-primary-dark' : 'bg-primary md:bg-primary'} md:space-x-3`}>
                  <Icon className="h-6 w-6 text-surface md:h-5 md:w-5" strokeWidth={2.5} />
                  <span className="hidden md:block text-surface font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col md:flex-row items-center md:justify-start justify-center space-y-1 md:space-y-0 md:space-x-4 w-12 md:w-full md:px-4 md:py-3 md:rounded-2xl focus:outline-none transition-colors ${isActive ? 'text-primary md:bg-primary/10' : 'text-text-secondary hover:text-primary-dark md:hover:bg-primary/5'}`}
            >
              <Icon className="h-6 w-6 md:h-5 md:w-5 transition-transform hover:scale-110 md:hover:scale-100" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] md:text-sm md:font-medium font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
