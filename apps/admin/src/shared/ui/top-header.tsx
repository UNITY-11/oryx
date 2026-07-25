"use client";

import { Bell, UserCircle2, Menu, Plus, ChevronLeft, Search } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export function TopHeader() {
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const router = useRouter();
  const isAddingBooking = pathname === '/bookings' && searchParams.get('action') === 'add';
  const bookingStep = Number(searchParams.get('step')) || 1;

  if (
    pathname === '/calendar' || 
    pathname === '/analytics' || 
    pathname.startsWith('/bookings/') || 
    pathname === '/billing' ||
    (pathname.startsWith('/services/') && pathname !== '/services') ||
    (pathname.startsWith('/staff/') && pathname !== '/staff')
  ) {
    return null;
  }

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard Overview';
      case '/bookings': return 'Bookings Management';
      case '/services': return 'Services Management';
      case '/products': return 'Products Inventory';
      case '/customers': return 'Customers Directory';
      case '/reviews': return 'Reviews Management';
      case '/staff': return 'Staff Management';
      case '/settings': return 'Admin Settings';
      case '/notifications': return 'Notifications';
      default:
        if (pathname.startsWith('/services/')) return 'Service Details';
        if (pathname.startsWith('/products/')) return 'Product Details';
        if (pathname.startsWith('/customers/')) return 'Customer Details';
        if (pathname.startsWith('/reviews/')) return 'Review Details';
        if (pathname === '/hero') return 'Hero Section';
        if (pathname.startsWith('/hero/')) return 'Hero Slide Details';
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
              className="hover:border-primary/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <ChevronLeft className="text-text-secondary h-5 w-5" />
            </Link>
            <h1 className="font-serif text-2xl font-medium text-primary">
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
            <h1 className="font-serif text-2xl font-medium text-primary">{getPageTitle()}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          
          {pathname === '/staff' && (
            <div className="relative hidden md:block w-64 mr-2">
              <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff..."
                defaultValue={searchParams.get('search') || ''}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    params.set('search', e.target.value);
                  } else {
                    params.delete('search');
                  }
                  router.replace(`${pathname}?${params.toString()}`);
                }}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-9 text-sm shadow-sm outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

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

            {pathname === '/reviews' && (
              <Link
                href="/reviews/new"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Review</span>
              </Link>
            )}

            {pathname === '/staff' && (
              <Link
                href="/staff/new"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </Link>
            )}

            {pathname === '/hero' && (
              <Link
                href="/hero/new"
                className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2 whitespace-nowrap text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Slide</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
