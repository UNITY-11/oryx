"use client";

import { Bell, UserCircle2, Menu, Plus, ChevronLeft } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export function TopHeader() {
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const isAddingBooking = pathname === '/bookings' && searchParams.get('action') === 'add';
  const bookingStep = Number(searchParams.get('step')) || 1;

  if (pathname === '/calendar' || pathname === '/analytics' || pathname.startsWith('/bookings/') || pathname === '/billing') {
    return null;
  }

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

  if (isAddingBooking) {
    return (
      <div className="px-4 md:pl-4 md:pr-8 pt-4 pb-4">
        <header className="w-full h-20 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <div className="flex items-center space-x-4 flex-1">
            <Link
              href={bookingStep > 1 ? `/bookings?action=add&step=${bookingStep - 1}` : "/bookings"}
              className="border-primary/10 hover:border-primary/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition-colors"
            >
              <ChevronLeft className="text-text-secondary h-5 w-5" />
            </Link>
            <h1 className="font-serif text-2xl font-medium text-primary-dark">
              {bookingStep === 1 ? "Select Service" : bookingStep === 2 ? "Choose Date & Time" : "Client Details"}
            </h1>
          </div>
          <div className="text-sm font-medium text-text-secondary">
            Step {bookingStep} of 3
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="px-4 md:pl-4 md:pr-8 pt-4 pb-4">
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

            {pathname === '/bookings' && !isAddingBooking && (
              <Link
                href="/bookings?action=add&step=1"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Booking</span>
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
