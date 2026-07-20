"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart2,
  Calendar,
  ClipboardCheck,
  Receipt,
  Briefcase,
  ShoppingBag,
  Users,
  Bell,
  Settings,
  UserCircle2,
} from "lucide-react";

// ─── Nav items organised by purpose, separated by dividers ────────────────────
// Each sub-array is a visual cluster. No labels shown — order speaks for itself.
const navClusters = [
  // 1. Overview
  [
    { name: "Dashboard", href: "/",          icon: Home      },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
  ],
  // 2. Time & Operations
  [
    { name: "Calendar", href: "/calendar", icon: Calendar       },
    { name: "Bookings", href: "/bookings", icon: ClipboardCheck },
    { name: "Billing",  href: "/billing",  icon: Receipt        },
  ],
  // 3. Catalog
  [
    { name: "Services", href: "/services", icon: Briefcase   },
    { name: "Products", href: "/products", icon: ShoppingBag },
  ],
  // 4. People & Activity
  [
    { name: "Customers",     href: "/customers",     icon: Users },
    { name: "Notifications", href: "/notifications", icon: Bell  },
  ],
  // 5. Config
  [
    { name: "Settings", href: "/settings", icon: Settings },
  ],
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex p-4 pr-0">
      <aside className="flex flex-col w-64 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl h-full overflow-hidden z-40 shrink-0 shadow-sm">

        {/* Logo */}
        <div className="bg-white p-8 flex flex-col items-center justify-center border-b border-primary/10 shrink-0">
          <Link href="/">
            <img
              src="/images/oryx-logo.png"
              alt="ORYX Admin Logo"
              className="h-16 w-auto object-contain brightness-75 contrast-125"
            />
          </Link>
          <p className="text-[10px] tracking-widest text-text-secondary mt-2 uppercase font-medium">
            Admin Portal
          </p>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 py-5 overflow-y-auto scrollbar-hide">
          {navClusters.map((cluster, i) => (
            <div key={i}>
              {/* Subtle divider between clusters (not before the first) */}
              {i > 0 && (
                <div className="my-2 mx-4 border-t border-primary/10" />
              )}

              <div className="space-y-1">
                {cluster.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
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
            </div>
          ))}
        </div>

        {/* User card */}
        <div className="p-4 border-t border-primary/10 shrink-0">
          <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-2xl">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
              <UserCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-primary-dark truncate">Admin User</span>
              <span className="text-xs text-text-secondary truncate">Manager</span>
            </div>
          </div>
        </div>

      </aside>
    </div>
  );
}
