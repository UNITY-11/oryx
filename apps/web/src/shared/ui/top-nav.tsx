"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, Calendar, Scissors, Brush, User } from "lucide-react";

export function TopNav() {
  const pathname = usePathname();

  const leftNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Scissors },
    { name: "Products", href: "/products", icon: Brush },
    { name: "Booking", href: "/booking", icon: Calendar },
  ];

  return (
    <nav className="hidden md:flex w-full bg-white/90 backdrop-blur-xl border border-primary/10 rounded-full px-8 py-4 items-center justify-between z-50 shrink-0 shadow-sm">
      {/* Left side: Links */}
      <div className="flex items-center space-x-3 flex-1">
        {leftNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
                isActive 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-transparent text-text-secondary hover:border-primary/30 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Center: Logo */}
      <div className="flex flex-col items-center justify-center shrink-0">
        <Link href="/">
          <img src="/images/oryx-logo.png" alt="ORYX Logo" className="h-12 w-auto object-contain brightness-75 contrast-125" />
        </Link>
      </div>

      {/* Right side: Search, Favorites & Profile */}
      <div className="flex items-center justify-end space-x-4 flex-1">
        <div className="relative w-48 xl:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search treatments or products..."
            className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
          />
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <Link href="/favorites" className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
          </Link>
          <Link href="/profile" className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
