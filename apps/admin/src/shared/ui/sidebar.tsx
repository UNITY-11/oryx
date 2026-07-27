"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  ClipboardCheck,
  Home,
  ImageIcon,
  MessageSquare,
  Receipt,
  // Settings, // Settings disabled for now
  ShoppingBag,
  // Ticket, // Coupons disabled for now
  UserCircle2,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { useSanityListener } from "../hooks/use-sanity-listener";
import { useSidebar } from "./sidebar-context";

const navClusters = [
  [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
  ],
  [
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Bookings", href: "/bookings", icon: ClipboardCheck },
    { name: "Billing", href: "/billing", icon: Receipt },
  ],
  [
    { name: "Services", href: "/services", icon: Briefcase },
    { name: "Products", href: "/products", icon: ShoppingBag },
  ],
  [
    { name: "Staff", href: "/staff", icon: UserCog },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Reviews", href: "/reviews", icon: MessageSquare },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ],
  [
    { name: "Hero Section", href: "/hero", icon: ImageIcon },
    // Coupons disabled for now — not in use
    // { name: "Coupons", href: "/coupons", icon: Ticket },
  ],
  [
    { name: "Company", href: "/company", icon: Building2 },
    // Settings disabled for now — not in use
    // { name: "Settings", href: "/settings", icon: Settings },
  ],
];

function SidebarNav({
  onNavigate,
  showClose,
}: {
  onNavigate?: () => void;
  showClose?: boolean;
}) {
  const pathname = usePathname();
  const { closeSidebar } = useSidebar();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n) => n.status === "Unread").length);
        }
      })
      .catch((err) =>
        console.error("Error fetching notifications for sidebar:", err)
      );
  };

  useEffect(() => {
    fetchNotifications();
  }, [pathname]);

  useSanityListener('*[_type == "notification"]', fetchNotifications);

  return (
    <aside className="border-primary/10 z-40 flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-3xl border bg-white shadow-sm md:w-64">
      <div className="border-primary/10 relative flex shrink-0 flex-col items-center justify-center border-b bg-white p-6 md:p-8">
        {showClose && (
          <button
            type="button"
            onClick={closeSidebar}
            className="text-text-secondary hover:bg-primary/5 absolute top-3 right-3 rounded-full p-2 transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <Link href="/" onClick={onNavigate}>
          <img
            src="/images/oryx-logo.png"
            alt="ORYX Admin Logo"
            className="h-14 w-auto object-contain brightness-75 contrast-125 md:h-16"
          />
        </Link>
        <p className="text-text-secondary mt-2 text-[10px] font-medium tracking-widest uppercase">
          Admin Portal
        </p>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-5">
        {navClusters.map((cluster, i) => (
          <div key={i}>
            {i > 0 && <div className="border-primary/10 mx-4 my-2 border-t" />}
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
                    onClick={onNavigate}
                    className={`flex items-center space-x-3 rounded-2xl px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-primary-dark hover:bg-primary/5"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-sm font-medium">
                      {item.name}
                    </span>
                    {item.name === "Notifications" && unreadCount > 0 && (
                      <span
                        className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                          isActive
                            ? "text-primary bg-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-primary/10 shrink-0 border-t p-4">
        <div className="bg-primary/5 flex items-center space-x-3 rounded-2xl p-3">
          <div className="border-primary/20 bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
            <UserCircle2 className="text-primary h-6 w-6" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-primary-dark truncate text-sm font-semibold">
              Admin User
            </span>
            <span className="text-text-secondary truncate text-xs">
              Manager
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar() {
  const { open, closeSidebar } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden h-full shrink-0 p-4 pr-0 md:flex">
        <SidebarNav />
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[80] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSidebar}
          aria-label="Close menu overlay"
        />
        <div
          className={`absolute top-0 left-0 flex h-full p-3 transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarNav onNavigate={closeSidebar} showClose />
        </div>
      </div>
    </>
  );
}
