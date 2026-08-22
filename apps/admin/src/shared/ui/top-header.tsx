"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { ChevronLeft, Plus } from "lucide-react";

export function TopHeader() {
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const isAddingBooking =
    pathname === "/bookings" && searchParams.get("action") === "add";
  const bookingStep = Number(searchParams.get("step")) || 1;

  if (
    pathname === "/calendar" ||
    pathname === "/analytics" ||
    pathname.startsWith("/bookings/") ||
    // Billing disabled for now
    // pathname === "/billing" ||
    pathname === "/company" ||
    pathname === "/promotional-banner" ||
    (pathname.startsWith("/services/") && pathname !== "/services") ||
    // Staff disabled for now
    // (pathname.startsWith("/staff/") && pathname !== "/staff") ||
    (pathname.startsWith("/products/") && pathname !== "/products") ||
    (pathname.startsWith("/customers/") && pathname !== "/customers") ||
    (pathname.startsWith("/hero/") && pathname !== "/hero") ||
    (pathname.startsWith("/reviews/") && pathname !== "/reviews")
    // Coupons disabled for now
    // || (pathname.startsWith("/coupons/") && pathname !== "/coupons")
  ) {
    return null;
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard Overview";
      case "/bookings":
        return "Bookings Management";
      case "/services":
        return "Services Management";
      case "/products":
        return "Products Inventory";
      case "/customers":
        return "Customers Directory";
      case "/reviews":
        return "Reviews Management";
      // Staff disabled for now
      // case "/staff":
      //   return "Staff Management";
      // Settings disabled for now
      // case "/settings":
      //   return "Admin Settings";
      case "/company":
        return "Company Details";
      case "/notifications":
        return "Notifications";
      case "/account":
        return "Account Security";
      default:
        if (pathname.startsWith("/services/")) return "Service Details";
        if (pathname.startsWith("/products/")) return "Product Details";
        if (pathname.startsWith("/customers/")) return "Customer Details";
        if (pathname.startsWith("/reviews/")) return "Review Details";
        if (pathname === "/hero") return "Hero Section";
        if (pathname.startsWith("/hero/")) return "Hero Slide Details";
        return "Admin Portal";
    }
  };

  const BOOKING_TOTAL_STEPS = 4;
  const displayBookingStep = Math.min(
    Math.max(bookingStep, 1),
    BOOKING_TOTAL_STEPS
  );

  const getBookingStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Select Service";
      case 2:
        return "Choose Date";
      case 3:
        return "Choose Time";
      case 4:
        return "Client Details";
      default:
        return "New Booking";
    }
  };

  if (isAddingBooking) {
    return (
      <div className="px-4 pt-4 pb-4 md:pr-8 md:pl-4">
        <header className="border-primary/10 z-30 flex h-20 w-full shrink-0 items-center justify-between rounded-3xl border bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="flex flex-1 items-center space-x-2 sm:space-x-4">
            <MobileMenuButton />
            <Link
              href={
                displayBookingStep > 1
                  ? `/bookings?action=add&step=${displayBookingStep - 1}`
                  : "/bookings"
              }
              className="hover:border-primary/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <ChevronLeft className="text-text-secondary h-5 w-5" />
            </Link>
            <h1 className="text-primary-dark truncate font-serif text-lg font-medium sm:text-2xl">
              {getBookingStepTitle(displayBookingStep)}
            </h1>
          </div>
          <div className="text-text-secondary shrink-0 text-sm font-medium">
            Step {displayBookingStep} of {BOOKING_TOTAL_STEPS}
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4 md:pr-8 md:pl-4">
      <header className="border-primary/10 z-30 flex h-20 w-full shrink-0 items-center justify-between rounded-3xl border bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-4">
          <MobileMenuButton />
          <div className="min-w-0">
            <h1 className="text-primary-dark truncate font-serif text-lg font-medium sm:text-2xl">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {pathname !== "/" && (
          <div className="flex shrink-0 items-center space-x-3">
            <div className="border-primary/10 flex items-center pl-3 md:border-l md:pl-5">
              {pathname === "/bookings" && !isAddingBooking && (
                <Link
                  href="/bookings?action=add&step=1"
                  className="bg-primary flex items-center space-x-2 rounded-full px-6 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Booking</span>
                </Link>
              )}

              {pathname === "/services" && (
                <Link
                  href="/services/new"
                  className="bg-primary flex items-center space-x-2 rounded-full px-3 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90 sm:px-6"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Service</span>
                </Link>
              )}

              {pathname === "/products" && (
                <Link
                  href="/products/new"
                  className="bg-primary flex items-center space-x-2 rounded-full px-3 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90 sm:px-6"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Product</span>
                </Link>
              )}

              {pathname === "/customers" && (
                <Link
                  href="/customers/new"
                  className="bg-primary flex items-center space-x-2 rounded-full px-6 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Customer</span>
                </Link>
              )}

              {pathname === "/reviews" && (
                <Link
                  href="/reviews/new"
                  className="bg-primary flex items-center space-x-2 rounded-full px-6 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Review</span>
                </Link>
              )}

              {/* Staff disabled for now
            {pathname === "/staff" && (
              <Link
                href="/staff/new"
                className="bg-primary flex items-center space-x-2 rounded-full px-6 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span>Add Staff Member</span>
              </Link>
            )}
            */}

              {pathname === "/hero" && (
                <Link
                  href="/hero/new"
                  className="bg-primary flex items-center space-x-2 rounded-full px-6 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Slide</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
