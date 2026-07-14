"use client";

import { Bell, UserCircle2, Menu, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function TopHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard Overview';
      case '/bookings': return 'Bookings Management';
      case '/services': return 'Services Management';
      case '/products': return 'Products Inventory';
      case '/customers': return 'Customers Directory';
      case '/settings': return 'Admin Settings';
      case '/notifications': return 'Notifications';
      default:
        if (pathname.startsWith('/services/')) return 'Service Details';
        if (pathname.startsWith('/products/')) return 'Product Details';
        if (pathname.startsWith('/customers/')) return 'Customer Details';
        return 'Admin Portal';
    }
  };

  return (
    <div className="px-4 md:px-8 pt-4 pb-4">
      <header className="w-full h-20 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
        <div className="flex items-center space-x-4 flex-1">
          <button className="md:hidden p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:flex">
            <h1 className="font-serif text-2xl font-medium text-primary-dark">{getPageTitle()}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">

          <div className="flex items-center pl-3 md:pl-5 md:border-l border-primary/10">
            {pathname === '/' && (
              <button className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap text-sm">
                Download Report
              </button>
            )}

            {pathname === '/bookings' && (
              <Link
                href="/bookings?action=add"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Walk-in</span>
              </Link>
            )}

            {pathname === '/services' && (
              <Link
                href="/services/new"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </Link>
            )}

            {pathname === '/products' && (
              <Link
                href="/products/new"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            )}

            {pathname === '/customers' && (
              <Link
                href="/customers/new"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
