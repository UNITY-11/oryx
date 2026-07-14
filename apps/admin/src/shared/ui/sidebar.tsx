"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, ShoppingBag, Briefcase, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Services", href: "/services", icon: Briefcase },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex p-4 pr-2">
      <aside className="flex flex-col w-64 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl h-full overflow-y-auto scrollbar-hide z-40 shrink-0 shadow-sm">
        <div className="p-8 flex flex-col items-center justify-center border-b border-primary/10 shrink-0">
          <Link href="/">
            <img src="/images/oryx-logo.png" alt="ORYX Admin Logo" className="h-16 w-auto object-contain brightness-75 contrast-125" />
          </Link>
          <p className="text-[10px] tracking-widest text-text-secondary mt-2 uppercase font-medium">Admin Portal</p>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-colors ${
                  isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-text-secondary hover:bg-primary/5 hover:text-primary-dark"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
